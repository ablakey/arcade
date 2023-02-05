import { Container, Renderer } from "pixi.js";
import { BalloonShoot, Game } from "./balloonShoot";

const FPS = 30;

const GAMES = [BalloonShoot];

export class Engine {
  public stage: Container;
  private renderer: Renderer;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentGame: Game | undefined;

  constructor() {
    const viewport = document.querySelector("#viewport")! as HTMLCanvasElement;
    this.renderer = new Renderer({ antialias: false, view: viewport, width: 100, height: 100 });
    this.stage = new Container();
    this.pickRandomGame();
    requestAnimationFrame(this.tick.bind(this));
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
