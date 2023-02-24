import { Texture } from "pixi.js";
import { Game } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getPosition } from "../engine/utils";

const HOUSE_POSITIONS = [30, 40, 50, 60, 100, 110, 120, 130];
const GUN_POSITION_X = 80;
const BALLOON_SPEED = 0;
const BALLOON_CRASHING_SPEED = 1;
const GUN_COOLDOWN = 1000;
const GUN_ROTATION_SPEED = 0.08;
const BULLET_SPEED = 4;

type House = GameObject & { isAlive: boolean; tag: "foo" };
type Bullet = GameObject & { angle: number };
type Balloon = GameObject & { state: "RightUp" | "RightDown" | "Crashing" | "Crashed" };

export class BalloonShoot extends Game {
  bulletTexture: Texture;
  balloon: GameObject & Balloon;
  gun: GameObject;
  cooldown = 0;

  setup() {
    this.bulletTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));

    this.balloon = engine.create<Balloon>({
      texture: "balloon",
      position: [40, 40],
      attrs: { state: "RightUp" },
      options: { tag: "balloon" },
    });
    this.balloon.collides = true;

    HOUSE_POSITIONS.map((p) =>
      engine.create<House>({
        texture: "houseSmall",
        position: [p, engine.height - 4],
        attrs: { isAlive: true },
        options: { tag: "house" },
      })
    );

    const gunBaseTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawCircle(0, 0, 7));
    engine.create({ texture: gunBaseTexture, position: [GUN_POSITION_X, engine.height] });

    const gunTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 8, 1));
    this.gun = engine.create({ texture: gunTexture, position: [GUN_POSITION_X, engine.height - 7] });
    this.gun.sprite.anchor.set(0);
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
        balloon.y += BALLOON_CRASHING_SPEED;
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
    engine.getObjects<Bullet>({ tag: "bullet" }).forEach((b) => {
      b.move(b.angle, BULLET_SPEED);
      b.getCollisions().forEach((c) => {
        if (c.tag === "balloon") {
          const balloon = c as Balloon;
          engine.destroy(b);
          balloon.state = "Crashing";
          balloon.setTexture("balloonCrashing");
        }
      });
    });

    // Cleanup old bullets.
    // Move bullets.
    // Check for collision
  }

  fireGun() {
    const angle = this.gun.rotation;
    const position = getPosition(this.gun.position, this.gun.rotation, 7);
    engine.create<Bullet>({
      texture: this.bulletTexture,
      position,
      attrs: { angle },
      options: { collides: true, tag: "bullet" },
    });
  }
}
