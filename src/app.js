import * as Util from "./engine/util.js";

import Curve from "./curve.js";
import Control from "./control.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const scene = [];

const p1 = new Control(gl, [-0.9, 0.9]);
const c = new Control(gl, [0.7, 0.7]);
const p2 = new Control(gl, [0.9, -0.9]);
const curve = new Curve(gl, p1, c, p2, [...p1.center, ...c.center, ...p2.center]);

function draw() {
  // Clear canvas white
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each individual element
  scene.forEach(t=>t.draw(canvas, gl));
}

function update() {
  draw();
  window.requestAnimationFrame(update);
}

function mouseDownHandler(e) {
  function grabbed(control, click) {
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
    curve.setP1(p1);
    window.changeVerts();
    return;
  }
  if(c.held) {
    c.center = loc;
    curve.setC(c);
    window.changeVerts();
    return;
  }
  if(p2.held) {
    p2.center = loc;
    curve.setP2(p2);
    window.changeVerts();
    return;
  }
}

// Listener for the vertex type select control
window.changeVerts = function () {
  const vertMode = document.getElementById("vert-select").value;

  switch(vertMode) {
    case "bounding":
      curve.updateVertexBuffer(gl, [...p1.center, ...c.center, ...p2.center]);
      break;
    case "fullscreen":
      curve.updateVertexBuffer(gl, [-1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1]);
      break;
    default:
      console.warn(`Unknown vert mode: ${vertMode}`);
      break;
  }
}

function resize(gl, canvas) {
  canvas.height = Math.min(window.innerHeight, window.innerWidth)*.9;
  canvas.width = Math.min(window.innerHeight, window.innerWidth)*.9;

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function init() {

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  scene.push(curve, p1, c, p2);
  window.changeVerts();

  resize(gl, canvas);
  window.addEventListener("resize", e=>resize(gl, canvas));

  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mouseup", mouseUpHandler);
  canvas.addEventListener("mousemove", mouseMoveHandler);

  update();

}

init();
