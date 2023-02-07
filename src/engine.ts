import { Container, Rectangle, Renderer, Sprite } from "pixi.js";
import { buildCrtFilter } from "./filters";
import { BalloonShoot } from "./games/balloonShoot";
import house from "./assets/house.png";
import balloon from "./assets/balloon.png";
import { Game, SpriteDetails } from "./types";

const FPS = 60;

const GAMES = [BalloonShoot];

const ASPECT = 4 / 3;

const WIDTH = 800;

const HEIGHT = WIDTH / ASPECT;

const SPRITES = {
  house: { sprite: house, hitArea: "circle", radius: 4, top: 0, left: 0 },
  balloon: { sprite: balloon, hitArea: "rect", width: 16, height: 16, top: 0, left: 0 },
} satisfies Record<string, SpriteDetails>;

export class Engine {
  public stage: Container;
  private renderer: Renderer;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentGame: Game | undefined;

  constructor() {
    this.renderer = new Renderer({
      antialias: false,
      view: document.querySelector("#viewport")! as HTMLCanvasElement,
      width: WIDTH,
      height: WIDTH / ASPECT,
      backgroundColor: 0x101010,
    });

    this.stage = new Container();
    this.stage.scale = { x: HEIGHT / 100, y: HEIGHT / 100 };
    this.stage.filters = [buildCrtFilter()];
    this.stage.filterArea = new Rectangle(0, 0, WIDTH, HEIGHT);

    this.pickRandomGame();
    requestAnimationFrame(this.tick.bind(this));
  }

  public addSprite(name: keyof typeof SPRITES, x: number, y: number): Sprite {
    const { sprite } = SPRITES[name];

    const s = Sprite.from(sprite);
    s.x = x;
    s.y = y;
    this.stage.addChild(s);
    return s;
  }

  private pickRandomGame() {
    this.stage.removeChildren();
    const PickedGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    this.currentGame = new PickedGame(this);
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
