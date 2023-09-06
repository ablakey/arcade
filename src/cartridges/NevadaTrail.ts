import { RenderTexture } from "pixi.js";
import { Cartridge } from "../engine/Engine";
import { GameObject } from "../engine/GameObject";
import { Pos } from "../engine/Pos";
import { times } from "../engine/utils";

const BROWN = 0xcd7f32;
const BLUE = 0x0000ff;

const CHAR_INDEXES: Pos[] = [
  [10, 49],
  [10, 65],
  [10, 80],
];

export class NevadaTrail implements Cartridge {
  static title = "The Nevada Trail™";

  gameState: "CharSelect" | "Walking" | "RiverChoice" | "Sinking" = "CharSelect";
  charIndex = 0; // 0..n  for which the cursor is at.
  cursor: GameObject;
  rainTex: RenderTexture;
  lineTex: RenderTexture;
  blackBgTex: RenderTexture;
  cooldown = 500;

  async preload() {
    await engine.precache({ textures: ["dollar"] });
  }

  setup(): void | Promise<void> {
    this.rainTex = engine.drawTexture((ctx) => ctx.lineStyle({ color: BLUE, width: 1 }).lineTo(0, 2));

    this.blackBgTex = engine.drawTexture((ctx) => ctx.beginFill(0x000000).drawRect(0, 0, 160, 120));

    this.lineTex = engine.drawTexture((ctx) => {
      ctx.lineStyle({ color: BROWN, width: 1 }).lineTo(130, 0);
    });

    engine.create({ tag: "pickui", text: NevadaTrail.title, position: [80, 10] });
    engine.create({ tag: "pickui", texture: this.lineTex, position: [80, 20] });
    engine.create({ tag: "pickui", texture: this.lineTex, position: [80, 100] });
    engine.create({ tag: "pickui", text: "Pick your character:", position: [15, 25], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Techbro from Tampa", position: [15, 45], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Disruptor from Detroit", position: [15, 60], anchor: "TopLeft" });
    engine.create({ tag: "pickui", text: "Ayn Rand", position: [15, 75], anchor: "TopLeft" });

    this.cursor = engine.create({ text: ">", position: CHAR_INDEXES[this.charIndex] });
  }

  tick(): boolean | void {
    this.cooldown = Math.max(this.cooldown - engine.tickDelta, 0);
    this.cursor.position = CHAR_INDEXES[this.charIndex];

    // Move cursor up down.
    if (!this.cooldown && engine.buttons.Down) {
      this.charIndex = Math.min(this.charIndex + 1, CHAR_INDEXES.length - 1);
      this.cooldown = 250;
    } else if (!this.cooldown && engine.buttons.Up) {
      this.charIndex = Math.max(this.charIndex - 1, 0);
      this.cooldown = 250;
    }

    // Char select.
    if (this.gameState === "CharSelect") {
      if (!this.cooldown && engine.buttons.Action) {
        this.gameState = "Walking";
        engine.getObjects({ tag: "pickui" }).forEach((g) => (g.lifetime = 0));
        this.cursor.visible = false;

        // Initialize the next scene.
        const mudTex = engine.drawTexture((ctx) => ctx.beginFill(BROWN).drawRect(0, 0, 160, 25));
        engine.create({ tag: "mud", position: [0, 53], texture: mudTex, anchor: "TopLeft" });
        const waterTex = engine.drawTexture((ctx) => ctx.beginFill(BLUE).drawRect(0, 0, 160, 25));
        engine.create({ tag: "water", position: [-160, 53], texture: waterTex, anchor: "TopLeft" });
        engine.create({ tag: "effigy", position: [100, 40], texture: "dollar" });
        engine.create({ tag: "vehicle", position: [140, 50], texture: "van", flipX: true });
        engine.create({
          tag: "gametext",
          absolute: false,
          position: [10, 85],
          text: "    Date: Sept 2, 2023",
          anchor: "TopLeft",
        });
        engine.create({
          tag: "gametext",
          absolute: false,
          position: [10, 95],
          text: " Weather: Muddy",
          anchor: "TopLeft",
        });
        engine.create({
          tag: "gametext",
          absolute: false,
          position: [10, 105],
          text: "  Health: Poor",
          anchor: "TopLeft",
        });
      }
    }

    if (this.gameState === "Walking") {
      const water = engine.get("water")!;
      if (water.x > -40) {
        this.gameState = "RiverChoice";
        // Show question.
        engine.create({ tag: "riverui", position: [80, 60], texture: this.blackBgTex });
        engine.create({ tag: "riverui", texture: this.lineTex, position: [80, 20] });
        engine.create({ tag: "riverui", texture: this.lineTex, position: [80, 100] });
        engine.create({ tag: "riverui", text: "What do you do?", position: [15, 25], anchor: "TopLeft" });
        engine.create({ tag: "riverui", text: "Ignore the problem", position: [25, 60], anchor: "TopLeft" });
        engine.create({ tag: "riverui", text: "Ford the Playa", position: [25, 45], anchor: "TopLeft" });
        engine.create({ tag: "riverui", text: "Wait for FEMA", position: [25, 75], anchor: "TopLeft" });
        this.cursor.visible = true;
      }
    }

    if (this.gameState === "CharSelect" || this.gameState === "Sinking") {
      // Move effigy slowly.
      engine.get("effigy")!.x += 0.005 * engine.tickDelta;

      // Move water in slowly. But faster than effigy to give parallax effect.
      const water = engine.get("water")!;
      water.x += 0.02 * engine.tickDelta;

      // Spawn rain.
      if (Math.random() <= 0.6) {
        engine.create({ tag: "rain", position: [Math.random() * 160, 0], texture: this.rainTex, lifetime: 1000 });
      }

      // Move rain.
      engine.getObjects({ tag: "rain" }).forEach((r) => {
        r.y += 0.05 * engine.tickDelta;
      });
    }
  }
}
