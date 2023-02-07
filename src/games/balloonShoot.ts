import { BaseTexture, Graphics, SCALE_MODES } from "pixi.js";
import { Game } from "../types";

// TODO: does this work?
BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

const graphics = new Graphics().lineStyle(0).beginFill(0xffffff, 1).drawCircle(0, 0, 10).endFill();
graphics.y = 20;
let goRight = true;

export class BalloonShoot extends Game {
  title = "Balloon Shoot!";

  protected start() {
    this.engine.stage.addChild(graphics);
    this.engine.addSprite("house", 20, 20);
    this.engine.addSprite("balloon", 10, 10);
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
