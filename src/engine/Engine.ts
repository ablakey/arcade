import { BaseTexture, Container, Graphics, Renderer, SCALE_MODES, Sprite, Texture } from "pixi.js";
import { GameObject } from "./GameObject";
import { TextureName, textures } from "./textures";

import { sleep } from "./utils";

const WIDTH = 160;
const HEIGHT = 120;
const FPS = 30; // Also the tickrate.
const TITLE_BLINK_DELAY = 350;
const TITLE_REVEAL_DELAY = 50;
const SHOW_TITLE = false;

const BUTTONS = [
  { name: "Up", codes: ["ArrowUp", "KeyW"] },
  { name: "Down", codes: ["ArrowDown", "KeyS"] },
  { name: "Left", codes: ["ArrowLeft", "KeyA"] },
  { name: "Right", codes: ["ArrowRight", "KeyD"] },
  { name: "Action", codes: ["Space"] },
] as const;

type ButtonName = (typeof BUTTONS)[number]["name"];

export class Engine {
  public gameObjects: GameObject[];
  public renderer: Renderer;
  private stage: Container;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentGame: Game | undefined;
  private isFinished: boolean;
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
    this.isFinished = false;

    /**
     * Set up I/O.
     */
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
  }

  public create<A extends Record<string, any>>(
    texture: Texture | TextureName,
    position: [number, number],
    attrs?: A
  ): GameObject & A {
    const tex = typeof texture === "string" ? Texture.from(textures[texture]) : texture;
    const obj = new GameObject();
    obj.sprite = new Sprite(tex);
    obj.x = position[0];
    obj.y = position[1];
    Object.assign(obj, attrs ?? {});
    this.gameObjects.push(obj);
    this.stage.addChild(obj.sprite);
    return obj as GameObject & A;
  }

  public generateTexture(drawCallback: (graphics: Graphics) => void) {
    const g = new Graphics();
    drawCallback(g);
    return this.renderer.generateTexture(g);
  }

  public async showTitle(text: string) {
    const titleEl = document.querySelector<HTMLDivElement>("#overlay")!;
    titleEl.style.fontSize = `${titleEl.offsetWidth / 20}pt`;

    // Reveal characters.
    for (let x = 0; x < text.length; x++) {
      titleEl.innerHTML = text.slice(0, x + 1).padEnd(text.length, " ");
      await sleep(TITLE_REVEAL_DELAY);
    }

    await sleep(TITLE_BLINK_DELAY - TITLE_REVEAL_DELAY);

    // Blink title.
    for (let x = 0; x < 3; x++) {
      titleEl.innerHTML = "".padEnd(text.length, " ");
      await sleep(TITLE_BLINK_DELAY);
      titleEl.innerHTML = text;
      await sleep(TITLE_BLINK_DELAY);
    }

    await sleep(TITLE_BLINK_DELAY);

    titleEl.innerHTML = "";
  }

  public async play(GameClass: new (engine: Engine) => Game) {
    // Setup.
    this.currentGame = new GameClass(this);
    if (SHOW_TITLE) {
      await this.showTitle(this.currentGame.title.toUpperCase());
    }

    await this.currentGame.setup();

    // Run.
    this.lastTime = performance.now(); // Ignore accumulated time until now.
    this.accumulatedTime = 0;
    requestAnimationFrame(this.tick.bind(this));

    // Wait until finished.
    while (true) {
      if (this.isFinished) {
        break;
      }

      await sleep(500);
    }

    // Cleanup.
    // this.currentGame?.end();
    this.currentGame = undefined;
    this.stage.removeChildren();
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

    if (this.accumulatedTime > this.tickLength) {
      this.currentGame?.tick();
      this.renderer.render(this.stage);
      this.accumulatedTime = 0;
    }

    requestAnimationFrame(this.tick.bind(this));
  }
}

export abstract class Game {
  abstract tick(): void;
  abstract setup(): Promise<void> | void;
  public title = "<NO NAME>";
  protected engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }
}
