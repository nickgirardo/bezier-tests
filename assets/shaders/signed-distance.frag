#version 300 es
precision highp float;
precision highp int;

in vec2 fragPos;

const int steps = 64;
const int fineSteps = 8;

// Look up table, contains some points of curve
uniform vec2 lut[steps];

uniform vec3 innerColor;
uniform vec3 outerColor;

// Control points
uniform vec2 p1;
uniform vec2 c;
uniform vec2 p2;

out vec4 color;

// Find the derivative or tangent vector of the curve at the value t
vec2 derivative(float t) {
    return 2.0*(1.0-t)*(c-p1) + 2.0*t*(p2-c);
}

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

// Render the signed distance between the curve and the current fragment
// Project returns the closest value t to the current fragment 
// Compute finds where this point lies
// Calculate the cross product of the difference between value that value and the current fragment
//   with the derivative of the curve of the found value t
// The z-component of this value is rendered with the inner color for negative values
// Otherwise rendered with the outer color
//
// Note that this distance is NOT the euclidean distance 
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
    float dist = crs.z;
    if(dist < 0.0) {
        color = vec4(innerColor*dist*-1.0, 1.0);
    } else {
        color = vec4(outerColor*dist, 1.0);
    }
}



