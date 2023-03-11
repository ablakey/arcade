import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getPositionAt } from "../engine/utils";

// TODO: very incomplete.

export class TrolleyProblem implements Cartridge {
  static title = "Trolley Problem";
  train: GameObject;
  num = 0;

  setup() {
    const lineTex = engine.generateTexture((g) =>
      g.lineStyle({ width: 1, color: 0xffffff }).moveTo(0, 0).lineTo(30, 0)
    );

    const redBoxTex = engine.generateTexture((g) => g.beginFill(0xff0000).drawRect(0, 0, 5, 5));
    this.train = engine.create({ position: getPositionAt([0, 0], [30, 0], 0.5), texture: redBoxTex });

    engine.create({ position: [0, 0], texture: lineTex, anchor: [0, 0] });

    engine.setCamera([0, 0]);
  }

  tick() {
    this.num += engine.tickDelta / 2_000;
    this.train.position = getPositionAt([0, 0], [30, 0], this.num);
    return true;
  }
}

/**
 *
 * Start simple: just make an infinitely moving train.
 *
 * Whenever y-scroll is a whole multiple of X, take the rail object(s) from before and move them.
 *
 *
 *
 *
 */
