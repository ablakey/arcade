import { Game } from "../types";

const HOUSE_POSITIONS = [
  [10, 88],
  [20, 88],
  [30, 88],
  [58, 88],
  [68, 88],
  [80, 88],
  [93, 88],
];

export class BalloonShoot extends Game {
  title = "Balloon Shoot!";

  protected start() {
    this.engine.addGameObject("balloon", 10, 10);

    HOUSE_POSITIONS.forEach(([x, y]) => {
      this.engine.addGameObject("houseSmall", x, y);
    });
    // Add houses.
  }

  tick(delta: number) {}

  end() {
    console.log("Unload!");
  }
}
