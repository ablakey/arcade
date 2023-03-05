/**
 * The engine and games are not designed for these to be changed. Some might break games or the engine.
 * Adjust at your own risk!
 */

export const WIDTH = 160;
export const HEIGHT = 120;
export const FPS = 30;

export const BUTTONS = [
  { name: "Up", codes: ["ArrowUp", "KeyW"] },
  { name: "Down", codes: ["ArrowDown", "KeyS"] },
  { name: "Left", codes: ["ArrowLeft", "KeyA"] },
  { name: "Right", codes: ["ArrowRight", "KeyD"] },
  { name: "Action", codes: ["Space"] },
] as const;
