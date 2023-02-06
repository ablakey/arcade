import { CRTFilter } from "@pixi/filter-crt";
import { Container, Graphics, Rectangle, Renderer } from "pixi.js";
import { BalloonShoot, Game } from "./games/balloonShoot";

const FPS = 30;

const GAMES = [BalloonShoot];

export class Engine {
  public stage: Container;
  private renderer: Renderer;
  private lastTime = 0;
  private accumulatedTime = 0;
  private currentGame: Game | undefined;
  private crtFilter: CRTFilter;

  constructor() {
    this.renderer = new Renderer({
      antialias: false,
      view: document.querySelector("#viewport")! as HTMLCanvasElement,
      width: 100,
      height: 100,
    });

    const filterRenderer = new Renderer({
      antialias: false,
      view: document.querySelector("#crtfilter")! as HTMLCanvasElement,
      width: 400,
      height: 400,
      backgroundAlpha: 0,
    });

    const s = new Container();

    this.stage = new Container();
    this.crtFilter = new CRTFilter({
      lineWidth: 10,
      lineContrast: 0.7,
      noise: 0.4,
      vignetting: 0,
      curvature: 3,
    });

    s.filters = [this.crtFilter];
    s.filterArea = new Rectangle(0, 0, 400, 400);

    function renderCrt() {
      filterRenderer.render(s);
      requestAnimationFrame(renderCrt);
    }

    const g2 = new Graphics()
      .lineStyle(0)
      .beginFill(0xffffff, 0.01)
      .drawCircle(200, 200, 800)
      .endFill();
    s.addChild(g2);

    requestAnimationFrame(renderCrt);

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

    // Filter
    this.crtFilter.time += 0.3;
    this.crtFilter.seed = Math.random();

    this.currentGame?.tick(deltaTime);

    if (this.accumulatedTime > 1000 / FPS) {
      this.accumulatedTime -= 1000 / FPS;
      this.renderer.render(this.stage);
    }

    requestAnimationFrame(this.tick.bind(this));
  }
}
