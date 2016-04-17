precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D uPanorama1;
uniform sampler2D uPanorama2;
uniform sampler2D uPanorama3;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

// Raymarching
const float rayEpsilon = 0.0001;
const float rayMin = 0.1;
const float rayMax = 40.0;
const float rayStep = 2.0;
const int rayCount = 64;

// Camera
vec3 eye = vec3(0.0, 0.0, 0.0);
vec3 front = vec3(0.0, 0.0, 1.0);
vec3 right = vec3(1.0, 0.0, 0.0);
vec3 up = vec3(0.0, 1.0, 0.0);

// Colors
vec3 sphereColor = vec3(0, 0.5, 0.0);
vec3 skyColor = vec3(0.0, 0.0, 0.0);
vec3 shadowColor = vec3(0.0, 0.0, 0.5);
vec3 fogColor  = vec3(0.5,0.0,0.0);

// 
vec3 axisX = vec3(0.1, 0.0, 0.0);
vec3 axisY = vec3(0.0, 0.1, 0.0);
vec3 axisZ = vec3(0.0, 0.0, 0.1);

#define PI 3.141592653589
#define PI2 6.283185307179

float sphere ( vec3 p, float s ) { return length(p)-s; }
float udBox( vec3 p, vec3 b ) { return length(max(abs(p)-b,0.0)); }
float box( vec3 p, vec3 b ) { 
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) +
	length(max(d,0.0)); 
}

float plane( vec3 p, vec4 n ) { return dot(p,n.xyz) + n.w; }
vec3 repeat ( vec3 p, vec3 grid ) {  return mod(p, grid) - grid * 0.5; }

float addition( float d1, float d2 ) { return min(d1,d2); }
float substraction( float d1, float d2 ) { return max(-d1,d2); }
float intersection( float d1, float d2 ) { return max(d1,d2); }

vec3 rotateY(vec3 v, float t) { 
	float cost = cos(t); float sint = sin(t);
	return vec3(v.x * cost + v.z * sint, v.y, -v.x * sint + v.z * cost); 
}

vec3 rotateX(vec3 v, float t) { 
	float cost = cos(t); float sint = sin(t);
	return vec3(v.x, v.y * cost - v.z * sint, v.y * sint + v.z * cost); 
}

float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float scene (vec3 p, float t)
{
	vec3 cell = vec3(4.0, 2.0, 4.0);
	p.y += uTime;
	p = rotateY(p, t * 0.1);
	// p = rotateY(p, p.y * 0.1);
	p = mod(p, cell) - cell * 0.5;

	// p = rotateY(p, mouse.x);
	// return box(p, vec3(0.3));
	return sphere(p, 0.8);
}

vec3 getNormal(vec3 p, float t)
{
	float h = 0.0001;
	return normalize(vec3(
		scene(p + vec3(h, 0, 0), t) - scene(p - vec3(h, 0, 0), t),
		scene(p + vec3(0, h, 0), t) - scene(p - vec3(0, h, 0), t),
		scene(p + vec3(0, 0, h), t) - scene(p - vec3(0, 0, h), t)));
}

void main(void)
{
	vec3 color = skyColor;
	vec2 mouse = uMouse / uResolution;
	vec2 uv = vTextureCoord * vec2(uResolution.y / uResolution.x * 2.0, 2.0) - 1.0;
	uv.x *= uResolution.x / uResolution.y;
	vec3 ray = normalize(front + right * uv.x + up * uv.y);
	float t = 0.0;

	ray = rotateX(ray, mouse.y * 4.0);
	ray = rotateY(ray, -mouse.x * 4.0);

	// Background
	vec2 rads = vec2(PI * 2., PI);
  float ratio = 1.0;
 //  float lon = atan(ray.z, ray.x) + PI;
 //  float lat = acos(ray.y / length(ray));
 //  float rot = (1.0 - smoothstep(0.0, 0.95, ratio)) * 4.0;
 //  uv = mod(abs(vec2(lon + rot, lat) / rads), 1.0);
 //  uv.y *= 1. + (0.2 * (1.0 - ratio));
 //  uv = 1.0 - uv;
	// color = texture2D(uPanorama1, uv).rgb;

	for (int r = 0; r < rayCount; ++r) 
	{

		vec3 p = eye + ray * t;
		// p = rotateX(p, -mouse.y * 4.0);
		// p = rotateY(p, mouse.x * 4.0);

		float d = scene(p, t);

		if (d < rayEpsilon || t > rayMax)
		{
			vec3 normal = getNormal(p, t);
			normal = rotateY(normal, t + uTime);
			normal = rotateX(normal, t + uTime);
		  float lon = atan(normal.z, normal.x) + PI;
		  float lat = acos(normal.y / length(normal));
		  float rot = (1.0 - smoothstep(0.0, 0.95, ratio)) * 4.0;
		  uv = mod(abs(vec2(lon + rot, lat) / rads), 1.0);
		  uv.y *= 1. + (0.2 * (1.0 - ratio));
		  uv = 1.0 - uv;

		  float m1 = step(2.0, mod(p.y + uTime, 6.0));
		  float m2 = step(2.0, mod(p.y + uTime, 4.0));
		  vec3 col = mix(texture2D(uPanorama1, uv).rgb, mix(texture2D(uPanorama2, uv).rgb, texture2D(uPanorama3, uv).rgb, m2), m1);

			color = mix(color, col, (1.0 - float(r) / float(rayCount)));
			color = mix(color, skyColor, smoothstep(rayMin, rayMax, t));
			break;
		}

		t += d;
	}

	gl_FragColor = vec4(color, 1.0);
}