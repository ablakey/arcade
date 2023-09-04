import { Sprite, Text, Texture } from "pixi.js";
import { TextureName, textures } from "../assets/textures";
import { Position } from "./Engine";
import { genId, getPosition } from "./utils";

const anchorPositions = {
  TopLeft: [0, 0],
  Center: [0.5, 0.5],
  TopRight: [1, 0],
};

export type GameObjectParams<D extends Record<string, any> = Record<string, any>> = {
  texture?: Texture | TextureName;
  text?: string;
  position: Position;
  absolute?: boolean;
  lifetime?: number;
  anchor?: keyof typeof anchorPositions;
  tag?: string;
  collides?: boolean;
  zIndex?: number;
  color?: number;
  flipX?: boolean;
  flipY?: boolean;
  data?: D;
};

export class GameObject<D extends Record<string, any> = Record<string, any>> {
  id: number;
  sprite: Sprite | Text;
  collides = false;
  tag?: string;
  created: number;
  lifetime: number | undefined;
  absolute: boolean;
  data: D;

  set text(text: string | number) {
    (this.sprite as Text).text = text;
  }

  get text() {
    return (this.sprite as Text).text;
  }

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

  get color() {
    return this.sprite.tint;
  }

  set color(color: number) {
    this.sprite.tint = color;
  }

  constructor(params: GameObjectParams<D>) {
    const { texture, position, tag, collides, anchor, lifetime, zIndex, text, color, flipX, flipY, absolute, data } =
      params;

    const tex = texture
      ? new Sprite(typeof texture === "string" ? Texture.from(textures[texture]) : texture)
      : new Text(text ?? "<ERR>", {
          fill: ["#ffffff"],
          fontFamily: "Apple",
          fontSize: 8,
          letterSpacing: -1,
        });

    // By default, text is absolute, others are not.
    this.absolute = absolute ?? text ? true : false;
    this.sprite = tex;
    this.x = position[0];
    this.y = position[1];
    this.lifetime = lifetime;
    this.id = genId();
    this.tag = tag;
    this.collides = collides ?? false;
    this.created = engine.now;
    this.sprite.zIndex = zIndex ?? 0;
    this.sprite.roundPixels = true;
    this.sprite.tint = color ?? 0xffffff;
    this.sprite.scale = { x: flipX ? -1 : 1, y: flipY ? -1 : 1 };
    this.data = data ?? ({} as D);

    if (anchor) {
      const [x, y] = anchorPositions[anchor];
      this.sprite.anchor.x = x;
      this.sprite.anchor.y = y;
    } else {
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 0.5;
    }

    return this;
  }

  setTexture(texture: Texture | TextureName) {
    engine.checkCache(texture);
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
