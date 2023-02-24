import { Position } from "./Engine";

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
