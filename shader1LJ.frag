precision mediump float;
 
uniform sampler2D uSampler;
uniform sampler2D panorama;
uniform float time;
uniform vec2 dimension;
uniform vec2 resolution;
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
float map(in vec3 p) {
    p.z += dot(p.xy,p.xy)*(mouse.x*2.-1.)*.5;
    p.xy = mod(p.xy,1.)-.5;
    p.xy = amod(p.xy,.335+mouse.x*mouse.y);
    return sb(p,vec3(.45,.1+mouse.y*.15,.1));
}
float df(in vec3 o, in vec3 d, out vec3 p) {
    int ri;
    float rd = 0.;
    for (int i = 0; i < 30; i++) {
        ri = i;
        p = o + d * rd;
        float td = map(p);
        rd += td;
        if (td <1e-5) break;
    }
    return float(ri)/30.;
}
void main(void) {
    vec2 uv = (gl_FragCoord.xy/resolution.xy) * 2. - 1.;
    uv.x *= resolution.x/resolution.y;
    vec3 ro = vec3(uv,1.),rd = normalize(vec3(uv,-1.+length(uv))), mp;
    ro.xy *= r2d(mouse.x*2.-1.);
    float md = df(ro,rd,mp);
    gl_FragColor = vec4(mix(vec3(.5,.2,1.),vec3(.6,.2+mouse.x*.25,.1),length(uv))*2.*md, 1.0);
}
