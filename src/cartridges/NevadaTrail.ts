import { RenderTexture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { Pos } from "../engine/Pos";
import { times } from "../engine/utils";

const BROWN = 0xcd7f32;
const BLUE = 0x0000ff;

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
  rainTex: RenderTexture;
  cooldown = 500;

  async preload() {
    await engine.precache({ textures: ["dollar"] });
  }

  setup(): void | Promise<void> {
    this.rainTex = engine.drawTexture((ctx) => ctx.lineStyle({ color: BLUE, width: 1 }).lineTo(0, 2));
    engine.create({ tag: "pickui", text: NevadaTrail.title, position: [80, 10] });
    const lineTex = engine.drawTexture((ctx) => {
      ctx.lineStyle({ color: BROWN, width: 1 }).lineTo(120, 0);
    });
    engine.create({ tag: "pickui", texture: lineTex, position: [80, 20] });
    engine.create({ tag: "pickui", texture: lineTex, position: [80, 100] });
    engine.create({ tag: "pickui", text: "Pick your character:", position: [15, 25], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Techbro from Tampa", position: [25, 45], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Disruptor from Detroit", position: [25, 60], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Ayn Rand", position: [25, 75], anchor: "TopLeft" });

    this.cursor = engine.create({ text: ">", position: CHAR_INDEXES[this.charIndex] });
  }

  tick(): boolean | void {
    this.cooldown = Math.max(this.cooldown - engine.tickDelta, 0);

    // Char select.
    if (this.gameState === "CharSelect") {
      if (!this.cooldown && engine.buttons.Down) {
        this.charIndex = Math.min(this.charIndex + 1, CHAR_INDEXES.length - 1);
        this.cooldown = 250;
      } else if (!this.cooldown && engine.buttons.Up) {
        this.charIndex = Math.max(this.charIndex - 1, 0);
        this.cooldown = 250;
      } else if (!this.cooldown && engine.buttons.Action) {
        this.gameState = "Walking";
        engine.getObjects({ tag: "pickui" }).forEach((g) => (g.lifetime = 0));
        this.cursor.visible = false;

        // Initialize the next scene.
        const mudTex = engine.drawTexture((ctx) => ctx.beginFill(BROWN).drawRect(0, 0, 160, 40));
        engine.create({ tag: "mud", position: [0, 53], texture: mudTex, anchor: "TopLeft" });
        const waterTex = engine.drawTexture((ctx) => ctx.beginFill(BLUE).drawRect(0, 0, 160, 40));
        engine.create({ tag: "water", position: [-160, 53], texture: waterTex, anchor: "TopLeft" });
        engine.create({ tag: "effigy", position: [100, 40], texture: "dollar" });
        engine.create({ tag: "vehicle", position: [140, 50], texture: "van", flipX: true });

        times(50).forEach(() => {
          engine.create({ tag: "rain", position: [Math.random() * 160, Math.random() * 120], texture: this.rainTex });
        });
      }
      this.cursor.position = CHAR_INDEXES[this.charIndex];
    }

    if (this.gameState === "Walking") {
      // Move effigy slowly.
      engine.get("effigy")!.x += 0.005 * engine.tickDelta;

      // Move water in slowly. But faster than effigy to give parallax effect.
      const water = engine.get("water")!;
      water.x += 0.01 * engine.tickDelta;

      if (water.x > -40) {
        console.log("WOOF");
      }

      // Spawn rain.
      if (Math.random() <= 0.6) {
        engine.create({ tag: "rain", position: [Math.random() * 100, 0], texture: this.rainTex });
      }

      // Move rain.
      engine.getObjects({ tag: "rain" }).forEach((r) => {
        r.y += 0.05 * engine.tickDelta;
        // r.x += 0.005 * engine.tickDelta;
        if (r.y > 90 + Math.random() * 40) {
          r.lifetime = 0;
        }
      });
    }
  }
}
