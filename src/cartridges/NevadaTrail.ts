import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { Pos } from "../engine/Pos";

const BROWN = 0xcd7f32;

const CHAR_INDEXES: Pos[] = [
  [19, 49],
  [19, 65],
  [19, 80],
];

export class NevadaTrail implements Cartridge {
  static title = "The Nevada Trail™";

  gameState: "CharSelect" | "Walking" | "RiverChoice" = "CharSelect";
  charIndex = 0; // 0..n  for which the cursor is at.
  cursor: GameObject;
  cooldown = 500;

  async preload() {
    await engine.precache({ textures: ["dollar"] });
  }

  setup(): void | Promise<void> {
    engine.create({ text: NevadaTrail.title, position: [80, 10] });
    const lineTex = engine.drawTexture((ctx) => {
      ctx.lineStyle({ color: BROWN, width: 1 }).lineTo(120, 0);
    });
    engine.create({ texture: lineTex, position: [80, 20] });
    engine.create({ texture: lineTex, position: [80, 100] });
    engine.create({ text: "Pick your character:", position: [15, 25], anchor: "TopLeft" });
    engine.create({ text: "Techbro from Tampa", position: [25, 45], anchor: "TopLeft" });
    engine.create({ text: "Disruptor from Detroit", position: [25, 60], anchor: "TopLeft" });
    engine.create({ text: "Ayn Rand", position: [25, 75], anchor: "TopLeft" });

    this.cursor = engine.create({ text: ">", position: CHAR_INDEXES[this.charIndex] });
  }

  tick(): boolean | void {
    this.cooldown = Math.max(this.cooldown - engine.tickDelta, 0);
    if (this.gameState === "CharSelect") {
      if (!this.cooldown && engine.buttons.Down) {
        this.charIndex = Math.min(this.charIndex + 1, CHAR_INDEXES.length - 1);
        this.cooldown = 250;
      } else if (!this.cooldown && engine.buttons.Up) {
        this.charIndex = Math.max(this.charIndex - 1, 0);
        this.cooldown = 250;
      }
      this.cursor.position = CHAR_INDEXES[this.charIndex];
    }
  }
}
