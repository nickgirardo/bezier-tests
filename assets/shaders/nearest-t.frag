#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

const int steps = 64;
const int fineSteps = 8;

uniform vec2 lut[steps];

// Control points
uniform vec2 p1;
uniform vec2 c;
uniform vec2 p2;

out vec4 color;

// Find the point on the curve associated with a given value t
vec2 compute(float t) {
    return (1.0-t)*(1.0-t)*p1 + 2.0*(1.0-t)*t*c + t*t*p2;
}

// Find the t of the nearest point on the curve to the current fragment
// Within the range 0..1
float project() {
    // No need to worry about distances farther than this
    float minDist = 999999.0;
    float t;
    int nearest;

    // Coarse check, iterate through lookup table
    for(int i=0; i<steps; i++) {
        float dist = distance(fragPos, lut[i]);
        if(dist < minDist) {
            minDist = dist;
            nearest = i;
            t = float(nearest)/float(steps-1);
        }
    }

    // Fine check, linear search near the closest point from the lookup table
    float base = (float(nearest)-0.5)/float(steps-1);
    float diff = 1.0/(float(fineSteps-1)*float(steps-1));
    for(int i=0; i<fineSteps; i++) {
        // Only check values within the curves range of 0..1
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

// Render each fragment as the value t of the closest point on the curve (0..1)
// Since this is exactly what project returns, just pass the result to the output color
// as a greyscale value
void main() {
    float t = project();
    color = vec4(t, t, t, 1.0);
}


