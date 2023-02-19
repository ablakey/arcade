import { Engine } from "./Engine";

export type Game = (engine: Engine) => {
  tick: (delta: number) => void;
  title: string;
};
