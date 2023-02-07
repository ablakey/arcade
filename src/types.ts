import { Engine } from "./engine";

export type SpriteDetails =
  | { sprite: string; top: number; left: number } & (
      | {
          hitArea: "circle";
          radius: number;
        }
      | {
          hitArea: "rect";
          width: number;
          height: number;
        }
    );

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
