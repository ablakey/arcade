import { Graphics } from "pixi.js";

export type GraphicsState = Record<string, any> & Partial<Record<keyof Graphics, never>>;

export class GraphicsObject extends Graphics {
  public static create<T extends GraphicsState>(
    position: [number, number],
    state: T,
    drawFn: (g: Graphics) => void
  ): GraphicsObject & T {
    const g = new Graphics() as GraphicsObject;
    drawFn(g);
    g.x = position[0];
    g.y = position[1];
    Object.assign(g, state);
    drawFn(g);

    return g as GraphicsObject & T;
  }
}
