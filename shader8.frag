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

// Raymarching
const float rayEpsilon = 0.0001;
const float rayMin = 0.1;
const float rayMax = 20.0;
const float rayStep = 2.0;
const int rayCount = 32;

// Camera
vec3 eye = vec3(0.0, 0.0, -5.0);
vec3 front = vec3(0.0, 0.0, 1.0);
vec3 right = vec3(1.0, 0.0, 0.0);
vec3 up = vec3(0.0, 1.0, 0.0);

// Colors
vec3 sphereColor = vec3(0, 0.8, 0.5);
vec3 skyColor = vec3(0.0, 0.0, 0.0);
vec3 shadowColor = vec3(0.0, 0.0, 0.5);
vec3 fogColor = vec3(0.5,0.0,0.0);
vec3 glowColor = vec3(0.5,0.8,0.0);

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

void main(void)
{
	vec2 mDrag = mouseDrag / dimension;
	vec2 mOffset = mouse / dimension;
	vec2 m = sin(mOffset * PI);

	float aspectRatio = dimension.x / dimension.y;
	vec2 uv = vTextureCoord * 2.0 - 1.0;
	uv.x *= aspectRatio;

	vec3 ray = normalize(front + right * uv.x + up * uv.y);
	ray = rotateX(ray, -mDrag.y * 4.0);
	ray = rotateY(ray, mDrag.x * 4.0);
	eye = rotateX(eye, -mDrag.y * 4.0);
	eye = rotateY(eye, mDrag.x * 4.0);

	vec3 colorGrid = texture2D(uSampler, vTextureCoord).rgb;

	vec3 color = colorGrid;


	float t = 0.0;
	for (int r = 0; r < rayCount; ++r) 
	{
		ray = rotateY(ray, t * 0.1 * m.x * m.x);
		ray = rotateX(ray, t * 0.1 * m.x * m.x);

		vec3 p = eye + ray * t;
		float s = sphere(p - eye, 1.0);

		// p = rotateY(p, length(p) * m.y);
		// p = mix(p, 1.0 / p, m.x);
		// p = rotateX(p, t * m.x);
		float cell = 2.0;
		p = mix(p, mod(p, cell) - cell * 0.5, m.y);
		// p = mod(p, cell) - cell * 0.5;

		// p = 

		float d = box(p, vec3(0.5));



		// float dd = smin(d, box(p, vec3(0.25, 5.0, 0.25)), 0.5);

		// d = mix(d, dd, m.x);
		// d = mix(d, ddd, m.y);
		d = substraction(s, d);
		vec3 c = texture2D(panorama, mod(abs(vec2(atan(p.y, p.x) / PI / 2.0, p.z / 2.0 + 0.5)), 1.0)).rgb;

		if (d < rayEpsilon || t > rayMax)
		{
			color = mix(color, c, (1.0 - float(r) / float(rayCount)));
			// color = mix(color, sphereColor, (1.0 - float(r) / float(rayCount)));
			color = mix(color, colorGrid, smoothstep(rayMin, rayMax, t));
			break;
		}

		t += d;
	}

	gl_FragColor = vec4(color, 1.0);
}