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
const float rayMax = 100.0;
const float rayStep = 2.0;
const int rayCount = 64;

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

float scene (vec3 p)
{
	return box(p, vec3(1.0));
}

float scene1 (vec3 p)
{
	// p.y += time;
	// p = rotateY(p, t * 0.1);
	p = rotateY(p, p.y * PI);

	// p = rotateY(p, mouseDrag.x);
	return box(p, vec3(0.25, 1.0, 0.25));
	// return sphere(p, 0.8);
}


vec3 getNormal(vec3 p, float t)
{
	float h = 0.0001;
	return normalize(vec3(
		scene(p + vec3(h, 0, 0)) - scene(p - vec3(h, 0, 0)),
		scene(p + vec3(0, h, 0)) - scene(p - vec3(0, h, 0)),
		scene(p + vec3(0, 0, h)) - scene(p - vec3(0, 0, h))));
}

void main(void)
{
	vec3 color = skyColor;
	vec2 mDrag = mouseDrag / dimension;
	vec2 mOffset = mouse / dimension;
	float aspectRatio = dimension.x / dimension.y;
	vec2 uv = vTextureCoord * 2.0 - 1.0;
	uv.x *= aspectRatio;
	vec3 ray = normalize(front + right * uv.x + up * uv.y);

	// ray = rotateX(ray, mouseDrag.y * 4.0);
	// ray = rotateY(ray, -mouseDrag.x * 4.0);

	// float osc = sin(time) * 0.5 + 0.5;

	float t = 0.0;
	for (int r = 0; r < rayCount; ++r) 
	{
		vec3 p = eye + ray * t;
		float s = sphere(p - eye, 1.0);

		p = rotateX(p, -mDrag.y * 4.0);
		p = rotateY(p, mDrag.x * 4.0);


		// vec3 cell = vec3(4.0, 2.0, 4.0);
		vec3 cell = vec3(1.0 + t * 0.5);
		p = mix(p, mod(p, cell) - cell * 0.5, sin(mOffset.x * PI));//sin(time) * 0.5 + 0.5);
		// float d = scene1(p);

		// p = mod(p, cell) - cell * 0.5;

		float d = sphere(p, 0.5 + t * 0.1);// + osc * 0.1);

		d = substraction(s, d);
		vec3 c = texture2D(panorama, mod(abs(vec2(atan(p.y, p.x) / PI / 2.0, p.z / 2.0 + 0.5)), 1.0)).rgb;

		if (d < rayEpsilon || t > rayMax)
		{
			color = mix(color, c, (1.0 - float(r) / float(rayCount)));
			// color = mix(color, sphereColor, (1.0 - float(r) / float(rayCount)));
			color = mix(color, skyColor, smoothstep(rayMin, rayMax, t));
			break;
		}

		t += d;
	}

	gl_FragColor = vec4(color, 1.0);
}