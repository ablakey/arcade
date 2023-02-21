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

type Balloon = GameObject & { state: "RightUp" | "RightDown" | "Crashing" | "Crashed" };
type House = GameObject & { isAlive: boolean };
type Bullet = GameObject & { angle: number };

export function balloonShoot(engine: Engine) {
  const bulletSprite = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));

  let gunCooldown = 0;

  const balloon: Balloon = GameObject.fromTexture("balloon", [10, 10], { state: "RightUp" });
  engine.add(balloon);

  const bullets: Bullet[] = [];

  const houses: House[] = HOUSE_POSITIONS.map((p) => {
    const obj = GameObject.fromTexture("houseSmall", p, { isAlive: true });
    engine.add(obj);
    return obj;
  });

  function fireGun() {
    const bullet = GameObject.fromTexture(bulletSprite, [50, 50], { angle: Math.PI / 2 });
    bullet.pixi.anchor.set(0.5);
    engine.add(bullet);
    bullets.push(bullet);
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
     * Bullets.
     */
    bullets.forEach((b) => {
      b.move(b.angle, 1);
    });

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
          // TODO: change the texture.
        }
        break;
    }
  }

  return { title: "Balloon Shoot!", tick };
}
