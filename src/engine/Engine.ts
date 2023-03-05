import { Howl } from "howler";
import { Assets, BaseTexture, Container, Graphics, Renderer, SCALE_MODES } from "pixi.js";
import { assert } from "ts-essentials";
import { SoundName, sounds } from "../assets/sounds";
import { TextureName, textures } from "../assets/textures";
import { cartridges } from "../cartridges";
import { BUTTONS, FPS, HEIGHT, WIDTH } from "../config";
import { GameObject, GameObjectParams } from "./GameObject";
import { sleep } from "./utils";

type TextPosition = "TopLeft" | "TopRight" | "BottomLeft" | "BottomRight" | "Center";

export type Position = [number, number];

export abstract class Cartridge {
  static title: string | undefined;
  abstract preload?(): Promise<void>;
  abstract tick(): boolean;
  abstract setup(): Promise<void> | void;
}

export type ButtonName = (typeof BUTTONS)[number]["name"];

export class Engine {
  private stage: Container;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentCartridge: Cartridge | undefined;
  private isRunning = false;

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

    // Set overlay font size relative to the actual size of the viewport.
    ["topleft", "topright", "bottomleft", "bottomright", "center"].forEach((c) => {
      const el = document.querySelector<HTMLDivElement>(`.gametext.${c}`)!;
      el.style.fontSize = `${el.offsetWidth / 45}pt`;
    });

    // Begin game loop.
    requestAnimationFrame(this.tick.bind(this));

    setTimeout(async () => {
      while (true) {
        await this.runCartridge("GameSelect");
      }
    }, 0);
  }

  private async runCartridge(name: keyof typeof cartridges) {
    console.log("start new cartridge");
    const Cartridge = cartridges[name];
    // Setup. Run `preload` while the title is showing. This may be game assets to download.
    const cartridge = new Cartridge();
    this.currentCartridge = cartridge;

    if (Cartridge.title) {
      this.setText(Cartridge.title.toUpperCase());
    }

    // Show title for a while and perform asset preload.
    await Promise.all([sleep(1300), this.currentCartridge.preload?.()]);
    await this.setText("");

    await this.currentCartridge.setup();
    this.isRunning = true;

    // Run.
    this.lastTime = performance.now(); // Ignore accumulated time until now.
    this.accumulatedTime = 0;

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
    this.gameObjects.clear();
    this.setText("");
  }

  private tick() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.tickDelta += deltaTime;
    this.lastTime = currentTime;

    if (this.currentCartridge && this.tickDelta > 1000 / FPS && this.isRunning) {
      this.isRunning = this.currentCartridge.tick();
      this.tickDelta = 0;
    }

    this.renderer.render(this.stage);

    requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Precache a subset of assets for a given game. This allows a game to decide what assets it wants to use, without
   * precaching all of them. As a result, the engine can provide a lot of assets but only prepare the ones needed.
   *
   * If an asset is used that isn't precached, it might cause a bit of lag as it waits to download it.
   */
  public precache(options: { sounds?: SoundName[]; textures?: TextureName[] }) {
    options.sounds?.forEach((s) => new Howl({ src: sounds[s], preload: true }));
    return Promise.all(options.textures?.map((a) => Assets.load(textures[a])) ?? []);
  }

  /**
   * Create a GameObject and assign it to the stage and collection of GameObjects. A developer can optionally add
   * additional attributes to a GameObject, as long as the attribute names aren't already in use by the GameObject. This
   * is for convenience to prevent having to access something like `myObj.attrs.myAttr` and instead have: `myObj.attr`.
   */
  public create<G extends Record<string, any> = Record<string, never>>(
    params: GameObjectParams & {
      attrs?: Omit<G, keyof GameObject | "tag">;
    }
  ): GameObject & G {
    const { attrs, ...rest } = params;
    const obj = new GameObject(rest);
    Object.assign(obj, attrs ?? {});
    this.gameObjects.set(obj.id, obj);
    this.stage.addChild(obj.sprite);

    return obj as GameObject & G;
  }

  /**
   * Clean up a GameObject by providing either the object or its ID.
   */
  public destroy(obj: number | GameObject) {
    const object = typeof obj === "number" ? this.gameObjects.get(obj) : obj;
    assert(object);
    this.stage.removeChild(object.sprite);
    this.gameObjects.delete(object.id);
  }

  /**
   * Return a collection of objects based on query parameters. The parameters are an intersection, meaning that it will
   * provide all objects that fit the provided tag AND if it is collidable.
   */
  public getObjects<T extends Record<string, any> = Record<string, never>>(options?: {
    collidable?: boolean;
    tag?: T["tag"];
  }): (T & GameObject)[] {
    return Array.from(this.gameObjects.values()).filter(
      (o) => (options?.collidable ? o.collides : true) && (options?.tag ? o.tag === options.tag : true)
    ) as (T & GameObject)[];
  }

  /**
   * Imperatively draw a texture using the `Pixi.Graphics` API, which is basically the Canvas drawing API.
   */
  public makeTexture(drawCallback: (graphics: Graphics) => void) {
    const g = new Graphics();
    drawCallback(g);
    return this.renderer.generateTexture(g);
  }

  /**
   * Set text on the screen in one of five positions. Optionally pick an alignment for the text, which is generally
   * only useful if you want the Center position to be centered or left justified. The text remains visible until it is
   * overwritten. Set an empty string to clear.
   */
  public setText(text: string, position: TextPosition = "Center", textAlign: "Left" | "Center" = "Left") {
    const element = document.querySelector<HTMLDivElement>(`.gametext.${position?.toLowerCase()}`)!;
    element.style.textAlign = textAlign?.toLowerCase();
    element.innerText = text;
    assert(element);
  }

  /**
   * Play a sound once. If a sound is not precached, it may not play the first time.
   */
  public playSound(name: SoundName) {
    const sound = new Howl({ src: sounds[name], volume: 0.5 });
    sound.play();
  }
}
