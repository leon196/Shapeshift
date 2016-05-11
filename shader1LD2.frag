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
const float PI = 3.14159265359;
float sb(in vec3 p, in vec3 d) { vec3 pd = abs(p)-d; return max(pd.x,max(pd.y,pd.z)); }
vec2 amod (in vec2 p, in float a) {
    a *= PI;
    float r = length(p), x = mod(atan(p.x,p.y),a)-a*.5;
    return r*vec2(cos(x),sin(x));
}
mat2 r2d(in float a) { float s = sin(a), c = cos(a); return mat2(c,s,-s,c); }
float map(in vec3 p, in vec2 m) {
    p.z += dot(p.xy,p.xy)*(m.x*2.-1.)*.5;
    p.xy = mod(p.xy,1.)-.5;
    p.xy = amod(p.xy,.335+m.x*m.y);
    return sb(p,vec3(.45,.1+m.y*.15,.1));
}
float df(in vec3 o, in vec3 d, out vec3 p) {
    vec2 m = mouse / dimension;
    int ri;
    float rd = 0.;
    for (int i = 0; i < 30; i++) {
        ri = i;
        p = o + d * rd;
        float td = map(p, m);
        rd += td;
        if (td <1e-5) break;
    }
    return float(ri)/30.;
}
vec3 rotateY(vec3 v, float t) { 
    float cost = cos(t); float sint = sin(t);
    return vec3(v.x * cost + v.z * sint, v.y, -v.x * sint + v.z * cost); 
}
vec3 rotateX(vec3 v, float t) { 
    float cost = cos(t); float sint = sin(t);
    return vec3(v.x, v.y * cost - v.z * sint, v.y * sint + v.z * cost); 
}
void main(void) {
    vec2 mDrag = mouseDrag / dimension;
    vec2 m = mouse / dimension;
    // vec2 m = sin(mOffset * PI);
    vec2 uv = vTextureCoord * 2. - 1.;
    uv.x *= dimension.x/dimension.y;
    vec3 ro = vec3(uv,1.),rd = normalize(vec3(uv,-1.+length(uv))), mp;
    ro.xy *= r2d(m.x*2.-1.);
    ro = rotateX(ro, -mDrag.y * 4.0);
    ro = rotateY(ro, mDrag.x * 4.0);
    rd = rotateX(rd, -mDrag.y * 4.0);
    rd = rotateY(rd, mDrag.x * 4.0);
    float md = df(ro,rd,mp);
    gl_FragColor = vec4(mix(vec3(.5,.2,1.),vec3(.6,.2+m.x*.25,.1),length(uv))*2.*md, 1.0);
}
