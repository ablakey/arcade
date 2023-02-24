import { Texture } from "pixi.js";
import { Game, Position } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getPosition } from "../engine/utils";

const HOUSE_POSITIONS: Position[] = [
  [10, 112],
  [20, 112],
  [30, 112],
  [58, 112],
  [68, 112],
  [80, 112],
  [93, 112],
  [104, 112],
];

const BALLOON_SPEED = 1;
const BALLOON_CRASHING_SPEED = 1;
const GUN_COOLDOWN = 1000;
const GUN_ROTATION_SPEED = 0.08;
const BULLET_SPEED = 4;

export class BalloonShoot extends Game {
  bulletTexture: Texture;
  houses: (GameObject & { isAlive: boolean })[] = [];
  bullets: (GameObject & { angle: number })[] = [];
  balloon: GameObject & { state: "RightUp" | "RightDown" | "Crashing" | "Crashed" };
  gun: GameObject;
  cooldown = 0;

  setup() {
    this.bulletTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));

    this.balloon = engine.create("balloon", [40, 40], { state: "RightUp" });
    this.balloon.collider = "Box";
    this.houses = HOUSE_POSITIONS.map((p) => engine.create("houseSmall", p, { isAlive: true }));

    const gunBaseTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawCircle(0, 0, 7));
    engine.create(gunBaseTexture, [42, engine.height - 5]);

    const gunTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 8, 1));
    this.gun = engine.create(gunTexture, [49, engine.height - 5]);
    this.gun.rotation = -(Math.PI / 2);
  }

  tick(): void {
    this.handleBalloon();
    this.handleInput();
    this.handleBullets();
  }

  handleBalloon() {
    const speed = BALLOON_SPEED;
    const balloon = this.balloon;

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

  handleInput() {
    if (engine.input.Right) {
      this.gun.rotation = Math.min(this.gun.rotation + GUN_ROTATION_SPEED, 0);
    } else if (engine.input.Left) {
      this.gun.rotation = Math.max(this.gun.rotation - GUN_ROTATION_SPEED, -Math.PI);
    }

    if (engine.input.Action && this.cooldown <= 0) {
      this.fireGun();
      this.cooldown = GUN_COOLDOWN;
    } else {
      this.cooldown -= engine.tickLength;
    }
  }

  handleBullets() {
    this.bullets.forEach((b) => {
      b.move(b.angle, BULLET_SPEED);
    });

    // Cleanup old bullets.
    // Move bullets.
    // Check for collision
  }

  fireGun() {
    const angle = this.gun.rotation;
    const origin = getPosition(this.gun.position, this.gun.rotation, 7);
    const bullet = engine.create(this.bulletTexture, origin, { angle });
    bullet.collider = "Circle";
    this.bullets.push(bullet);
  }
}
