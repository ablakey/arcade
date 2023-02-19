import { Sprite } from "pixi.js";
import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";

export type SpriteConfig =
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
} satisfies Record<string, SpriteConfig>;

export type SpriteName = keyof typeof configs;

// Don't allow state names that would clobber existing attributes.
export type SpriteState = Record<string, any> & Partial<Record<keyof Sprite, never>>;

export class SpriteObject extends Sprite {
  public config: SpriteConfig;

  public static create<T extends SpriteState>(
    name: SpriteName,
    position: [number, number],
    state: T
  ): SpriteObject & T {
    const config = configs[name];
    const s = SpriteObject.from(config.sprite) as SpriteObject;
    s.x = position[0];
    s.y = position[1];
    s.config = config;
    Object.assign(s, state);

    return s as SpriteObject & T;
  }
}
