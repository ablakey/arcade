import { Engine } from "./engine/Engine";

window.onload = async () => {
  window.engine = new Engine();
  engine.runEngine();
};

/**
 * Yes, I'm making engine a global/window.  globalThis is a smarter idea for real projects, but I want to explore this.
 * I'm confident that engine will be a singleton, and I want to keep code as minimal as possible.  Don't do this with
 * code that matters.
 */
declare global {
  const engine: Engine;
  interface Window {
    engine: Engine;
  }
}
