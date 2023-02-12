import { Engine } from "./engine";

export type GameObjectConfig =
  | { sprite: string; top: number; left: number } & (
      | {
          collisionShape: "circle";
          radius: number;
        }
      | {
          collisionShape: "rect";
          width: number;
          height: number;
        }
    );

type ButtonConfig = {
  label: string;

  // key: TODO
};

export abstract class Game {
  abstract title: string;

  static buttons: ButtonConfig[];

  engine: Engine;
  abstract start(): void;
  abstract tick(delta: number): void;
  abstract end(): void;

  constructor(engine: Engine) {
    this.engine = engine;
    this.start();
  }
}
