import { CartridgeName, cartridges } from ".";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";

const DEBOUNCE = 200;

export class GameSelect implements Cartridge {
  static title = undefined; // Do not display a title when loading this cartridge.

  titleList: [CartridgeName, typeof Cartridge][] = [];
  selectIndex = 0;
  cooldown = 500; // Prevent initial mis-select.
  titleObj: GameObject;

  setup() {
    this.titleList = Object.entries(cartridges).filter(([, cartridge]) => cartridge.title) as [
      CartridgeName,
      typeof Cartridge
    ][];

    engine.create({ text: "PICK A GAME", position: [80, 40] });
    engine.create({ text: "^", position: [80, 70] });
    engine.create({ text: "^", position: [80, 90], flipY: true });

    this.renderText();
  }

  renderText() {
    if (this.titleObj) {
      this.titleObj.lifetime = 0;
    }
    const title = `${this.selectIndex + 1} - ${this.titleList[this.selectIndex][1].title}`;
    this.titleObj = engine.create({ text: title, position: [80, 80] });
  }

  tick() {
    this.cooldown = Math.max(this.cooldown - engine.tickDelta, 0);

    // Check for button press.
    if (this.cooldown === 0) {
      if (engine.buttons.Action) {
        engine.nextCartridge = this.titleList[this.selectIndex][0];
        return true;
      }
      if (engine.buttons.Down) {
        this.selectIndex = this.selectIndex + 1 >= this.titleList.length ? 0 : this.selectIndex + 1;
      } else if (engine.buttons.Up) {
        this.selectIndex = this.selectIndex - 1 < 0 ? this.titleList.length - 1 : this.selectIndex - 1;
      }

      if (engine.buttons.Down || engine.buttons.Up) {
        this.renderText();
        this.cooldown = DEBOUNCE;
      }
    }
  }
}
