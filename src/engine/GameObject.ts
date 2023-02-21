import { Graphics, Sprite, Texture } from "pixi.js";
import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";

const textures = { balloon, house, houseSmall };

type TextureName = keyof typeof textures;

export class GameObject<T extends Sprite | Graphics = Sprite | Graphics> {
  pixi: T;

  get x() {
    return this.pixi.x;
  }

  set x(x: number) {
    this.pixi.x = x;
  }

  get y() {
    return this.pixi.y;
  }

  set y(y: number) {
    this.pixi.y = y;
  }

  static fromTexture<A extends Record<string, any>>(
    texture: TextureName | Texture,
    position: [number, number],
    attrs?: A
  ) {
    const obj = new GameObject<Sprite>();
    obj.pixi = typeof texture === "string" ? Sprite.from(textures[texture]) : new Sprite(texture);
    obj.x = position[0];
    obj.y = position[1];
    Object.assign(obj, attrs ?? {});
    return obj as GameObject<Sprite> & A;
  }

  static fromGraphics(position: [number, number], drawCallback: (graphics: Graphics) => void) {
    const obj = new GameObject<Graphics>();
    obj.pixi = new Graphics();
    obj.x = position[0];
    obj.y = position[1];
    drawCallback(obj.pixi);
    return obj;
  }

  move(angle: number, distance: number) {
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    this.x += x;
    this.y += y;
  }
}
