/**
 * The engine and games are not designed for these to be changed. Some might break games or the engine.
 * Adjust at your own risk!
 */

import { CartridgeName } from "./cartridges";

export const WIDTH = 160;
export const HEIGHT = 120;
export const FPS = 30;

export const BUTTONS = [
  { name: "Up", codes: ["ArrowUp", "KeyW"] },
  { name: "Down", codes: ["ArrowDown", "KeyS"] },
  { name: "Left", codes: ["ArrowLeft", "KeyA"] },
  { name: "Right", codes: ["ArrowRight", "KeyD"] },
  { name: "Action", codes: ["Space", "Enter"] },
] as const;

// Debug tool to skip game select.
// export const INITIAL_CARTRIDGE: CartridgeName = "GameSelect";
export const INITIAL_CARTRIDGE: CartridgeName = "TrolleyProblem";
