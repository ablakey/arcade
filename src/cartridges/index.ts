import { GameSelect } from "./GameSelect";
import { SpyBalloon } from "./SpyBalloon";
import { TrolleyProblem } from "./TrolleyProblem";

export const cartridges = { SpyBalloon, GameSelect, TrolleyProblem };
export type CartridgeName = keyof typeof cartridges;
