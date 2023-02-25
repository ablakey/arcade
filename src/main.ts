import { Engine } from "./engine/Engine";
import { BalloonShoot } from "./cartridges/BalloonShoot";
import { sleep } from "./engine/utils";

// TODO: generate this too?
// const GAME_CATALOG = [BalloonShoot];

window.onload = async () => {
  window.engine = new Engine();

  while (true) {
    // TODO: pick a game.
    await window.engine.play(BalloonShoot);
    await sleep(500);
  }
};

/**
 * Yes, I'm making engine a global/window.  globalThis is a smarter idea for real projects, but I want to explore this.
 * I'm confident that engine will be a singleton, and I want to keep code as minimal as possible.  Don't do this with
 * code that matters.
 */
declare global {
  const engine: Engine;
  interface Window {
    engine: Engine;
  }
}
