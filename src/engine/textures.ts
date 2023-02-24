import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";
import balloonCrashing from "../assets/balloonCrashing.png";

export const textures = { balloon, house, houseSmall, balloonCrashing };

export type TextureName = keyof typeof textures;
