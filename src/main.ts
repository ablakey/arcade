import { Application, Graphics, settings } from "pixi.js";

settings.SCALE_MODE;

// const viewport = document.querySelector("#viewport")! as HTMLDivElement;
const viewport = document.querySelector("#viewport")! as HTMLCanvasElement;
const app = new Application({ antialias: false, view: viewport, width: 300, height: 300 });
// viewport.appendChild(app.view as HTMLCanvasElement);

const graphics = new Graphics();
graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
graphics.beginFill(0xde3249, 1);
graphics.drawCircle(150, 150, 150);
graphics.endFill();
app.stage.addChild(graphics);
