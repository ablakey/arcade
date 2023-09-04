import { Texture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getPosition } from "../engine/utils";

const HOUSE_POSITIONS = [30, 40, 50, 60, 100, 110, 120, 130];
const GUN_POSITION_X = 80;
const BALLOON_SPEED = 1.4;
const BALLOON_CRASHING_SPEED = 2.3;
const GUN_COOLDOWN = 500;
const GUN_ROTATION_SPEED = 0.08;
const BULLET_SPEED = 4;
const BULLET_LIFESPAN = 2_000;
const BALLOON_LIFESPAN = 7_000;
const TOTAL_BALLOONS = 5;
const END_GAME_DELAY = 3_000;

type House = GameObject<{ isAlive: boolean }>;
type Bullet = GameObject<{ angle: number }>;
type Balloon = GameObject<{ state: "RightUp" | "RightDown" | "Crashing" | "Crashed" }>;

/**
 * Balloon Shoot is my first game, written in February, 2023. It's probably a huge mess as I was figuring out the engine
 * while I made the game. I also didn't know what the game was going to be as I wrote it.  This makes for a decent
 * reference game, but if you're confused by why I wrote something the way I did, it might simply because I wrote it
 * poorly.
 */
export class SpyBalloon implements Cartridge {
  static title = "Spy Balloon!";

  // Game state.
  bulletTexture: Texture;
  gun: GameObject;
  cooldown = 0;
  hitCount = 0;
  score = 0;
  endGameDelay = 0;
  scoreText: GameObject;

  async preload() {
    await engine.precache({
      textures: ["balloon", "balloonCrashing", "houseSmall", "houseSmallDestroyed"],
      sounds: ["gun", "crunch", "bump", "explosion"],
    });
  }

  setup() {
    /**
     * Prepare dynamic assets.
     */
    this.bulletTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 1, 1));
    const gunTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 8, 1));
    const gunBaseTexture = engine.generateTexture((g) => g.beginFill(0xffffff).drawCircle(0, 0, 7));

    /**
     * Prepare stage.
     */
    HOUSE_POSITIONS.map((p) =>
      engine.create<House>({
        texture: "houseSmall",
        position: [p, engine.height - 4],
        data: { isAlive: true },
        tag: "house",
        collides: true,
      })
    );

    // The gun lives forever so let's keep a reference to it rather than looking it up each time.
    this.gun = engine.create({ texture: gunTexture, position: [GUN_POSITION_X, engine.height - 7] });
    this.gun.sprite.anchor.set(0);
    this.gun.rotation = -(Math.PI / 2);
    engine.create({ texture: gunBaseTexture, position: [GUN_POSITION_X, engine.height] });

    this.scoreText = engine.create({ text: `SCORE: ${this.score}`, anchor: "TopRight", position: [160, 1] });
  }

  /**
   * Called once for each frame. We could place all our logic here, but I broke it out into functions to simplify
   * debugging and viewing the code. This is only called once setup has returned and stops when `engine.finishGame` is
   * called.
   */
  tick() {
    this.handleBalloon();
    this.handleInput();
    this.handleBullets();
    this.handleHouses();

    if (this.hitCount >= TOTAL_BALLOONS) {
      engine.create({ text: "GAME OVER", position: [80, 60], anchor: "Center" });
      this.endGameDelay += engine.tickDelta;
    }

    return this.endGameDelay >= END_GAME_DELAY;
  }

  /**
   * An ugly "state machine" for handling the balloon's movement.  This only really works with very small games. This
   * game is tiny and the state machine already felt a bit clumsy. Use Behaviour Trees or FSMs for larger games!
   */
  handleBalloon() {
    let balloon: (GameObject & Balloon) | undefined;

    // Only returns a living balloon: it's collidable. Note how unreliable this could be.
    if (!engine.getObjects<Balloon>({ tag: "balloon", collidable: true }).length && this.hitCount < TOTAL_BALLOONS) {
      balloon = engine.create<Balloon>({
        texture: "balloon",
        position: [0, 0],
        data: { state: "RightUp" },
        tag: "balloon",
        collides: true,
      });
    } else {
      // Getting the last balloon gives us the only living balloon. Note how buggy this could be.
      balloon = engine.getObjects<Balloon>({ tag: "balloon" }).pop() ?? undefined;
    }

    if (balloon === undefined) {
      return;
    }

    if (
      performance.now() - balloon.created > BALLOON_LIFESPAN &&
      balloon.data.state !== "Crashing" &&
      balloon.data.state !== "Crashed"
    ) {
      engine.destroy(balloon);
      this.hitCount++;
      return;
    }

    switch (balloon.data.state) {
      case "RightUp":
      case "RightDown":
        if (balloon.y <= 10) {
          balloon.data.state = "RightDown";
        } else if (balloon.y >= 35) {
          balloon.data.state = "RightUp";
        }
        balloon.x += BALLOON_SPEED;
        balloon.y += balloon.data.state === "RightUp" ? -BALLOON_SPEED : BALLOON_SPEED;
        break;
      case "Crashing":
        balloon.y += BALLOON_CRASHING_SPEED;
        if (balloon.y >= engine.height) {
          balloon.data.state = "Crashed";
          balloon.collides = false;
          engine.playSound("bump");
          this.hitCount++;
        }
        break;
    }
  }

  /**
   * Inputs are handled by reading the current state of a button (like how a GameBoy works!) There are no events /
   * interrupts.
   */
  handleInput() {
    if (engine.buttons.Right) {
      this.gun.rotation = Math.min(this.gun.rotation + GUN_ROTATION_SPEED, 0);
    } else if (engine.buttons.Left) {
      this.gun.rotation = Math.max(this.gun.rotation - GUN_ROTATION_SPEED, -Math.PI);
    }

    if (engine.buttons.Action && this.cooldown <= 0) {
      this.fireGun();
      this.cooldown = GUN_COOLDOWN;
    } else {
      this.cooldown -= engine.tickDelta;
    }
  }

  handleHouses() {
    engine.getObjects<House>({ tag: "house" }).forEach((h) => {
      h.getCollisions().forEach((t) => {
        if (t.tag === "balloon" && h.data.isAlive) {
          h.data.isAlive = false;
          h.setTexture("houseSmallDestroyed");
          engine.playSound("crunch");
          this.addScore(-50);
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

      b.move(b.data.angle, BULLET_SPEED);
      b.getCollisions().forEach((c) => {
        if (c.tag === "balloon") {
          const balloon = c as Balloon;
          engine.destroy(b);
          balloon.data.state = "Crashing";
          balloon.setTexture("balloonCrashing");
          engine.playSound("explosion");
          this.addScore(100);
        }
      });
    });
  }

  addScore(score: number) {
    this.score += score;
    this.scoreText.text = `SCORE: ${this.score}`;
  }

  fireGun() {
    const angle = this.gun.rotation;
    const position = getPosition(this.gun.position, this.gun.rotation, 7);
    engine.playSound("gun");
    engine.create<Bullet>({
      texture: this.bulletTexture,
      position,
      data: { angle },
      collides: true,
      tag: "bullet",
    });
  }
}
