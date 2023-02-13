import { Sprite } from "pixi.js";
import balloon from "./assets/balloon.png";
import house from "./assets/house.png";
import houseSmall from "./assets/houseSmall.png";

export type GameObjectConfig =
  | { sprite: string; top: number; left: number } & (
      | {
          collisionShape: "circle";
          radius: number;
        }
      | {
          collisionShape: "rect";
          width: number;
          height: number;
        }
    );

const configs = {
  house: { sprite: house, collisionShape: "circle", radius: 4, top: 0, left: 0 },
  houseSmall: { sprite: houseSmall, collisionShape: "circle", radius: 4, top: 0, left: 0 },
  balloon: { sprite: balloon, collisionShape: "rect", width: 16, height: 16, top: 0, left: 0 },
} satisfies Record<string, GameObjectConfig>;

export type SpriteName = keyof typeof configs;

export class GameObject extends Sprite {
  // @ts-expect-error: Gets initialized using the static factory `create`.
  public config: GameObjectConfig;

  public static create(name: SpriteName, x: number, y: number): GameObject {
    const config = configs[name];
    const s = GameObject.from(config.sprite) as GameObject;
    s.x = x;
    s.y = y;
    s.config = config;

    return s;
  }
}
