import { Texture } from "pixi.js";
import { Game } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getPosition } from "../engine/utils";

const HOUSE_POSITIONS = [30, 40, 50, 60, 100, 110, 120, 130];
const GUN_POSITION_X = 80;
const BALLOON_SPEED = 1.2;
const BALLOON_CRASHING_SPEED = 1.8;
const GUN_COOLDOWN = 500;
const GUN_ROTATION_SPEED = 0.08;
const BULLET_SPEED = 4;
const BULLET_LIFESPAN = 2_000;
const BALLOON_LIFESPAN = 9_000;
const TOTAL_BALLOONS = 3;

type House = GameObject & { isAlive: boolean; tag: "house" };
type Bullet = GameObject & { angle: number };
type Balloon = GameObject & { state: "RightUp" | "RightDown" | "Crashing" | "Crashed" };

export class BalloonShoot extends Game {
  title = "Balloon Shoot!";
  bulletTexture: Texture;
  gun: GameObject;
  cooldown = 0;
  balloonCount = 0;

  setup() {
    this.bulletTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));

    HOUSE_POSITIONS.map((p) =>
      engine.create<House>({
        texture: "houseSmall",
        position: [p, engine.height - 4],
        attrs: { isAlive: true },
        tag: "house",
        collides: true,
      })
    );

    const gunBaseTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawCircle(0, 0, 7));
    engine.create({ texture: gunBaseTexture, position: [GUN_POSITION_X, engine.height] });

    const gunTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 8, 1));
    this.gun = engine.create({ texture: gunTexture, position: [GUN_POSITION_X, engine.height - 7] });
    this.gun.sprite.anchor.set(0);
    this.gun.rotation = -(Math.PI / 2);
  }

  tick() {
    this.handleBalloon();
    this.handleInput();
    this.handleBullets();
    this.handleHouses();

    if (this.balloonCount >= TOTAL_BALLOONS) {
      setTimeout(() => {
        engine.finishGame();
      }, 1_500);
    }
  }

  handleBalloon() {
    let balloon: (GameObject & Balloon) | undefined;

    if (
      !engine.getObjects<Balloon>({ tag: "balloon", collidable: true }).length &&
      this.balloonCount < TOTAL_BALLOONS
    ) {
      balloon = engine.create<Balloon>({
        texture: "balloon",
        position: [0, 0],
        attrs: { state: "RightUp" },
        tag: "balloon",
        collides: true,
      });
    } else {
      balloon = engine.getObjects<Balloon>({ tag: "balloon" }).pop() ?? undefined;
    }

    if (balloon === undefined) {
      return;
    }

    if (
      engine.now - balloon.created > BALLOON_LIFESPAN &&
      balloon.state !== "Crashing" &&
      balloon.state !== "Crashed"
    ) {
      engine.destroy(balloon);
      this.balloonCount++;
      return;
    }

    switch (balloon.state) {
      case "RightUp":
      case "RightDown":
        if (balloon.y <= 10) {
          balloon.state = "RightDown";
        } else if (balloon.y >= 35) {
          balloon.state = "RightUp";
        }
        balloon.x += BALLOON_SPEED;
        balloon.y += balloon.state === "RightUp" ? -BALLOON_SPEED : BALLOON_SPEED;
        break;
      case "Crashing":
        balloon.y += BALLOON_CRASHING_SPEED;
        if (balloon.y >= engine.height) {
          balloon.state = "Crashed";
          balloon.collides = false;
          this.balloonCount++;
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

  handleHouses() {
    engine.getObjects<House>({ tag: "house" }).forEach((h) => {
      h.getCollisions().forEach((t) => {
        if (t.tag === "balloon" && h.isAlive) {
          h.isAlive = false;
          h.setTexture("houseSmallDestroyed");
        }
      });
    });
  }

  handleBullets() {
    engine.getObjects<Bullet>({ tag: "bullet" }).forEach((b) => {
      if (performance.now() - b.created > BULLET_LIFESPAN) {
        engine.destroy(b);
        return;
      }

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
  }

  fireGun() {
    const angle = this.gun.rotation;
    const position = getPosition(this.gun.position, this.gun.rotation, 7);
    engine.create<Bullet>({
      texture: this.bulletTexture,
      position,
      attrs: { angle },
      collides: true,
      tag: "bullet",
    });
  }
}
