import { Engine } from "./engine";
import { balloonShoot } from "./games/balloonShoot";

const GAME_CATALOG = [balloonShoot];

window.onload = async () => {
  const engine = new Engine();

  while (true) {
    // TODO: pick a game.
    await engine.play(balloonShoot);
  }
};
