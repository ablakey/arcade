import { Sprite } from "pixi.js";
import { getPosition } from "./utils";

type BoxCollider = {
  type: "BoxCollider";
  width: number;
  height: number;
};

type PointCollider = {
  type: "PointCollider";
  radius: number;
};

export class GameObject {
  id: number;
  sprite: Sprite;
  collider?: BoxCollider | PointCollider;

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

  get position(): [number, number] {
    return [this.x, this.y];
  }

  move(angle: number, distance: number) {
    const [x, y] = getPosition(this.position, angle, distance);
    this.x = x;
    this.y = y;
  }
}
