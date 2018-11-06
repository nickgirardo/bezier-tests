import * as Util from "./engine/util.js";

// Fragment shaders
import * as solid from "../assets/shaders/solid-curve.frag";
import * as nearest from "../assets/shaders/nearest-t.frag";
import * as distance from "../assets/shaders/distance.frag";
import * as signedDistance from "../assets/shaders/signed-distance.frag";
import * as colorFill from "../assets/shaders/color-fill.frag";

import * as vertSrc from "../assets/shaders/basic.vert";

const shaders = {
  solid,
  nearest,
  distance,
  signedDistance,
  colorFill,
}

export default class Control {

  constructor(gl, p1, c, p2) {
    this.vertexBuffer = gl.createBuffer();

    this.innerColor = [0.4, 0.4, 0.7];
    this.outerColor = [0.2, 0.6, 0.7];
    this.radius = 0.03;

    this.p1 = p1.center;
    this.c = c.center;
    this.p2 = p2.center;

    this.steps = 64;
    this.buildLUT();

  }

  buildProgram(gl, shader) {
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: shaders[shader]}, {
      uniform: {
        lut: 'lut',
        innerColor: 'innerColor',
        outerColor: 'outerColor',
        p1: 'p1',
        c: 'c',
        p2: 'p2',
        radius: 'radius',
      },
      attribute: {
        position: 'position'
      },
    });
  }

  updateVertexBuffer(gl, verts) {
    this.verts = verts;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 2, gl.FLOAT, false, 0, 0);
  }

  updateCurrentFragmentShader(gl, shader) {
    if(!shaders[shader]) {
      console.error(`Shader not found: ${shader}`);
      return;
    }

    this.buildProgram(gl, shader);
  }

  buildLUT() {
    const lut = [];

    for(let i=0; i<this.steps; i++) {
      // i goes from 0..points-1 but we need t=1
      const t = i/(this.steps-1);
      lut.push(
        (1-t)*(1-t)*this.p1[0] + 2*(1-t)*t*this.c[0] + t*t*this.p2[0],
        (1-t)*(1-t)*this.p1[1] + 2*(1-t)*t*this.c[1] + t*t*this.p2[1]
      );
    }

    this.lut = new Float32Array(lut);
  }

  setP1(p) {
    this.p1 = p.center;
    this.buildLUT();
  }

  setC(p) {
    this.c = p.center;
    this.buildLUT();
  }

  setP2(p) {
    this.p2 = p.center;
    this.buildLUT();
  }

  draw(canvas, gl) {
    gl.useProgram(this.programInfo.program);

    gl.uniform2fv(this.programInfo.locations.uniform.lut, this.lut, 0, this.steps*2);
    gl.uniform3fv(this.programInfo.locations.uniform.innerColor, this.innerColor);
    gl.uniform3fv(this.programInfo.locations.uniform.outerColor, this.outerColor);
    gl.uniform2fv(this.programInfo.locations.uniform.p1, this.p1);
    gl.uniform2fv(this.programInfo.locations.uniform.c, this.c);
    gl.uniform2fv(this.programInfo.locations.uniform.p2, this.p2);
    gl.uniform1f(this.programInfo.locations.uniform.radius, this.radius);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.programInfo.locations.attribute.position);

    gl.drawArrays(gl.TRIANGLES, 0, this.verts.length/2);
  }
}
