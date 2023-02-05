import { Graphics, Sprite } from "pixi.js";
import { Engine } from "../engine";

import house from "./assets/house.png";

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

  structureCount = 0;

  protected start() {
    const graphics = new Graphics()
      .lineStyle(0)
      .beginFill(0xffffff, 1)
      .drawCircle(14, 14, 10)
      .endFill();
    this.engine.stage.addChild(graphics);

    this.placeStructure(40, 84);
    this.placeStructure(10, 84);
    this.placeStructure(60, 84);
    this.placeStructure(77, 84);
  }

  private placeStructure(x: number, y: number) {
    const s = Sprite.from(house);
    s.x = x;
    s.y = y;
    this.engine.stage.addChild(s);
    this.structureCount++;
  }

  tick(delta: number) {}

  end() {
    console.log("Unload!");
  }
}
