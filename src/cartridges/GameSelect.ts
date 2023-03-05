import { cartridges } from ".";
import { Cartridge } from "../engine/Engine";

const DEBOUNCE = 300;

export class GameSelect implements Cartridge {
  static title = undefined;

  selectIndex = 0;
  cooldown = 0;

  setup() {
    const titleList = Object.entries(cartridges).filter(([, cartridge]) => cartridge.title);

    // PICK A GAME

    // Up arrow (?)  (triangle)
    // GAME NAME

    // Down arrow (?)
    this.renderText();
  }

  renderText() {
    const text = `PICK A GAME\n\n\n\n▲\n\nTITLE\n\n▼`;
    // engine.setText(text, "Center", "Center");
    engine.setText(this.selectIndex.toString());
  }

  tick() {
    this.cooldown = Math.max(this.cooldown - engine.tickDelta, 0);

    // Reset cooldown if key was let go (maybe a user can tap through faster than debounce).
    if (!engine.buttons.Down && !engine.buttons.Up) {
      this.cooldown = 0;
    }

    // Check for button press.
    if (this.cooldown === 0) {
      if (engine.buttons.Down) {
        this.selectIndex = this.selectIndex +
      } else if (engine.buttons.Up) {
        this.selectIndex--;
      }

      if (engine.buttons.Down || engine.buttons.Up) {
        this.renderText();
        this.cooldown = DEBOUNCE;
      }
    }

    return true;
  }
}
