import { Container, Renderer } from "pixi.js";

export function buildEngine(settings: { fps: number; onTick: (delta: number) => void }) {
  const viewport = document.querySelector("#viewport")! as HTMLCanvasElement;
  const renderer = new Renderer({ antialias: false, view: viewport, width: 200, height: 200 });
  const stage = new Container();

  let lastTime = 0;
  let accumulatedTime = 0;
  function animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    accumulatedTime += deltaTime;
    lastTime = currentTime;

    settings.onTick(deltaTime);

    if (accumulatedTime > 1000 / settings.fps) {
      accumulatedTime -= 1000 / settings.fps;
      renderer.render(stage);
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  return { stage };
}
