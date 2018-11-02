#version 300 es
in vec2 position;

out vec2 fragPos;

void main() {
    vec2 pos = vec2(2.f * float(uint(gl_VertexID) % 2u) - 1.f, 2.f * float(((uint(gl_VertexID)+1u) / 3u) % 2u) - 1.f);

    fragPos = pos;
    gl_Position = vec4(pos, 0.0, 1.0);
}
