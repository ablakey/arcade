import balloon from "../assets/balloon.png";
import house from "../assets/house.png";
import houseSmall from "../assets/houseSmall.png";

export const textures = { balloon, house, houseSmall };

export type TextureName = keyof typeof textures;
