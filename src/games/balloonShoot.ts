import { Engine } from "../engine";

const HOUSE_POSITIONS: [number, number][] = [
  [10, 112],
  [20, 112],
  [30, 112],
  [58, 112],
  [68, 112],
  [80, 112],
  [93, 112],
];

export function balloonShoot(engine: Engine) {
  const balloon = engine.addSprite("balloon", [10, 10], { movingUp: true });

  const houses = HOUSE_POSITIONS.map((p) => {
    return engine.addSprite("houseSmall", p, { isHit: false });
  });

  // const line = engine.addGraphics([10, 10], {}, (g) => {
  //   // draw polygon
  //   const path = [60, 37, 70, 46, 78, 42, 73, 57, 59, 52];

  //   g.lineStyle(0);
  //   g.beginFill(0x3500fa, 1);
  //   g.drawPolygon(path);
  //   g.endFill();
  // });

  function tick(delta: number) {
    console.log("tickety");
  }

  return { title: "Balloon Shoot!", tick };
}

// class BalloonShoot extends Game {
//   title = "Balloon Shoot!";
//   private balloon: GameObject & { movingUp: boolean };
//   private houses: GameObject[];

//   async play() {
//     const x = this.engine.addGameObject("balloon", [10, 10], { movingUp: true });
//     // Add houses.
//     this.houses = HOUSE_POSITIONS.map((p) => {
//       return this.engine.addGameObject("houseSmall", p, { destroyed: false });
//     });

//     return await this.blockUntilFinished();
//   }

//   tick(delta: number) {
//     if (this.balloon) {
//     }
//   }

//   end() {
//     console.log("Unload!");
//   }
// }
