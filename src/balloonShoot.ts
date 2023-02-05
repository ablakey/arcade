import { Graphics } from "pixi.js";
import { Engine } from "./engine";

export abstract class Game {
  name: string;
  protected engine: Engine;
  protected abstract start(): void;
  abstract tick(delta: number): void;
  abstract end(): void;

  constructor(engine: Engine) {
    this.engine = engine;
    this.start();
  }
}

export class BalloonShoot extends Game {
  name = "Balloon Shoot!";

  protected start() {
    const graphics = new Graphics()
      .lineStyle(0)
      .beginFill(0xde3249, 1)
      .drawCircle(50, 50, 50)
      .endFill();
    this.engine.stage.addChild(graphics);
  }

  tick(delta: number) {}

  end() {
    console.log("Unload!");
  }
}
