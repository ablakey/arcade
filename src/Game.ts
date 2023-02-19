import { Engine } from "./engine";
import { sleep } from "./utils";

export type Game = (engine: Engine) => {
  tick: (delta: number) => void;
  title: string;
};

// export abstract class Game {
//   abstract title: string;

//   engine: Engine;
//   isFinished = false;
//   abstract play(): Promise<void>;
//   abstract tick(delta: number): void;
//   abstract end(): void;

//   constructor(engine: Engine) {
//     this.engine = engine;
//   }

//   protected async blockUntilFinished() {
//     while (true) {
//       if (this.isFinished) {
//         return;
//       }

//       await sleep(500);
//     }
//   }
// }
