import { Engine } from "./engine";

export abstract class Game {
  abstract title: string;

  engine: Engine;
  abstract start(): void;
  abstract tick(delta: number): void;
  abstract end(): void;

  constructor(engine: Engine) {
    this.engine = engine;
  }
}
