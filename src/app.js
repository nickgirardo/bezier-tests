import * as Util from "./engine/util.js";

import Control from "./control.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const scene = [];

const p1 = new Control(gl, [-0.5, 0.5]);
const c = new Control(gl, [0.5, 0.5]);
const p2 = new Control(gl, [0.5, -0.5]);

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

function mouseDownHandler(e) {
  function grabbed(control, click) {
    console.log(click, control.center);
    console.log(Math.sqrt((control.center[0]-click[0])**2 + (control.center[1]-click[1])**2), control.outerRadius);
    return Math.sqrt((control.center[0]-click[0])**2 + (control.center[1]-click[1])**2) < control.outerRadius;
  }
  // Convert from 0..canvas -> -1..1
  const click = [
    ((e.offsetX/canvas.width) * 2) - 1,
    (((e.offsetY/canvas.height) * 2) - 1) * -1
  ];

  if(grabbed(p1, click)) {
    p1.held = true;
    return;
  }
  if(grabbed(c, click)) {
    c.held = true;
    return;
  }
  if(grabbed(p2, click)) {
    p2.held = true;
    return;
  }
}

function mouseUpHandler(e) {
  p1.held = false;
  c.held = false;
  p2.held = false;
}

function mouseMoveHandler(e) {
  // Convert from 0..canvas -> -1..1
  const loc = [
    ((e.offsetX/canvas.width) * 2) - 1,
    (((e.offsetY/canvas.height) * 2) - 1) * -1
  ];

  if(p1.held) {
    p1.center = loc;
    return;
  }
  if(c.held) {
    c.center = loc;
    return;
  }
  if(p2.held) {
    p2.center = loc;
    return;
  }


}

function init() {

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  scene.push(p1, c, p2);

  resize(gl, canvas);
  window.addEventListener("resize", e=>resize(gl, canvas));

  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mouseup", mouseUpHandler);
  canvas.addEventListener("mousemove", mouseMoveHandler);

  update();

}

init();
