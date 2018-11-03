#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

uniform vec2 lut[64];
uniform vec3 color;
uniform float radius;

out vec4 outColor;

void main() {
    // TODO fix this up I guess
    float minDist = 999999.0;

    // 64 = elements of lut
    for(int i=0; i<64; i++) {
        float dist = distance(fragPos, lut[i]);
        if(dist < minDist) {
            minDist = dist;
        }
    }

    if(minDist > radius) {
        discard;
    }

    outColor = vec4(minDist, radius, 0, 1.0);
}


