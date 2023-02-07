import { CRTFilter } from "@pixi/filter-crt";
import { Filter } from "pixi.js";

/**
 * Adds scanlines and noise to look a bit more like a CRT screen.
 */
export function buildCrtFilter() {
  const filter = new CRTFilter({
    lineWidth: 15,
    lineContrast: 0.5,
    noise: 0.1,
    vignetting: 0,
    curvature: 1,
  });

  function update() {
    filter.seed = Math.random();
    filter.time += 0.2;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);

  return filter;
}

/**
 * A filter that warps the image to be the convex shape of a CRT screen.
 * Has the side effect of pixelating elements that don't fit the new transform perfectly.
 */
export function buildWarpFilter() {
  const fragSrc = `precision highp float;
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform vec2 dimensions;
  uniform vec4 inputSize;
  uniform vec4 outputFrame;

  vec2 warpAmount = vec2( 1.0 / 32.0, 1.0 / 16.0 );

  vec2 warp(vec2 pos)
  {
    // warping by the center of filterArea
    pos = pos * 2.0 - 1.0;
    pos *= vec2(
      1.0 + (pos.y * pos.y) * warpAmount.x,
      1.0 + (pos.x * pos.x) * warpAmount.y
    );
    return pos * 0.5 + 0.5;;
  }

  void main() {
    vec2 coord = vTextureCoord;
    coord = coord * inputSize.xy / outputFrame.zw;
    coord = warp( coord );
    coord = coord * inputSize.zw * outputFrame.zw;
    gl_FragColor = texture2D( uSampler, coord );
  }
`
    .split("\n")
    .reduce((c, a) => c + a.trim() + "\n");

  const filter = new Filter(undefined, fragSrc);
  filter.apply = (filterManager, input, output, clear) => {
    filterManager.applyFilter(filter, input, output, clear);
  };
  filter.padding = 0;

  return filter;
}
