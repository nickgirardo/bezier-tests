import * as Util from "./engine/util.js";

import * as fragSrc from "../assets/shaders/control.frag";
import * as vertSrc from "../assets/shaders/tesselate.vert";

export default class Control {

  constructor(gl, center) {
    // Create program and link shaders
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: fragSrc}, {
      uniform: {
        color: 'color',
        center: 'center',
        innerRadius: 'innerRadius',
        outerRadius: 'outerRadius',
      },
      attribute: { },
    });

    // Create a vertex array, not actually putting any verts inside
    // Just tesselating the unit square with gl vertex id
    this.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.vertexArray);
    gl.bindVertexArray(null);

    this.color = [0.3, 0.3, 0.3];
    this.center = center;
    this.innerRadius = 0.045;
    this.outerRadius = 0.05;

    this.held = false;
  }

  draw(canvas, gl) {
    gl.useProgram(this.programInfo.program);

    gl.uniform3fv(this.programInfo.locations.uniform.color, this.color);
    gl.uniform2fv(this.programInfo.locations.uniform.center, this.center);
    gl.uniform1f(this.programInfo.locations.uniform.innerRadius, this.innerRadius);
    gl.uniform1f(this.programInfo.locations.uniform.outerRadius, this.outerRadius);

    gl.bindVertexArray(this.vertexArray);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
