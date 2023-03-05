import { cartridges } from ".";
import { Cartridge } from "../engine/Engine";

export class GameSelect implements Cartridge {
  setup() {
    const titleList = cartridges.filter(c => c.title).
  }

  tick() {}
}
