import { BaseTexture, Container, Rectangle, Renderer, SCALE_MODES } from "pixi.js";
import { GameObject, SpriteName } from "./GameObject";
import { BalloonShoot } from "./games/balloonShoot";

import { Game } from "./types";

const FPS = 60;

const GAMES = [BalloonShoot];

const ASPECT = 4 / 3;

const WIDTH = 800;

const HEIGHT = WIDTH / ASPECT;

const BUTTONS = [
  { name: "Up", codes: ["ArrowUp", "KeyW"] },
  { name: "Down", codes: ["ArrowDown", "KeyS"] },
  { name: "Left", codes: ["ArrowLeft", "KeyA"] },
  { name: "Right", codes: ["ArrowRight", "KeyD"] },
  { name: "A", codes: ["Space"] },
  { name: "B", codes: ["ShiftLeft", "ShiftRight"] },
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
      width: WIDTH,
      height: WIDTH / ASPECT,
      backgroundColor: 0x000000,
    });

    this.stage = new Container();
    this.stage.scale = { x: HEIGHT / 100, y: HEIGHT / 100 };
    this.stage.filterArea = new Rectangle(0, 0, WIDTH, HEIGHT);

    this.pickRandomGame();
    requestAnimationFrame(this.tick.bind(this));

    // Bind keys.
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
  }

  public addGameObject(name: SpriteName, x: number, y: number): GameObject {
    const s = GameObject.create(name, x, y);
    this.stage.addChild(s);
    return s;
  }

  private pickRandomGame() {
    this.stage.removeChildren();
    const PickedGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    this.currentGame = new PickedGame(this);
  }

  private buttonDown(name: ButtonName, e: Event) {
    document.querySelector(`#button${name}`)!.classList.add("active");
    e.preventDefault();
  }

  private buttonUp(name: ButtonName) {
    document.querySelector(`#button${name}`)!.classList.remove("active");
  }

  private tick() {
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
