import { Game } from "../Game";

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

  async play() {
    this.engine.addGameObject("balloon", 10, 10);

    HOUSE_POSITIONS.forEach(([x, y]) => {
      this.engine.addGameObject("houseSmall", x, y);
    });
    // Add houses.

    return await this.blockUntilFinished();
  }

  tick(delta: number) {}

  end() {
    console.log("Unload!");
  }
}
