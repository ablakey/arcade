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

const BALLOON_SPEED = 0.02;
const BALLOON_CRASHING_SPEED = 0.02;
const GUN_COOLDOWN = 1000;

type BalloonState = "RightUp" | "RightDown" | "Crashing" | "Crashed";

export function balloonShoot(engine: Engine) {
  const bulletSprite = engine.generateSprite((g) => g.beginFill(0xffffff).drawRect(0, 0, 3, 3));

  let gunCooldown = 0;

  const balloon = GameObject.fromSprite("balloon", [10, 10], {
    state: "RightDown" as BalloonState,
  });
  engine.add(balloon);

  const houses = HOUSE_POSITIONS.map((p) => {
    const obj = GameObject.fromSprite("houseSmall", p, { isHit: false });
    engine.add(obj);
    return obj;
  });

  function fireGun() {
    const bullet = GameObject.fromSprite(bulletSprite, [50, 50]);
    bullet.pixi.anchor.set(0.5);
    engine.add(bullet);
  }

  function tick(delta: number) {
    /**
     * Handle input.
     */
    if (engine.input.Action && gunCooldown <= 0) {
      fireGun();
      gunCooldown = GUN_COOLDOWN;
    } else {
      gunCooldown -= delta;
    }

    /**
     * Balloon movement.
     */
    const speed = BALLOON_SPEED * delta;
    switch (balloon.state) {
      case "RightUp":
      case "RightDown":
        if (balloon.y <= 5) {
          balloon.state = "RightDown";
        } else if (balloon.y >= 25) {
          balloon.state = "RightUp";
        }
        balloon.x += speed;
        balloon.y += balloon.state === "RightUp" ? -speed : speed;
        break;
      case "Crashing":
        balloon.y -= BALLOON_CRASHING_SPEED;
        if (balloon.y === engine.height) {
          balloon.state = "Crashed";
        }
        break;
    }
  }

  return { title: "Balloon Shoot!", tick };
}
