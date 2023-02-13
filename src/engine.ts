import { BaseTexture, Container, Renderer, SCALE_MODES } from "pixi.js";
import { Game } from "./Game";
import { GameObject, SpriteName } from "./GameObject";

import { sleep } from "./utils";

const FPS = 60;
const TITLE_BLINK_DELAY = 500;
const TITLE_REVEAL_DELAY = 75;

const BUTTONS = [
  { name: "Up", codes: ["ArrowUp", "KeyW"] },
  { name: "Down", codes: ["ArrowDown", "KeyS"] },
  { name: "Left", codes: ["ArrowLeft", "KeyA"] },
  { name: "Right", codes: ["ArrowRight", "KeyD"] },
  { name: "Space", codes: ["Space"] },
] as const;

type ButtonName = (typeof BUTTONS)[number]["name"];

export class Engine {
  public stage: Container;
  private renderer: Renderer;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentGame: Game | undefined;
  private input: Record<ButtonName, boolean>;

  constructor() {
    // Required, otherwise all textures get linear interpolation and look fuzzy.
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    this.renderer = new Renderer({
      antialias: false,
      view: document.querySelector("#viewport")! as HTMLCanvasElement,
      width: 160,
      height: 120,
      backgroundColor: 0x000000,
    });

    this.stage = new Container();

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

    this.input = Object.fromEntries(BUTTONS.map(({ name }) => [name, false])) as Record<
      ButtonName,
      boolean
    >;

    (
      [
        ["keydown", this.buttonDown],
        ["keyup", this.buttonUp],
      ] as const
    ).forEach(([code, callback]) => {
      document.addEventListener(code, (e) => {
        const button = BUTTONS.find((b) => (b.codes as readonly string[]).includes(e.code));
        if (button) {
          callback(button.name, e);
        }
      });
    });

    /**
     * Begin engine loop.
     */
    requestAnimationFrame(this.tick.bind(this));
  }

  public addGameObject(name: SpriteName, x: number, y: number): GameObject {
    const s = GameObject.create(name, x, y);
    this.stage.addChild(s);
    return s;
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

  public async play(Game: { new (engine: Engine): Game }) {
    // Setup.
    this.currentGame = new Game(this);
    await this.showTitle(this.currentGame.title.toUpperCase());

    // Run.
    await this.currentGame.play();

    // Cleanup.
    this.currentGame?.end();
    this.currentGame = undefined;
    this.stage.removeChildren();
  }

  private buttonDown(name: ButtonName, e: Event) {
    document.querySelector(`#button${name}`)!.classList.add("active");
    e.preventDefault();
  }

  private buttonUp(name: ButtonName) {
    document.querySelector(`#button${name}`)!.classList.remove("active");
  }

  private tick() {
    console.log(1);
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.accumulatedTime += deltaTime;
    this.lastTime = currentTime;

    this.currentGame?.tick(deltaTime);

    if (this.accumulatedTime > 1000 / FPS) {
      this.accumulatedTime -= 1000 / FPS;
      this.renderer.render(this.stage);
    }

    requestAnimationFrame(this.tick.bind(this));
  }
}
