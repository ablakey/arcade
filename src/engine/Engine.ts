import { Howl } from "howler";
import { Assets, BaseTexture, Container, Graphics, Renderer, SCALE_MODES, Sprite, Texture } from "pixi.js";
import { assert } from "ts-essentials";
import { SoundName, sounds } from "../assets/sounds";
import { TextureName, textures } from "../assets/textures";
import { cartridges } from "../cartridges";
import { SpyBalloon } from "../cartridges/SpyBalloon";
import { BUTTONS, FPS, HEIGHT, WIDTH } from "../config";
import { GameObject } from "./GameObject";
import { sleep } from "./utils";

type TextPosition = "TopLeft" | "TopRight" | "BottomLeft" | "BottomRight" | "Center";

export type Position = [number, number];

export abstract class Cartridge {
  static title?: string;
  abstract preload?(): Promise<void>;
  abstract tick(): void;
  abstract setup(): Promise<void> | void;
}

// export interface Cartridge {
//   preload?(): Promise<void>;
//   tick(): void;
//   setup(): Promise<void> | void;
//   title?: string;
// }

export type ButtonName = (typeof BUTTONS)[number]["name"];

export class Engine {
  private stage: Container;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentCartridge: Cartridge | undefined;
  private nextId = 0;
  private isRunning = false;

  public score = 0;
  public gameObjects: Map<number, GameObject> = new Map();
  public renderer: Renderer;
  public input: Record<ButtonName, boolean>;
  public tickLength: number;
  public readonly width: number;
  public readonly height: number;

  constructor() {
    // Required, otherwise all textures get linear interpolation and look fuzzy.
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    this.width = WIDTH;
    this.height = HEIGHT;
    this.tickLength = 1000 / FPS;
    this.renderer = new Renderer({
      antialias: false,
      view: document.querySelector("#viewport")! as HTMLCanvasElement,
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: 0x000000,
    });

    this.stage = new Container();

    BUTTONS.forEach(({ name }) => {
      const buttonName = name as ButtonName;
      const buttonEl = document.querySelector<HTMLButtonElement>(`#button${name}`)!;
      const boundDown = this.buttonDown.bind(this, buttonName);
      const boundUp = this.buttonUp.bind(this, buttonName);
      ["mousedown", "touchstart"].forEach((c) => buttonEl.addEventListener(c, boundDown));
      ["mouseup", "mouseleave", "touchend"].forEach((c) => buttonEl.addEventListener(c, boundUp));
    });

    this.input = Object.fromEntries(BUTTONS.map(({ name }) => [name, false])) as Record<ButtonName, boolean>;

    (
      [
        ["keydown", this.buttonDown.bind(this)],
        ["keyup", this.buttonUp.bind(this)],
      ] as const
    ).forEach(([code, callback]) => {
      document.addEventListener(code, (e) => {
        const button = BUTTONS.find((b) => (b.codes as readonly string[]).includes(e.code));
        if (button) {
          callback(button.name, e);
        }
      });
    });

    // Set overlay font size relative to the actual size of the viewport.
    ["topleft", "topright", "bottomleft", "bottomright", "center"].forEach((c) => {
      const el = document.querySelector<HTMLDivElement>(`.gametext.${c}`)!;
      el.style.fontSize = `${el.offsetWidth / 45}pt`;
    });
  }

  public start() {
    this.runCartridge(SpyBalloon);
  }

  // /**
  //  * An infinite loop that is either running a game or providing UI to pick a game.
  //  */
  // public async runEngine() {
  //   while (true) {
  //     await this.setText("PRESS SPACE TO START");
  //     while (true) {
  //       if (this.input.Action) {
  //         break;
  //       }
  //       await sleep(10);
  //     }

  //     for (const cartridge of cartridges) {
  //       await this.runCartridge(cartridge);
  //     }

  //     await this.setText("GAME OVER");
  //     await sleep(3000);
  //     await this.setText(`TOTAL SCORE: ${this.score}`);
  //     await sleep(4000);
  //   }
  // }

  private async runCartridge(name: keyof typeof cartridges) {
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
    requestAnimationFrame(this.tick.bind(this));

    // Wait until finished.
    while (true) {
      if (!this.isRunning) {
        break;
      }
      await sleep(500);
    }

    // Post-game report.
    // TODO

    // Cleanup.
    this.currentCartridge = undefined;
    this.stage.removeChildren();
    this.gameObjects.clear();
    this.setText("");
  }

  private buttonDown(name: ButtonName, e: Event) {
    document.querySelector(`#button${name}`)!.classList.add("active");
    this.input[name] = true;
    e.preventDefault();
  }

  private buttonUp(name: ButtonName) {
    this.input[name] = false;
    document.querySelector(`#button${name}`)!.classList.remove("active");
  }

  private tick() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.accumulatedTime += deltaTime;
    this.lastTime = currentTime;

    if (this.accumulatedTime > this.tickLength && this.isRunning) {
      this.currentCartridge?.tick();
      this.accumulatedTime = 0;
    }

    this.renderer.render(this.stage);

    requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Public interfaces for cartridges to use to interact with the system.
   */

  get now() {
    return performance.now();
  }

  public addScore(score: number) {
    this.score += score;
    engine.setText(`SCORE: ${this.score}`, "TopRight");
  }

  public precache(options: { sounds?: SoundName[]; textures?: TextureName[] }) {
    options.sounds?.forEach((s) => new Howl({ src: sounds[s], preload: true }));
    return Promise.all(options.textures?.map((a) => Assets.load(textures[a])) ?? []);
  }

  public create<G extends Record<string, any> = Record<string, never>>(params: {
    texture: Texture | TextureName;
    position: Position;
    attrs?: Omit<G, keyof GameObject | "tag">;
    tag?: string;
    collides?: boolean;
  }): GameObject & G {
    const { texture, position, attrs, tag, collides } = params;
    const tex = typeof texture === "string" ? Texture.from(textures[texture]) : texture;
    const obj = new GameObject();
    obj.sprite = new Sprite(tex);
    obj.x = position[0];
    obj.y = position[1];
    obj.id = this.nextId++;
    obj.sprite.anchor.set(0.5);
    obj.tag = tag;
    obj.collides = collides ?? false;
    obj.created = performance.now();
    Object.assign(obj, attrs ?? {});

    this.gameObjects.set(obj.id, obj);
    this.stage.addChild(obj.sprite);

    return obj as GameObject & G;
  }

  public destroy(obj: number | GameObject) {
    const object = typeof obj === "number" ? this.gameObjects.get(obj) : obj;
    assert(object);
    this.stage.removeChild(object.sprite);
    this.gameObjects.delete(object.id);
  }

  public getObjects<T extends Record<string, any> = Record<string, never>>(options?: {
    collidable?: boolean;
    tag?: T["tag"];
  }): (T & GameObject)[] {
    let objects = Array.from(this.gameObjects.values());

    if (options?.collidable) {
      objects = objects.filter((o) => o.collides);
    }

    if (options?.tag) {
      objects = objects.filter((o) => o.tag === options.tag);
    }

    return objects as (T & GameObject)[];
  }

  public generateTexture(drawCallback: (graphics: Graphics) => void) {
    const g = new Graphics();
    drawCallback(g);
    return this.renderer.generateTexture(g);
  }

  public finishGame() {
    this.isRunning = false;
  }

  public setText(text: string, position: TextPosition = "Center", textAlign: "Left" | "Center" = "Left") {
    const element = document.querySelector<HTMLDivElement>(`.gametext.${position?.toLowerCase()}`)!;
    element.style.textAlign = textAlign?.toLowerCase();
    element.innerText = text;
    assert(element);
  }

  public playSound(name: SoundName) {
    const sound = new Howl({ src: sounds[name], volume: 0.5 });
    sound.play();
  }
}
