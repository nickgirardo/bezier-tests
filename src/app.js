import * as Util from "./engine/util.js";

import Control from "./control.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const scene = [];

function draw() {
  gl.clearColor(0.4, 0.4, 0.8, 1.0); // Clear background with dark grey color
  gl.clearDepth(1.0); // Clear the depth buffer
  gl.enable(gl.DEPTH_TEST); // Enable depth testing, insures correct ordering
  gl.depthFunc(gl.LEQUAL); // Near obscures far

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw each individual element
  scene.forEach(t=>t.draw(canvas, gl));
}

function update() {
  draw();
  window.requestAnimationFrame(update);
}

function resize(gl, canvas) {
  canvas.height = Math.min(window.innerHeight, window.innerWidth);
  canvas.width = Math.min(window.innerHeight, window.innerWidth);

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function init() {

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  scene.push(
    new Control(gl, [-0.5, 0.5]),
    new Control(gl, [0.5, 0.5]),
    new Control(gl, [0.5, -0.5]),
  );

  resize(gl, canvas);
  window.addEventListener("resize", e=>resize(gl, canvas));

  update();

}

init();
