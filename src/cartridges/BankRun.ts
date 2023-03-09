import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";

type Bank = GameObject & { state: "Asleep" | "Waking" | "Up" | "Down"; timeout: number };

export class BankRun implements Cartridge {
  static title = "Bank Run!";
  bank: Bank;
  moneySpawnCooldown = 0;

  setup() {
    this.bank = engine.create<Bank>({ position: [80, 80], texture: "house", attrs: { state: "Asleep", timeout: 500 } });
  }

  tick() {
    this.bank.timeout -= engine.tickDelta;

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
          this.bank.timeout = 2_000;
          // TODO: make legs appear.
        }
      case "Up":
        engine.setText("Up", "TopRight");
        if (this.bank.timeout <= 0) {
          this.bank.state = "Down";
          this.bank.timeout = 2_000;
        }
        break;
      case "Down":
        engine.setText("Down", "TopRight");
        if (this.bank.timeout <= 0) {
          this.bank.state = "Up";
          this.bank.timeout = 2_000;
        }
        break;
    }
  }
}
