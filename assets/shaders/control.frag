#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

uniform vec3 color;
uniform vec2 center;
uniform float innerRadius;
uniform float outerRadius;

out vec4 outColor;

void main() {
    float dist = distance(fragPos, center);

    if(dist > outerRadius || dist < innerRadius) {
        discard;
    }

    outColor = vec4(color, 1.0);
}

