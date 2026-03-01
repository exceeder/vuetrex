uniform float uTime;
uniform float uScale;
uniform vec3 uColor;

attribute vec3 velocity;
//attribute vec3 color;
attribute vec2 minMax;
attribute float startTime;
attribute float size;
attribute float lifeTime;

varying vec4 vColor;
varying float lifeLeft;

void main() {

    vec3 pos;
    float timeElapsed = uTime - startTime;

    vColor = vec4( uColor, 1.0 );
    lifeLeft = 1.0 - ( timeElapsed / lifeTime );

    gl_PointSize = 30.0*uScale * size * lifeLeft;
    pos = position + velocity * timeElapsed;

    if (velocity.z > -0.001 && velocity.z < 0.001) {
        pos.x = clamp(pos.x, minMax.x, minMax.y);
        if (pos.x == minMax.x || pos.x == minMax.y) {
            timeElapsed = 0.0;
            gl_PointSize = 0.1;
        }
    } else {
        pos.z = clamp(pos.z, minMax.x, minMax.y);
        if (pos.z == minMax.x || pos.z == minMax.y) {
            timeElapsed = 0.0;
            gl_PointSize = 0.1;
        }
    }

    if( timeElapsed > 0.0 ) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
    else {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        lifeLeft = 0.0;
        gl_PointSize = 0.1;
    }
}
