import { Sprite, Texture } from "pixi.js";
import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";

const textures = { balloon, house, houseSmall };

export type TextureName = keyof typeof textures;

export class GameObject {
  sprite: Sprite;

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

  static create<A extends Record<string, any>>(texture: Texture | TextureName, position: [number, number], attrs?: A) {
    const tex = typeof texture === "string" ? Texture.from(textures[texture]) : texture;
    const obj = new GameObject();
    obj.sprite = new Sprite(tex);
    obj.x = position[0];
    obj.y = position[1];
    Object.assign(obj, attrs ?? {});
    return obj as GameObject & A;
  }

  move(angle: number, distance: number) {
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    this.x += x;
    this.y += y;
  }
}
