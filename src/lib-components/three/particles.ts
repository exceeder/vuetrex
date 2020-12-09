/*
 * Linear Particle System
 *
 *
 *
 * Credits:
 * Shader and javascript code derived from several Stack Overflow examples and some work of
 *  Charlie Hoey - http://charliehoey.com
 */

import * as THREE from "three"
import {Object3D} from "three";

export interface ParticleOptions {
    position: THREE.Vector3
    positionRandomness: number
    minMax: THREE.Vector2
    velocity: THREE.Vector3
    velocityRandomness: number
    color: number,
    colorRandomness: number,
    lifetime: number,
    size: number,
    sizeRandomness: number
}

export interface ParticleSystemOptions {
    maxParticles?: number
    containerCount?: number
}

interface FastRandom {
    random: () => number
}

// custom vertex and fragment shaders
// language=GLSL
const vertexShader = `    
uniform float uTime;
uniform float uScale;

attribute vec3 velocity;
attribute vec3 color;
attribute vec2 minMax;
attribute float startTime;
attribute float size;
attribute float lifeTime;

varying vec4 vColor;
varying float lifeLeft;

void main() {

    vec3 pos;
    float timeElapsed = uTime - startTime;
    
    vColor = vec4( color, 1.0 );
    lifeLeft = 1.0 - ( timeElapsed / lifeTime );

    gl_PointSize = uScale * size * lifeLeft;
    pos = position + velocity * timeElapsed;
    
    if (velocity.z > -0.001 && velocity.z < 0.001) {
        pos.x = clamp(pos.x, minMax.x, minMax.y);
        if (pos.x==minMax.x || pos.x == minMax.y) {
            timeElapsed = 0.0;
            gl_PointSize = 0.1;
        }
    } else {
        pos.z = clamp(pos.z, minMax.x, minMax.y);
        if (pos.z==minMax.x || pos.z == minMax.y) {
            timeElapsed = 0.0;
            gl_PointSize = 0.1;
        }
    }

    if( timeElapsed > 0.0 ) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    } else {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        lifeLeft = 0.0;
        gl_PointSize = 0.1;
    }
}`;

// language=GLSL
const fragmentShader = `
float scaleLinear( float value, vec2 valueDomain ) {
    return ( value - valueDomain.x ) / ( valueDomain.y - valueDomain.x );
}

float scaleLinear( float value, vec2 valueDomain, vec2 valueRange ) {
    return mix( valueRange.x, valueRange.y, scaleLinear( value, valueDomain ) );
}

varying vec4 vColor;
varying float lifeLeft;

void main() {
    float alpha = 0.3;
    if( lifeLeft > 0.7 ) {
        alpha = scaleLinear( lifeLeft, vec2( 1.0, 0.95 ), vec2( 0.0, 1.0 ) );
    } else {
        alpha = lifeLeft * 0.55;
    }
    
    float lum = 0.5; //luminosity
    gl_FragColor = vec4(0.3) + vec4( vColor.rgb * lum, alpha * lum );
}`

export class VuetrexParticles extends Object3D implements FastRandom {
    private PARTICLE_COUNT: number;
    private PARTICLE_CONTAINERS: number;
    private PARTICLES_PER_CONTAINER: number;
    private PARTICLE_CURSOR: number;
    private particleContainers: GPUParticleContainer[];
    private rand: number[];

    particleShaderMat: THREE.ShaderMaterial;
    random: () => number;
    time: number;


    constructor(options: ParticleSystemOptions) {
        super();

        options = options || {};

        // parse options and use defaults

        this.PARTICLE_COUNT = options.maxParticles || 1000000;
        this.PARTICLE_CONTAINERS = options.containerCount || 1;

        this.PARTICLES_PER_CONTAINER = Math.ceil(this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS);
        this.PARTICLE_CURSOR = 0;
        this.time = 0;
        this.particleContainers = [];
        this.rand = [];


        // preload a million random numbers
        let i = 0;
        for (i = 16384; i >= 0; i--) {
            this.rand.push(Math.random() - 0.5);
        }
        this.random = () => ++i >= this.rand.length ? this.rand[i = 0] : this.rand[i];

        this.particleShaderMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                'uTime': {
                    value: 0.0
                },
                'uScale': {
                    value: 1.0
                }
            },
            blending: THREE.NormalBlending,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        this.init();
    }

    init() {
        for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
            const c = new GPUParticleContainer(this.PARTICLES_PER_CONTAINER, this);
            this.particleContainers.push(c);
            this.add(c); //Object3D.add()
        }
    }

    spawnParticle(options: ParticleOptions) {
        //console.log("spawn", this.PARTICLE_CURSOR)
        this.PARTICLE_CURSOR++;

        if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) {
            this.PARTICLE_CURSOR = 1;
        }

        const currentContainer = this.particleContainers[Math.floor(this.PARTICLE_CURSOR / this.PARTICLES_PER_CONTAINER)];
        currentContainer.spawnParticle(options);
    }

    update(time: number) {
        for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
            this.particleContainers[i].update(time);
        }
    }

    dispose() {
        this.particleShaderMat.dispose();
        for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
            this.particleContainers[i].dispose();
        }
    }
}

//runners to avoid object creation for each particle
const position = new THREE.Vector3();
const minMax = new THREE.Vector2();
const velocity = new THREE.Vector3();
const color = new THREE.Color();

// Subclass for particle containers, allows for very large arrays to be spread out

class GPUParticleContainer extends THREE.Object3D {
    private PARTICLE_COUNT: number;
    private PARTICLE_CURSOR: number = 0;
    private time: number = 0;
    private offset: number = 0;
    private count: number = 0;
    private DPR: number;
    private gen: FastRandom;
    private particleUpdate: boolean;
    private particleShaderGeo: THREE.BufferGeometry;
    private particleSystem: THREE.Points<THREE.BufferGeometry, any>;
    private particleShaderMat: THREE.ShaderMaterial;

    constructor(maxParticles: number, particleSystem: VuetrexParticles) {
        super();

        this.PARTICLE_COUNT = maxParticles || 100000;
        this.DPR = window.devicePixelRatio;
        this.particleUpdate = false;
        this.gen = particleSystem; //todo extract randomizer

        this.particleShaderMat = particleSystem.particleShaderMat;

        // geometry

        this.particleShaderGeo = new THREE.BufferGeometry();


        this.particleShaderGeo.setAttribute('position', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT * 3, 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('velocity', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT * 3, 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('color', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT * 3, 3).setUsage(THREE.DynamicDrawUsage));

        this.particleShaderGeo.setAttribute('minMax', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT * 2, 2).setUsage(THREE.DynamicDrawUsage));

        this.particleShaderGeo.setAttribute('startTime', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('lifeTime', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('size', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));

        // material
        this.particleSystem = new THREE.Points(this.particleShaderGeo, particleSystem.particleShaderMat)
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
    }

    spawnParticle(options: ParticleOptions) {
        const positionAttribute = this.particleShaderGeo.getAttribute('position');
        const minMaxAttribute = this.particleShaderGeo.getAttribute('minMax');
        const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime');
        const velocityAttribute = this.particleShaderGeo.getAttribute('velocity');
        const colorAttribute = this.particleShaderGeo.getAttribute('color');
        const sizeAttribute = this.particleShaderGeo.getAttribute('size');
        const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime');
        const gen = this.gen;

        options = options || {};

        // setup reasonable default values for all arguments

        options.position !== undefined ? position.copy(options.position) : position.set(0, 0, 0);
        options.minMax !== undefined ? minMax.copy(options.minMax) : minMax.set(-10., 10.);
        options.velocity !== undefined ? velocity.copy(options.velocity) : velocity.set(0, 0, 0);
        options.color !== undefined ? color.set(options.color) : color.set(0xffffff);

        //const positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
        //const velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0;
        const colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1;
        const lifetime = options.lifetime !== undefined ? options.lifetime : 5;
        let size = options.size !== undefined ? options.size : 10;
        const sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;

        if (this.DPR !== undefined) size *= this.DPR;

        const i = this.PARTICLE_CURSOR;

        // position
        positionAttribute.setXYZ(i,
            position.x + gen.random() * 0.035,
            position.y + gen.random() * 0.035,
            position.z + gen.random() * 0.035);

        minMaxAttribute.setXY(i, minMax.x, minMax.y);

        // velocity
        let velX = velocity.x;// + gen.random() * velocityRandomness * velocity.x / 5.0;
        let velY = velocity.y; // + gen.random() * velocityRandomness;
        let velZ = velocity.z;// + gen.random() * velocityRandomness * velocity.y / 5.0;

        // const maxVel = 2;
        // velX = THREE.MathUtils.clamp((velX - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        // velY = THREE.MathUtils.clamp((velY - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        // velZ = THREE.MathUtils.clamp((velZ - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        velocityAttribute.setXYZ(i,velX,velY,velZ)

        // color
        color.r = THREE.MathUtils.clamp(color.r + gen.random() * colorRandomness, 0, 1);
        color.g = THREE.MathUtils.clamp(color.g + gen.random() * colorRandomness, 0, 1);
        color.b = THREE.MathUtils.clamp(color.b + gen.random() * colorRandomness, 0, 1);
        colorAttribute.setXYZ(i, color.r, color.g, color.b)

        // size, lifetime and startTime
        sizeAttribute.setX(i, size + gen.random() * sizeRandomness);
        lifeTimeAttribute.setX(i,  lifetime);
        startTimeAttribute.setX(i, this.time);

        // offset

        if (this.offset === 0) {
            this.offset = this.PARTICLE_CURSOR;
        }

        // counter and cursor
        this.count++;
        this.PARTICLE_CURSOR++;

        if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) {
            this.PARTICLE_CURSOR = 0;
        }
        this.particleUpdate = true;
    }


    update(time: number) {
        this.time = time;
        this.particleShaderMat.uniforms.uTime.value = time;
        this.geometryUpdate();
    }

    geometryUpdate() {

        if (this.particleUpdate) {

            this.particleUpdate = false;

            const positionAttribute = this.particleShaderGeo.getAttribute('position') as THREE.BufferAttribute;
            const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime') as THREE.BufferAttribute;
            const minMaxAttribute = this.particleShaderGeo.getAttribute('minMax') as THREE.BufferAttribute;
            const velocityAttribute = this.particleShaderGeo.getAttribute('velocity') as THREE.BufferAttribute;
            const colorAttribute = this.particleShaderGeo.getAttribute('color') as THREE.BufferAttribute;
            const sizeAttribute = this.particleShaderGeo.getAttribute('size') as THREE.BufferAttribute;
            const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime') as THREE.BufferAttribute;

            const updateCountsOffsets = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => {
                    attr.updateRange.offset = this.offset * attr.itemSize
                    attr.updateRange.count = this.count * attr.itemSize
                    attr.needsUpdate = true;
                });
            }

            const resetCountsOffsets = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => {
                    attr.updateRange.offset = 0
                    attr.updateRange.count = -1
                    attr.needsUpdate = false;
                });
            }

            if (this.offset + this.count < this.PARTICLE_COUNT) {
                updateCountsOffsets(positionAttribute,
                    startTimeAttribute,
                    minMaxAttribute,
                    velocityAttribute,
                    colorAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)
            } else {
                resetCountsOffsets(positionAttribute,
                    startTimeAttribute,
                    minMaxAttribute,
                    velocityAttribute,
                    colorAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)
            }

            this.offset = 0;
            this.count = 0;
        }

    }

    dispose() {
        this.particleShaderGeo.dispose();
    }
}
