import { Engine } from "./engine/Engine";
import { BalloonShoot } from "./games/BalloonShoot";

const GAME_CATALOG = [BalloonShoot];

window.onload = async () => {
  const engine = new Engine();

  while (true) {
    // TODO: pick a game.
    await engine.play(BalloonShoot);
  }
};
