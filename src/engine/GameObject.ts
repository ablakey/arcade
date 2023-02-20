import { Graphics, Sprite } from "pixi.js";
import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";

const sprites = { balloon, house, houseSmall };

type SpriteName = keyof typeof sprites;

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

  static fromSprite<A extends Record<string, any>>(
    name: SpriteName,
    position: [number, number],
    attrs: A
  ) {
    const obj = new GameObject<Sprite>();
    obj.pixi = Sprite.from(sprites[name]);
    obj.x = position[0];
    obj.y = position[1];
    Object.assign(obj, attrs);
    return obj as GameObject<Sprite> & A;
  }

  static fromGraphics() {
    const obj = new GameObject<Graphics>();
    return obj;
  }
}
