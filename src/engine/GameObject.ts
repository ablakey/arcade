import { Sprite, Texture } from "pixi.js";
import { TextureName, textures } from "../assets/textures";
import { Position } from "./Engine";
import { genId, getPosition } from "./utils";

export type GameObjectParams = {
  texture: Texture | TextureName;
  position: Position;
  lifetime?: number;
  anchor?: Position;
  tag?: string;
  collides?: boolean;
  zIndex?: number;
};

export class GameObject {
  id: number;
  sprite: Sprite;
  collides = false;
  tag?: string;
  created: number;
  lifetime: number | undefined;

  get x() {
    return this.sprite.x;
  }

  set x(x: number) {
    this.sprite.x = x;
  }

  get y() {
    return this.sprite.y;
  }

  set y(y: number) {
    this.sprite.y = y;
  }

  get rotation() {
    return this.sprite.rotation;
  }

  set rotation(rotation: number) {
    this.sprite.rotation = rotation;
  }

  get position(): Position {
    return [this.x, this.y];
  }

  set position(p: Position) {
    this.x = p[0];
    this.y = p[1];
  }

  get height() {
    return this.sprite.height;
  }

  get width() {
    return this.sprite.width;
  }

  constructor(params: GameObjectParams) {
    const { texture, position, tag, collides, anchor, lifetime, zIndex } = params;

    this.sprite = new Sprite(typeof texture === "string" ? Texture.from(textures[texture]) : texture);
    this.x = position[0];
    this.y = position[1];
    this.lifetime = lifetime;
    this.id = genId();
    this.sprite.anchor.set(...(anchor ?? [0.5]));
    this.tag = tag;
    this.collides = collides ?? false;
    this.created = engine.now;
    this.sprite.zIndex = zIndex ?? 0;

    return this;
  }

  setTexture(texture: Texture | TextureName) {
    this.sprite.texture = typeof texture === "string" ? Texture.from(textures[texture]) : texture;
  }

  getCollisions(params?: { tag?: string }): GameObject[] {
    if (!this.collides) {
      return [];
    }

    return engine.getObjects({ collidable: true, tag: params?.tag }).filter((b) => {
      if (this === b) {
        return false;
      }

      const aMinX = this.x - this.width / 2;
      const aMaxX = this.x + this.width / 2;
      const aMinY = this.y - this.height / 2;
      const aMaxY = this.y + this.height / 2;

      const bMinX = b.x - b.width / 2;
      const bMaxX = b.x + b.width / 2;
      const bMinY = b.y - b.height / 2;
      const bMaxY = b.y + b.height / 2;

      return aMinX <= bMaxX && aMaxX >= bMinX && aMinY <= bMaxY && aMaxY >= bMinY;
    });
  }

  move(angle: number, distance: number) {
    const [x, y] = getPosition(this.position, angle, distance);
    this.x = x;
    this.y = y;
  }
}
