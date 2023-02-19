import { Container, Graphics, Sprite } from "pixi.js";
import balloon from "./assets/balloon.png";
import house from "./assets/house.png";
import houseSmall from "./assets/houseSmall.png";

export abstract class GameObject extends Container {
  public config: GameObjectConfig;
}

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

// Don't allow state names that would clobber existing attributes.
export type GameObjectState = Record<string, any> & Partial<Record<keyof Sprite, never>>;

export class SpriteObject extends Sprite implements GameObject {
  public config: GameObjectConfig;

  public static create<T extends GameObjectState>(
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

    return s as any;
  }
}

export class GraphicsObject extends Graphics implements GameObject {
  public config: GameObjectConfig;

  public static create<T extends GameObjectState>(
    name: SpriteName,
    position: [number, number],
    state: T
  ): GraphicsObject & T {
    const config = configs[name];
    const s = new Graphics() as GraphicsObject;
    s.x = position[0];
    s.y = position[1];
    s.config = config;
    Object.assign(s, state);

    return s as any;
  }
}
