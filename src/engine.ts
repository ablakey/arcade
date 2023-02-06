import { CRTFilter } from "@pixi/filter-crt";
import { Container, Filter, Rectangle, Renderer } from "pixi.js";
import { BalloonShoot, Game } from "./games/balloonShoot";

const FPS = 30;

const GAMES = [BalloonShoot];

const ASPECT = 4 / 3;

const WIDTH = 800;

const HEIGHT = WIDTH / ASPECT;

const fragSrc = `precision highp float;
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform vec2 dimensions;
  uniform vec4 inputSize;
  uniform vec4 outputFrame;

  vec2 warpAmount = vec2( 1.0 / 64.0, 1.0 / 16.0 );

  vec2 warp(vec2 pos)
  {
    // warping by the center of filterArea
    pos = pos * 2.0 - 1.0;
    pos *= vec2(
      1.0 + (pos.y * pos.y) * warpAmount.x,
      1.0 + (pos.x * pos.x) * warpAmount.y
    );
    return pos * 0.5 + 0.5;;
  }

  void main() {
    vec2 coord = vTextureCoord;
    coord = coord * inputSize.xy / outputFrame.zw;
    coord = warp( coord );
    coord = coord * inputSize.zw * outputFrame.zw;
    gl_FragColor = texture2D( uSampler, coord );
  }
`
  .split("\n")
  .reduce((c, a) => c + a.trim() + "\n");

const filter = new Filter(undefined, fragSrc);
filter.apply = (filterManager, input, output, clear) => {
  filterManager.applyFilter(filter, input, output, clear);
};
filter.padding = 0;

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
      width: WIDTH,
      height: WIDTH / ASPECT,
    });

    this.crtFilter = new CRTFilter({
      lineWidth: 10,
      lineContrast: 0.7,
      noise: 0.2,
      vignetting: 0,
      curvature: 1,
    });

    this.stage = new Container();
    this.stage.scale = { x: HEIGHT / 100, y: HEIGHT / 100 };
    this.stage.filters = [this.crtFilter, filter];
    this.stage.filterArea = new Rectangle(0, 0, WIDTH, HEIGHT);

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
