import { RenderTexture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getDistance, getPosition, randomPick, randomRange } from "../engine/utils";

type Bank = GameObject & { state: "Asleep" | "Waking" | "Up" | "Down"; timeout: number; isRight: boolean };
type Player = GameObject & { gunCooldown: number };
type Bullet = GameObject;

const BANK_SPEED = 2.5;
const PLAYER_Y_SPEED = 3.0;
const DOODAD_SPAWN_RATE = 0.55;
const WAKE_DISTANCE = 30;
const BANK_PLAYER_GAP = 100;
const CAMERA_OFFSET = 50;
const BULLET_SPEED = 10;
const GUN_COOLDOWN = 350;
const STARTING_LIQUIDITY = 200;
const BULLET_COST = 10;
const GAME_OVER_COUNTDOWN = 2_500;
const RESET_COOLDOWN = 3_000;
const MONEY_VALUE = 40;
const MONEY_DRAIN_RATE = 0.3;
const ANIMATION_PACE = 250;
const SHAKE_INTENSITY = 1.5;

export class BankRun implements Cartridge {
  static title = "Bank Run!";
  bank: Bank;
  player: Player;
  liquidityScore = STARTING_LIQUIDITY;
  actionWasPressed = false;
  gameOverCountdown = GAME_OVER_COUNTDOWN;
  resetCooldown = RESET_COOLDOWN;
  doodad: RenderTexture;
  bullet: RenderTexture;
  animationTicker = ANIMATION_PACE;
  playedGetawaySound = false;

  async preload() {
    await engine.precache({
      textures: ["bank", "bankRun"],
      sounds: ["laser", "slash"],
    });
  }
  setup() {
    this.bullet = engine.generateTexture((g) => g.beginFill(0x00cc00).drawRect(0, 0, 3, 1));
    this.doodad = engine.generateTexture((g) => g.beginFill(0x666666).drawRect(0, 0, 1, 1));
    this.player = engine.create<Player>({
      position: [10, 80],
      texture: "van",
      collides: true,
      zIndex: 100,
      attrs: { gunCooldown: 0 },
    });

    for (let x = 0; x < 100; x++) {
      engine.create({
        texture: this.doodad,
        position: [this.player.x + randomRange(-200, +200), this.player.y + randomRange(-200, 200)],
      });
    }

    this.bank = engine.create<Bank>({
      position: [100, 80],
      texture: "bank",
      collides: true,
      tag: "bank",
      attrs: { state: "Asleep", timeout: 500, isRight: true },
    });

    // Hide bank legs behind this.
    engine.create({
      position: [100, 88],
      texture: engine.generateTexture((g) => g.beginFill(0).drawRect(0, 0, 16, 8)),
      tag: "mask",
    });

    engine.create({
      position: [114, 73],
      texture: "bankSign",
      zIndex: 101,
    });

    this.tickCamera();
  }

  isActive() {
    return this.bank.state === "Up" || this.bank.state === "Down";
  }

  fireGun() {
    const position = getPosition(this.player.position, 0, 3);
    engine.create<Bullet>({
      texture: this.bullet,
      position,
      collides: true,
      tag: "bullet",
      lifetime: 1_500,
    });
    engine.playSound("laser");
    this.liquidityScore -= BULLET_COST;
  }

  tickWeapon() {
    if (this.isActive() && engine.buttons.Action && this.player.gunCooldown <= 0) {
      if (this.liquidityScore >= BULLET_COST) {
        this.fireGun();
      } else {
        engine.playSound("slash");
      }
      this.player.gunCooldown = GUN_COOLDOWN;
    }

    engine.getObjects<Bullet>({ tag: "bullet" }).forEach((b) => {
      b.getCollisions({ tag: "bank" }).forEach(() => {
        engine.destroy(b);
        engine.playSound("crunch");
        const dollar = engine.create({
          texture: "dollar",
          position: [this.bank.x, this.bank.y + randomPick([-15, 15])],
          lifetime: 10_000,
          tag: "money",
          collides: true,
        });
        dollar.sprite.tint = 0x00ff00;
      });

      b.x += BULLET_SPEED;
    });

    this.player.gunCooldown -= engine.tickDelta;

    engine.setText(`LIQUIDITY: ${this.liquidityScore.toFixed(0)}`, "TopLeft");
  }

  tickDoodads() {
    if (this.isActive() && Math.random() > 1 - DOODAD_SPAWN_RATE) {
      engine.create({
        texture: this.doodad,
        position: [this.player.x + 120, this.player.y + randomRange(-400, 400)],
        lifetime: 10_000,
      });
    }
  }

  tickPlayer() {
    this.actionWasPressed = engine.buttons.Action;

    if (this.bank.state === "Asleep") {
      if (engine.buttons.Right) {
        this.player.x += BANK_SPEED;
      } else if (engine.buttons.Left) {
        this.player.x -= BANK_SPEED;
      }
    }

    if (this.bank.state !== "Waking") {
      if (engine.buttons.Up) {
        this.player.y -= PLAYER_Y_SPEED;
      } else if (engine.buttons.Down) {
        this.player.y += PLAYER_Y_SPEED;
      }
    }

    if (this.isActive() && this.bank.x - this.player.x > BANK_PLAYER_GAP) {
      this.player.x += BANK_SPEED;
    }

    this.player.getCollisions({ tag: "money" }).forEach((m) => {
      this.liquidityScore += MONEY_VALUE;
      engine.playSound("confirm");
      engine.destroy(m);
    });
  }

  tickCamera() {
    const shake = this.bank.state === "Waking";

    engine.setCamera([
      this.player.x + CAMERA_OFFSET + (shake ? randomRange(-SHAKE_INTENSITY, SHAKE_INTENSITY) : 0),
      this.player.y + (shake ? randomRange(-SHAKE_INTENSITY, SHAKE_INTENSITY) : 0),
    ]);
  }

  tickBank() {
    // The poor man's FSM.
    switch (this.bank.state) {
      case "Asleep":
        if (getDistance(this.bank.position, this.player.position) < WAKE_DISTANCE) {
          this.bank.state = "Waking";
          this.bank.timeout = 2_000;
        }
        break;
      case "Waking":
        this.bank.y -= 0.25;
        if (this.bank.timeout <= 0) {
          this.bank.state = "Down";
          engine.playSound("laugh");
          this.bank.timeout = randomRange(300, 1200);
          engine.getObjects({ tag: "mask" }).forEach((o) => engine.destroy(o));
        }
        break;
      case "Up":
        if (this.bank.timeout <= 0) {
          this.bank.state = "Down";
          this.bank.timeout = randomRange(300, 1200);
        }
        break;
      case "Down":
        if (this.bank.timeout <= 0) {
          this.bank.state = "Up";
          this.bank.timeout = randomRange(300, 1200);
        }
        break;
    }

    if (this.bank.state !== "Asleep") {
      this.bank.timeout -= engine.tickDelta;
    }

    if (this.isActive()) {
      this.animationTicker = Math.max(this.animationTicker - engine.tickDelta, 0);
      if (this.animationTicker === 0) {
        this.bank.isRight = !this.bank.isRight;
        this.bank.setTexture(this.bank.isRight ? "bank" : "bankRun");
        this.animationTicker = ANIMATION_PACE;
      }

      if (this.gameOverCountdown <= 0) {
        this.bank.x += BANK_SPEED * 2;
      } else {
        this.bank.x += BANK_SPEED;
      }
    }

    if (this.bank.state === "Up") {
      this.bank.y += BANK_SPEED;
    } else if (this.bank.state === "Down") {
      this.bank.y -= BANK_SPEED;
    }
  }

  tick() {
    this.tickBank();
    this.tickPlayer();
    this.tickDoodads();
    this.tickCamera();
    this.tickWeapon();

    if (this.isActive()) {
      this.liquidityScore = Math.max(this.liquidityScore - MONEY_DRAIN_RATE, 0);
    }

    if (this.gameOverCountdown <= 0) {
      if (!this.playedGetawaySound) {
        this.playedGetawaySound = true;
        engine.playSound("doorSlowOpen");
      }
      engine.setText("GAME OVER", "Center");
      this.resetCooldown -= engine.tickDelta;
    }

    if (this.liquidityScore === 0) {
      this.gameOverCountdown -= engine.tickDelta;
    } else {
      this.gameOverCountdown = GAME_OVER_COUNTDOWN;
    }

    if (this.resetCooldown <= 0) {
      return true;
    }
  }
}
