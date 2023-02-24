import { assert } from "ts-essentials";
import { Position } from "./Engine";
import { GameObject } from "./GameObject";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getPosition(position: Position, angle: number, distance: number): Position {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return [x + position[0], y + position[1]];
}

export function getDistance(a: Position, b: Position) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
}

function hasCircleBoxCollision(circle: GameObject, box: GameObject) {
  const x = circle.x;
  const y = circle.y;
  const minX = box.x;
  const maxX = box.x + box.width;
  const minY = box.y;
  const maxY = box.y + box.height;
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function hasBoxCollision(a: GameObject, b: GameObject) {
  assert(a.collider === "Box");
  assert(b.collider === "Box");

  const aMinX = a.x - a.width / 2;
  const aMaxX = a.x + a.width / 2;
  const aMinY = a.y - a.width / 2;
  const aMaxY = a.y + a.width / 2;

  const bMinX = b.x - b.width / 2;
  const bMaxX = b.x + b.width / 2;
  const bMinY = b.y - b.width / 2;
  const bMaxY = b.y + b.width / 2;

  return aMinX <= bMaxX && aMaxX >= bMinX && aMinY <= bMaxY && aMaxY >= bMinY;
}

export function hasCollision(a: GameObject, b: GameObject) {
  if (a.collider === "None" || b.collider === "None") {
    return false;
  } else if (a.collider === "Circle" && b.collider === "Circle") {
    return getDistance(a.position, b.position) < a.radius + b.radius;
  } else if (a.collider === "Circle" && b.collider === "Box") {
    return hasCircleBoxCollision(a, b);
  } else if (a.collider === "Box" && b.collider === "Circle") {
    return hasCircleBoxCollision(b, a);
  } else if (a.collider === "Box" && b.collider === "Box") {
    return hasBoxCollision(a, b);
  } else {
    throw new Error("Cannot handle these two colliders.");
  }
}
