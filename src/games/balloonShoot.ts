import { Game } from "../Game";
import { GameObject } from "../GameObject";

const HOUSE_POSITIONS: [number, number][] = [
  [10, 112],
  [20, 112],
  [30, 112],
  [58, 112],
  [68, 112],
  [80, 112],
  [93, 112],
];

export class BalloonShoot extends Game {
  title = "Balloon Shoot!";
  private balloon: GameObject & { movingUp: boolean };
  private houses: GameObject[];

  async play() {
    const x = this.engine.addGameObject("balloon", [10, 10], { movingUp: true });
    // Add houses.
    this.houses = HOUSE_POSITIONS.map((p) => {
      return this.engine.addGameObject("houseSmall", p, { destroyed: false });
    });

    return await this.blockUntilFinished();
  }

  tick(delta: number) {
    if (this.balloon) {
    }
  }

  end() {
    console.log("Unload!");
  }
}
