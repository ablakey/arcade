import { GameSelect } from "./GameSelect";
import { SpyBalloon } from "./SpyBalloon";
import { BankRun } from "./BankRun";

export const cartridges = { SpyBalloon, GameSelect, BankRun };
export type CartridgeName = keyof typeof cartridges;
