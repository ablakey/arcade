type Coord = [number, number];
export interface Pos extends Coord {
  0: number;
  1: number;
}

export class Pos {
  public static lerp(a: Pos, b: Pos, percentage: number): Pos {
    const x = a[0] * (1 - percentage) + b[0] * percentage;
    const y = a[1] * (1 - percentage) + b[1] * percentage;
    return [x, y];
  }

  public static posAt(position: Pos, angle: number, distance: number): Pos {
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return [x + position[0], y + position[1]];
  }

  public static distance(a: Pos, b: Pos): number {
    return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
  }
}
