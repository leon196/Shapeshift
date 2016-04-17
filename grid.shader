precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D panorama;
uniform float time;
uniform vec2 dimension;
uniform float resolution;
uniform vec2 mouseDrag;
uniform vec2 mouse;

#define PI 3.141592653589

float dentDeScie (float x)
{
  return 1.0 - abs(mod(abs(x), 1.0) * 2.0 - 1.0);
}

vec3 axis (vec2 uv, vec2 offset, vec2 dimension) {
	float bright = 0.001;
	uv.x = sin(dentDeScie(uv.x - offset.x) * PI / 2.0);
	uv.y = sin(dentDeScie(uv.y - offset.y) * PI / 2.0);
	vec3 g = vec3(0.0);
	g += clamp(bright / uv.x, 0.0, 1.0);
	g += clamp(bright / uv.y, 0.0, 1.0);
	return g * 0.5;
}

vec3 grid (vec2 uv, vec2 offset, vec2 dimension) {
	float bright = 0.1;
	uv = sin((uv - offset) * PI * 30.0) * 0.8;
	uv = mod(abs(uv), 1.0);
	float g = 1.0 - clamp(bright / uv.x, 0.0, 1.0);
	g += 1.0 - clamp(bright / uv.y, 0.0, 1.0);
	return vec3(1.0 - clamp(g, 0.0, 1.0)) * 0.3;
}

void main(void)
{
	vec2 mDrag = mouseDrag / dimension;
	vec2 mOffset = mouse / dimension;
	vec2 m = sin(mOffset * PI);

	vec3 colorGrid = grid(vTextureCoord, mDrag, dimension);
	colorGrid = min(vec3(1.0), colorGrid + axis(vTextureCoord, mDrag, dimension));

	vec3 color = colorGrid;

	gl_FragColor = vec4(color, 1.0);
}