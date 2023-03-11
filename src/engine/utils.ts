import { Position } from "./Engine";

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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

export function getPositionAt(a: Position, b: Position, percentage: number): Position {
  const x = a[0] * (1 - percentage) + b[0] * percentage;
  const y = a[1] * (1 - percentage) + b[1] * percentage;
  return [x, y];
}

let id = 0;

export function genId() {
  return id++;
}
