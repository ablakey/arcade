import { BaseTexture, Graphics, SCALE_MODES, Sprite } from "pixi.js";
import { Engine } from "../engine";

import house from "../assets/house.png";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

export abstract class Game {
  static title: string;
  protected engine: Engine;
  protected abstract start(): void;
  abstract tick(delta: number): void;
  abstract end(): void;

  constructor(engine: Engine) {
    this.engine = engine;
    this.start();
  }
}

const graphics = new Graphics().lineStyle(0).beginFill(0xffffff, 1).drawCircle(0, 0, 10).endFill();
graphics.y = 20;
let goRight = true;

export class BalloonShoot extends Game {
  title = "Balloon Shoot!";

  structureCount = 0;

  protected start() {
    this.engine.stage.addChild(graphics);

    this.placeStructure(40, 80);
    this.placeStructure(10, 80);
    this.placeStructure(60, 80);
    this.placeStructure(77, 80);
  }

  private placeStructure(x: number, y: number) {
    const s = Sprite.from(house);
    s.x = x;
    s.y = y;
    this.engine.stage.addChild(s);
    this.structureCount++;
  }

  tick(delta: number) {
    if (goRight) {
      graphics.x += delta / 40;
    } else {
      graphics.x -= delta / 40;
    }
    if (!goRight && graphics.x <= 0) {
      goRight = true;
    }

    if (goRight && graphics.x >= 100) {
      console.log("go left now");
      goRight = false;
    }
  }

  end() {
    console.log("Unload!");
  }
}
