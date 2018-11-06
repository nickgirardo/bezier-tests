#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

const int steps = 64;
const int fineSteps = 8;

uniform vec2 lut[steps];
uniform vec3 innerColor;
uniform vec3 outerColor;

// Control points
uniform vec2 p1;
uniform vec2 c;
uniform vec2 p2;

uniform float radius;

out vec4 outColor;


vec2 derivative(float t) {
    return 2.0*(1.0-t)*(c-p1) + 2.0*t*(p2-c);
}

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

    /*
    * Attempting to find whether a point is "inside" or "outside" of the curve
    * Some properties of cross product help is do this
    * Cross product is normal to the plane of its arguments
    * All of our vectos live on the xy plane so cross is (0, 0, z)
    * Cross product is anti communitive
    * This means that an inside points and outside points differ by sign of z
    *
    * Note, our t is capped to [0, 1] so this can behave weirdly where the
    * nearest point on the curve should lie outside [0,1]
    *
    * With a tight bounding box this shouldn't be a problem
    */

    vec3 crs = cross(vec3(fragPos-compute(t), 0.0), vec3(derivative(t), 0.0));
    outColor = vec4(mix(innerColor, outerColor, step(0.0, crs.z)), 1.0);
}


