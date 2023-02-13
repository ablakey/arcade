import { Engine } from "./engine";
import { BalloonShoot } from "./games/balloonShoot";
import { Tutorial } from "./games/tutorial";

const GAME_CATALOG = [BalloonShoot, Tutorial];

window.onload = async () => {
  const engine = new Engine();

  while (true) {
    // TODO: pick a game.
    await engine.play(BalloonShoot);
  }
};
