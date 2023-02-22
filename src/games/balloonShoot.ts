import { Texture } from "pixi.js";
import { Game } from "../engine/Engine";
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

const BALLOON_SPEED = 1;
const BALLOON_CRASHING_SPEED = 0.02;
const GUN_COOLDOWN = 1000;
const GUN_ROTATION_SPEED = 0.08;

export class BalloonShoot extends Game {
  bulletTexture: Texture;
  houses: (GameObject & { isAlive: boolean })[] = [];
  bullets: (GameObject & { angle: number })[] = [];
  balloon: GameObject & { state: "RightUp" | "RightDown" | "Crashing" | "Crashed" };
  gun: GameObject;
  cooldown = 0;

  setup() {
    this.bulletTexture = this.engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));
    this.balloon = this.engine.create("balloon", [40, 40], { state: "RightUp" });
    this.houses = HOUSE_POSITIONS.map((p) => this.engine.create("houseSmall", p, { isAlive: true }));

    const gunTexture = this.engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 6, 1));
    this.gun = this.engine.create(gunTexture, [50, 50]);
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
        if (balloon.y === this.engine.height) {
          balloon.state = "Crashed";
          // TODO: change the texture.
        }
        break;
    }
  }

  handleInput() {
    if (this.engine.input.Right) {
      this.gun.rotation = Math.min(this.gun.rotation + GUN_ROTATION_SPEED, 0);
    } else if (this.engine.input.Left) {
      this.gun.rotation = Math.max(this.gun.rotation - GUN_ROTATION_SPEED, -Math.PI);
    }

    if (this.engine.input.Action && this.cooldown <= 0) {
      this.fireGun();
      this.cooldown = GUN_COOLDOWN;
    } else {
      this.cooldown -= this.engine.tickLength;
    }
  }

  handleBullets() {
    this.bullets.forEach((b) => {
      b.move(b.angle, 1);
    });

    // Cleanup old bullets.
    // Move bullets.
    // Check for collision
  }

  fireGun() {
    const angle = this.gun.rotation;
    const bullet = this.engine.create(this.bulletTexture, [50, 50], { angle });
    bullet.sprite.anchor.set(0.5);
    bullet.collider = { type: "PointCollider", radius: 1 };
    this.bullets.push(bullet);
  }
}
