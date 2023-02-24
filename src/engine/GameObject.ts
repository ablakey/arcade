import { Sprite } from "pixi.js";
import { Position } from "./Engine";
import { getPosition, hasCollision } from "./utils";

export class GameObject {
  id: number;
  sprite: Sprite;
  collider: "None" | "Box" | "Circle" = "None";

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

  get radius() {
    // Inscribed radius of a circle that fits inside the object.
    return Math.min(this.width, this.height) / 2;
  }

  get position(): Position {
    return [this.x, this.y];
  }

  get height() {
    return this.sprite.height;
  }

  get width() {
    return this.sprite.width;
  }

  getCollisions(): GameObject[] {
    if (this.collider === undefined) {
      return [];
    }

    return engine.getCollidables().filter((c) => hasCollision(c, this));
  }

  move(angle: number, distance: number) {
    const [x, y] = getPosition(this.position, angle, distance);
    this.x = x;
    this.y = y;
  }
}
