import { GameSelect } from "./GameSelect";
import { SpyBalloon } from "./SpyBalloon";
import { BankRun } from "./BankRun";
import { NevadaTrail } from "./NevadaTrail";

export const cartridges = { SpyBalloon, GameSelect, BankRun, NevadaTrail };
export type CartridgeName = keyof typeof cartridges;
