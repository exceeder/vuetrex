//coming from app.js uniforms
uniform float time;
uniform vec4 resulution;
uniform vec4 mouse; //xy - move, zw - click

//app.js shader material attributes
//attribute position

varying vec2 vUv;
varying float vOpacity;

void main()
{
   vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
   vec2 cUv = 2.*uv - 1.0;

   vec3 origCol  = vec3(10./255., 20./255., 30./255.);
   vec4 col = vec4(0.05 / length(cUv));
   col.rgb = min(vec3(10.),col.rgb);
   col.rgb *= origCol * 20.0;
   col.a = 0.01 / length(cUv);
   gl_FragColor = vec4(col.rgb, col.a);
}