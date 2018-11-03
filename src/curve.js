import * as Util from "./engine/util.js";

import * as fragSrc from "../assets/shaders/curve.frag";
import * as vertSrc from "../assets/shaders/tesselate.vert";

export default class Control {

  constructor(gl, p1, c, p2) {
    // Create program and link shaders
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: fragSrc}, {
      uniform: {
        lut: 'lut',
        color: 'color',
        p1: 'p1',
        c: 'c',
        p2: 'p2',
        radius: 'radius',
      },
      attribute: { },
    });

    // Create a vertex array, not actually putting any verts inside
    // Just tesselating the unit square with gl vertex id
    this.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.vertexArray);
    gl.bindVertexArray(null);

    this.color = [0.2, 0.6, 0.7];
    this.radius = 0.03;

    this.p1 = p1.center;
    this.c = c.center;
    this.p2 = p2.center;

    this.steps = 64;
    this.buildLUT();

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
    gl.uniform3fv(this.programInfo.locations.uniform.color, this.color);
    gl.uniform2fv(this.programInfo.locations.uniform.p1, this.p1);
    gl.uniform2fv(this.programInfo.locations.uniform.c, this.c);
    gl.uniform2fv(this.programInfo.locations.uniform.p2, this.p2);
    gl.uniform1f(this.programInfo.locations.uniform.radius, this.radius);

    gl.bindVertexArray(this.vertexArray);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
