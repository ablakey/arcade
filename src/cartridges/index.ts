import { GameSelect } from "./GameSelect";
import { SpyBalloon } from "./SpyBalloon";

export const cartridges = { SpyBalloon, GameSelect };
export type CartridgeName = keyof typeof cartridges;
