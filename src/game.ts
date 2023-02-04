import { Graphics } from "pixi.js";
import { buildEngine } from "./engine";

export function runGame() {
  const engine = buildEngine({ fps: 30, onTick: tick });
  const graphics = new Graphics()
    .lineStyle(0)
    .beginFill(0xde3249, 1)
    .drawCircle(100, 75, 75)
    .endFill();
  engine.stage.addChild(graphics);

  let grow = true;
  function tick(delta: number) {
    if (grow) {
      graphics.scale.y += delta / 1000;
      graphics.scale.x += delta / 1000;
    } else {
      graphics.scale.y -= delta / 1000;
      graphics.scale.x -= delta / 1000;
    }

    if (graphics.containsPoint({ x: 199, y: 1 }) && grow) {
      console.log("contains!");
      grow = false;
    }

    if (graphics.scale.x <= 0) {
      grow = true;
    }
  }
}
