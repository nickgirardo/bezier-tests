#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

const int steps = 64;
const int fineSteps = 8;

uniform vec2 lut[steps];
uniform vec3 color;

// Control points
uniform vec2 p1;
uniform vec2 c;
uniform vec2 p2;

uniform float radius;

out vec4 outColor;

vec2 compute(float t) {
    return (1.0-t)*(1.0-t)*p1 + 2.0*(1.0-t)*t*c + t*t*p2;
}

float project() {
    // No need to worry about distances farther than this
    float minDist = 999999.0;
    float t;
    int nearest;

    for(int i=0; i<steps; i++) {
        float dist = distance(fragPos, lut[i]);
        if(dist < minDist) {
            minDist = dist;
            nearest = i;
            t = float(nearest)/float(steps-1);
        }
    }

    float base = (float(nearest)-0.5)/float(steps-1);
    float diff = 1.0/(float(fineSteps-1)*float(steps-1));
    for(int i=0; i<fineSteps; i++) {
        float lookup = clamp(base + diff*float(i), 0.0, 1.0);
        vec2 value = compute(lookup);
        float dist = distance(value, fragPos);

        if(dist < minDist) {
            minDist = dist;
            t = lookup;
        }
    }

    return t;
}

void main() {
    float t = project();
    outColor = vec4(t, t, t, 1.0);
}


