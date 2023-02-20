import { Engine } from "../engine/engine";
import { GameObject } from "../engine/GameObject";

const HOUSE_POSITIONS: [number, number][] = [
  [10, 112],
  [20, 112],
  [30, 112],
  [58, 112],
  [68, 112],
  [80, 112],
  [93, 112],
];

const BALLOON_SPEED = 0.05;

export function balloonShoot(engine: Engine) {
  const balloon = GameObject.fromSprite("balloon", [10, 10], { movingUp: true });
  engine.add(balloon);

  const houses = HOUSE_POSITIONS.map((p) => {
    const obj = GameObject.fromSprite("houseSmall", p, { isHit: false });
    engine.add(obj);
    return obj;
  });

  function tick(delta: number) {
    console.log(delta);
    if (balloon.movingUp) {
      balloon.y -= BALLOON_SPEED * delta;
    } else {
      balloon.y += BALLOON_SPEED * delta;
    }

    if (balloon.y <= 5) {
      balloon.movingUp = false;
    } else if (balloon.y >= 25) {
      balloon.movingUp = true;
    }

    balloon.x += BALLOON_SPEED * delta;
  }

  return { title: "Balloon Shoot!", tick };
}
