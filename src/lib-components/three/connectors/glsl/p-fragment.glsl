float scaleLinear( float value, vec2 valueDomain ) {
    return ( value - valueDomain.x ) / ( valueDomain.y - valueDomain.x );
}

float scaleLinear( float value, vec2 valueDomain, vec2 valueRange ) {
    return mix( valueRange.x, valueRange.y, scaleLinear( value, valueDomain ) );
}

varying vec4 vColor;
varying float lifeLeft;

void main() {
    float brightness = scaleLinear( lifeLeft, vec2( 1.0, 0.85 ), vec2( 0.0, 2.0 ) );
    brightness = max(1.0, brightness);

    vec2 cUv = vec2(gl_PointCoord.x, gl_PointCoord.y) - .5;

    vec3 origCol  = vec3(vColor.r, vColor.g, vColor.b);
    vec4 col = vec4(0.0015 / length(cUv));
    col.rgb = min(vec3(0.02), col.rgb);
    col.rgb *= origCol * 20.0;
    col.a = 0.003 / length(cUv);

    col.a = smoothstep(0., 0.99, col.a * brightness);
    gl_FragColor = vec4(col.rgb, col.a);
}
