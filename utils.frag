
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