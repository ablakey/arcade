export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getPosition(position: [number, number], angle: number, distance: number): [number, number] {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return [x + position[0], y + position[1]];
}
