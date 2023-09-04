import { Cartridge } from "../engine/Engine";

export class PlayaTrail implements Cartridge {
  static title = "Playa Trail";

  async preload() {
    await engine.precache({ textures: ["dollar"] });
    console.log("preload");
  }

  setup(): void | Promise<void> {
    console.log("draw");
    const abc = engine.create({ text: "Playa Trail", position: [80, 60] });
    console.log(abc.sprite.width);
    const dollar = engine.create({ texture: "dollar", position: [49, 20] });
    console.log(dollar.sprite.anchor, dollar.sprite.width, dollar.sprite.height);
    dollar.sprite.tint = 0x00ff00;
  }

  tick(): boolean | void {}
}
