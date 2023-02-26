import { Engine } from "./engine/Engine";
import { SpyBalloon } from "./cartridges/SpyBalloon";
import { sleep } from "./engine/utils";

// TODO: generate this too?
const GAME_CATALOG = [SpyBalloon];

window.onload = async () => {
  window.engine = new Engine();

  while (true) {
    await engine.showTitle("PRESS SPACE TO START");
    while (true) {
      if (engine.input.Action) {
        break;
      }
      await sleep(10);
    }

    for (const cartridge of GAME_CATALOG) {
      await engine.runCartridge(cartridge);
    }

    await engine.showTitle("GAME OVER");
    await sleep(3000);
    await engine.showTitle(`TOTAL SCORE: ${engine.score}`);
    await sleep(4000);
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
