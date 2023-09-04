import { Howl } from "howler";
import { Assets, BaseTexture, Container, Graphics, Renderer, SCALE_MODES, Texture } from "pixi.js";
import { assert } from "ts-essentials";
import { SoundName, sounds } from "../assets/sounds";
import { TextureName, textures } from "../assets/textures";
import { CartridgeName, cartridges } from "../cartridges";
import { BUTTONS, FPS, HEIGHT, WIDTH } from "../config";
import { GameObject, GameObjectParams } from "./GameObject";
import { sleep } from "./utils";
import { Pos } from "./Pos";

export abstract class Cartridge {
  static readonly title?: string;
  abstract preload(): Promise<void>;
  abstract tick(): boolean | void;
  abstract setup(): Promise<void> | void;
}

export type ButtonName = (typeof BUTTONS)[number]["name"];

export class Engine {
  private renderContainer: Container;
  private stage: Container;
  private stageAbsolute: Container;

  private lastTime = 0;
  private currentCartridge: Cartridge | undefined;
  private isRunning = false;

  private precached: { sounds: SoundName[]; textures: TextureName[] };

  public now = 0;
  public nextCartridge: CartridgeName | null = null;
  public gameObjects: Map<number, GameObject> = new Map();
  public renderer: Renderer;
  public buttons = Object.fromEntries(BUTTONS.map(({ name }) => [name, false])) as Record<ButtonName, boolean>;
  public tickDelta = 0; // The number of ms since the previous tick.
  public readonly width: number;
  public readonly height: number;

  constructor() {
    // Required, otherwise all textures get linear interpolation and look fuzzy.
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    this.width = WIDTH;
    this.height = HEIGHT;
    this.renderer = new Renderer({
      antialias: false,
      view: document.querySelector("#viewport")! as HTMLCanvasElement,
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: 0x000000,
    });

    this.stage = new Container();
    this.stage.sortableChildren = true;

    this.stageAbsolute = new Container();
    this.stageAbsolute.sortableChildren = true;

    this.renderContainer = new Container();
    this.renderContainer.addChild(this.stage);
    this.renderContainer.addChild(this.stageAbsolute);

    const buttonDown = (name: ButtonName, e: Event) => {
      document.querySelector(`#button${name}`)!.classList.add("active");
      this.buttons[name] = true;
      e.preventDefault();
    };

    const buttonUp = (name: ButtonName) => {
      this.buttons[name] = false;
      document.querySelector(`#button${name}`)!.classList.remove("active");
    };

    // Bind mouse and touch inputs for buttons.
    BUTTONS.forEach(({ name }) => {
      const buttonEl = document.querySelector<HTMLButtonElement>(`#button${name}`)!;
      ["mousedown", "touchstart"].forEach((c) => buttonEl.addEventListener(c, (e: Event) => buttonDown(name, e)));
      ["mouseup", "mouseleave", "touchend"].forEach((c) => buttonEl.addEventListener(c, () => buttonUp(name)));
    });

    // Bind keydown.
    document.addEventListener("keydown", (e) => {
      const button = BUTTONS.find((b) => (b.codes as readonly string[]).includes(e.code));
      if (button) {
        buttonDown(button.name, e);
      }
    });

    // Bind keyup.
    document.addEventListener("keyup", (e) => {
      const button = BUTTONS.find((b) => (b.codes as readonly string[]).includes(e.code));
      if (button) {
        buttonUp(button.name);
      }
    });

    // Begin game loop.
    requestAnimationFrame(this.tick.bind(this));

    setTimeout(async () => {
      const requestedGame = new URLSearchParams(window.location.search).get("game")?.toLowerCase() ?? "";
      let cartridgeName: CartridgeName = "GameSelect";
      Object.keys(cartridges).forEach((c) => {
        if (c.toLowerCase() === requestedGame) {
          cartridgeName = c as CartridgeName;
        }
      });
      this.runCartridge(cartridgeName);
    }, 0);
  }

  public async runCartridge(name: CartridgeName) {
    window.history.pushState("", "", `?game=${name.toLowerCase()}`);

    const Cartridge = cartridges[name];
    // Setup. Run `preload` while the title is showing. This may be game assets to download.
    const cartridge = new Cartridge();
    this.currentCartridge = cartridge;

    if (Cartridge.title) {
      this.create({ text: Cartridge.title.toUpperCase(), position: [80, 60], lifetime: 1600 });
      await sleep(1600);
      await this.currentCartridge.preload?.();
    }

    await this.currentCartridge.setup();
    this.isRunning = true;
    this.tickDelta = 0;

    // Run.
    this.lastTime = performance.now(); // Ignore accumulated time until now.

    // Wait until finished.
    while (true) {
      if (!this.isRunning) {
        break;
      }
      await sleep(100);
    }

    // Cleanup.
    this.currentCartridge = undefined;
    this.stage.removeChildren();
    this.stageAbsolute.removeChildren();
    this.gameObjects.clear();
    this.setCamera([this.width / 2, this.height / 2]);

    setTimeout(() => {
      this.runCartridge(this.nextCartridge ?? "GameSelect");
      this.nextCartridge = null;
    }, 0);
  }

  private tick() {
    this.now = performance.now();
    const deltaTime = this.now - this.lastTime;
    this.tickDelta += deltaTime;
    this.lastTime = this.now;

    this.gameObjects.forEach((o) => {
      if (o.lifetime !== undefined && o.lifetime + o.created < this.now) {
        this.destroy(o);
      }
    });

    if (this.currentCartridge && this.tickDelta > 1000 / FPS && this.isRunning) {
      this.isRunning = !(this.currentCartridge.tick() ?? false);
      this.tickDelta = 0;
    }

    this.renderer.render(this.renderContainer);

    requestAnimationFrame(this.tick.bind(this));
  }

  checkCache(texture?: Texture | TextureName) {
    if (typeof texture === "string" && !engine.precached.textures.includes(texture)) {
      console.warn(`Tried to create GameObject with texture: ${texture}, which was not precached.`);
    }
  }

  /**
   * Precache a subset of assets for a given game. This allows a game to decide what assets it wants to use, without
   * precaching all of them. As a result, the engine can provide a lot of assets but only prepare the ones needed.
   *
   * If an asset is used that isn't precached, it might cause a bit of lag as it waits to download it.
   */
  public precache(options: { sounds?: SoundName[]; textures?: TextureName[] }) {
    this.precached = { sounds: [], textures: [], ...options };
    options.sounds?.forEach((s) => new Howl({ src: sounds[s], preload: true }));
    return Promise.all(options.textures?.map((a) => Assets.load(textures[a])) ?? []);
  }

  /**
   * Create a GameObject and assign it to the stage and collection of GameObjects. A developer can optionally add
   * additional attributes to a GameObject as part of the `attrs` object.
   */
  public create<G extends GameObject>(params: GameObjectParams<G["data"]>): G {
    this.checkCache(params.texture);

    const obj = new GameObject(params);
    this.gameObjects.set(obj.id, obj);

    if (obj.absolute) {
      this.stageAbsolute.addChild(obj.sprite);
    } else {
      this.stage.addChild(obj.sprite);
    }

    return obj as G;
  }

  /**
   * Clean up a GameObject by providing either the object or its ID.
   */
  public destroy(obj: number | GameObject) {
    const object = typeof obj === "number" ? this.gameObjects.get(obj) : obj;
    assert(object);

    if (object.absolute) {
      this.stageAbsolute.removeChild(object.sprite);
    } else {
      this.stage.removeChild(object.sprite);
    }
    this.gameObjects.delete(object.id);
  }

  /**
   * Return a collection of objects based on query parameters. The parameters are an intersection, meaning that it will
   * provide all objects that fit the provided tag AND if it is collidable.
   */
  public getObjects<G extends GameObject>(options?: { collidable?: boolean; tag?: string }): G[] {
    return Array.from(this.gameObjects.values()).filter(
      (o) => (options?.collidable ? o.collides : true) && (options?.tag ? o.tag === options.tag : true)
    ) as G[];
  }

  /**
   * Imperatively draw a texture using the `Pixi.Graphics` API, which is basically the Canvas drawing API.
   */
  public drawTexture(drawCallback: (graphics: Graphics) => void) {
    const g = new Graphics();
    drawCallback(g);
    this.renderer;
    return this.renderer.generateTexture(g);
  }

  /**
   * Play a sound once. If a sound is not precached, it may not play the first time.
   */
  public playSound(name: SoundName) {
    if (!this.precached.sounds.includes(name)) {
      console.warn(`Tried to create GameObject with sound: ${name}, which was not precached.`);
    }

    const sound = new Howl({ src: sounds[name], volume: 0.5 });
    sound.play();
  }

  public setCamera(position: Pos) {
    this.stage.pivot.x = position[0];
    this.stage.pivot.y = position[1];
    this.stage.position.x = this.renderer.width / 2;
    this.stage.position.y = this.renderer.height / 2;
  }
}
