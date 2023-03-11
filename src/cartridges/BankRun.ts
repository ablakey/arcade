import { RenderTexture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { getDistance, getPosition, randomRange } from "../engine/utils";

type Bank = GameObject & { state: "Asleep" | "Waking" | "Up" | "Down"; timeout: number };
type Player = GameObject & { gunCooldown: number };
type Bullet = GameObject;

const BANK_SPEED = 2.5;
const DOODAD_SPAWN_RATE = 0.55;
const WAKE_DISTANCE = 25;
const BANK_PLAYER_GAP = 100;
const CAMERA_OFFSET = 50;
const BULLET_SPEED = 10;
const GUN_COOLDOWN = 250;
const STARTING_LIQUIDITY = 200;
const BULLET_COST = 10;

export class BankRun implements Cartridge {
  static title = "Bank Run!";
  bank: Bank;
  player: Player;
  liquidityScore = STARTING_LIQUIDITY;
  actionWasPressed = false;
  doodad: RenderTexture;
  bullet: RenderTexture;
  money: RenderTexture;

  setup() {
    this.bullet = engine.generateTexture((g) => g.beginFill(0x00cc00).drawRect(0, 0, 3, 1));
    this.doodad = engine.generateTexture((g) => g.beginFill(0x666666).drawRect(0, 0, 1, 1));
    this.money = engine.generateTexture((g) => g.beginFill(0x00ff00).drawRect(0, 0, 3, 3));
    const playerTex = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 5, 7));
    this.player = engine.create<Player>({ position: [10, 80], texture: playerTex, attrs: { gunCooldown: 0 } });

    this.tickCamera();

    for (let x = 0; x < 100; x++) {
      engine.create({
        texture: this.doodad,
        position: [this.player.x + randomRange(-200, +200), this.player.y + randomRange(-200, 200)],
      });
    }

    this.bank = engine.create<Bank>({
      position: [80, 80],
      texture: "house",
      collides: true,
      tag: "bank",
      attrs: { state: "Asleep", timeout: 500 },
    });
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
    this.liquidityScore -= BULLET_COST;
  }

  tickWeapon() {
    if (
      this.isActive() &&
      engine.buttons.Action &&
      this.player.gunCooldown <= 0 &&
      this.liquidityScore >= BULLET_COST
    ) {
      this.fireGun();
      this.player.gunCooldown = GUN_COOLDOWN;
    }

    engine.getObjects<Bullet>({ tag: "bullet" }).forEach((b) => {
      b.getCollisions({ tag: "bank" }).forEach(() => {
        console.log("COLLISION");
        engine.destroy(b);
        engine.create({ texture: this.money, position: this.bank.position, lifetime: 10_000 });
      });

      b.x += BULLET_SPEED;
    });

    this.player.gunCooldown -= engine.tickDelta;

    engine.setText(`LIQUIDITY: ${this.liquidityScore}`, "TopLeft");
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
        this.player.y -= BANK_SPEED;
      } else if (engine.buttons.Down) {
        this.player.y += BANK_SPEED;
      }
    }

    if (this.isActive() && this.bank.x - this.player.x > BANK_PLAYER_GAP) {
      this.player.x += BANK_SPEED;
    }
  }
  tickCamera() {
    engine.setCamera([this.player.x + CAMERA_OFFSET, this.player.y]);
  }

  tickBank() {
    // The poor man's FSM.
    switch (this.bank.state) {
      case "Asleep":
        engine.setText("Asleep", "TopRight");
        if (getDistance(this.bank.position, this.player.position) < WAKE_DISTANCE) {
          this.bank.state = "Waking";
          this.bank.timeout = 2_000;
        }
        break;
      case "Waking":
        engine.setText("Waking", "TopRight");
        // Moves up while shaking
        if (this.bank.timeout <= 0) {
          this.bank.state = "Down";
          this.bank.timeout = randomRange(300, 1200);
          // TODO: make legs appear.
        }
        break;
      case "Up":
        engine.setText("Up", "TopRight");
        if (this.bank.timeout <= 0) {
          this.bank.state = "Down";
          this.bank.timeout = randomRange(300, 1200);
        }
        break;
      case "Down":
        engine.setText("Down", "TopRight");
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
      this.bank.x += BANK_SPEED;
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
  }
}
