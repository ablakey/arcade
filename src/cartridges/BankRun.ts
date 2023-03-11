import { RenderTexture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { randomRange } from "../engine/utils";

type Bank = GameObject & { state: "Asleep" | "Waking" | "Up" | "Down"; timeout: number };
type Player = GameObject;
const BANK_SPEED = 2;
const PLAYER_SPEED = 2;
const DOODAD_SPAWN_RATE = 0.55;

export class BankRun implements Cartridge {
  static title = "Bank Run!";
  bank: Bank;
  player: Player;
  moneySpawnCooldown = 0;
  actionWasPressed = false;
  doodad: RenderTexture;

  setup() {
    this.doodad = engine.generateTexture((g) => g.beginFill(0x666666).drawRect(0, 0, 1, 1));
    const playerTex = engine.generateTexture((g) => g.beginFill(0xffffff).drawRect(0, 0, 5, 7));
    this.player = engine.create<Player>({ position: [10, 80], texture: playerTex, attrs: {} });
    this.bank = engine.create<Bank>({ position: [80, 80], texture: "house", attrs: { state: "Asleep", timeout: 500 } });
    engine.setCamera([this.player.x + 20, this.player.y]);

    for (let x = 0; x < 100; x++) {
      engine.create({
        texture: this.doodad,
        position: [this.player.x + randomRange(-200, +200), this.player.y + randomRange(-200, 200)],
      });
    }
  }

  tickDoodads() {
    if (Math.random() > 1 - DOODAD_SPAWN_RATE) {
      engine.create({
        texture: this.doodad,
        position: [this.player.x + 120, this.player.y + randomRange(-400, 400)],
        lifetime: 10_000,
      });
    }
  }

  tickPlayer() {
    this.actionWasPressed = engine.buttons.Action;

    if (engine.buttons.Up) {
      this.player.y -= PLAYER_SPEED;
    } else if (engine.buttons.Down) {
      this.player.y += PLAYER_SPEED;
    }

    if (this.bank.state === "Down" || this.bank.state === "Up") {
      this.player.x += BANK_SPEED;
    }

    engine.setCamera([this.player.x + 20, this.player.y]);
  }

  tickBank() {
    // The poor man's FSM.
    switch (this.bank.state) {
      case "Asleep":
        engine.setText("Sleep", "TopRight");
        if (this.bank.timeout <= 0) {
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

    if (["Up", "Down"].includes(this.bank.state)) {
      this.bank.x += BANK_SPEED;
    }

    if (this.bank.state === "Up") {
      this.bank.y += BANK_SPEED;
    } else if (this.bank.state === "Down") {
      this.bank.y -= BANK_SPEED;
    }
  }

  tick() {
    this.bank.timeout -= engine.tickDelta;
    this.tickBank();
    this.tickPlayer();

    if (this.bank.state === "Up" || this.bank.state === "Down") {
      this.tickDoodads();
    }
  }
}
