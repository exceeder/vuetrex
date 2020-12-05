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
    velocity: THREE.Vector3
    velocityRandomness: number
    color: number,
    colorRandomness: number,
    turbulence: number,
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

// custom vertex and fragement shader
const vertexShader = `
uniform float uTime;
uniform float uScale;

attribute vec3 positionStart;
attribute float startTime;
attribute vec3 velocity;
attribute float turbulence;
attribute vec3 color;
attribute float size;
attribute float lifeTime;

varying vec4 vColor;
varying float lifeLeft;

void main() {

// unpack things from our attributes

    vColor = vec4( color, 1.0 );

// convert our velocity back into a value we can use

    vec3 newPosition;
    vec3 v;

    float timeElapsed = uTime - startTime;

    lifeLeft = 1.0 - ( timeElapsed / lifeTime );

    gl_PointSize = ( uScale * size ) * lifeLeft;

    v.x = ( velocity.x - 0.5 ) * 0.5;
    v.y = ( velocity.y - 0.5 ) * 0.5;
    v.z = ( velocity.z - 0.5 ) * 0.5;

    newPosition = positionStart + v * timeElapsed * 3.0;
    if (velocity.z == 0.) {
        newPosition.x = clamp(newPosition.x,-5.,5.);
    } else {
        newPosition.z = clamp(newPosition.z,-3.,3.);
    }
    newPosition = mix( newPosition, newPosition + vec3(  turbulence * 9.0 ), ( timeElapsed / lifeTime ) );

    if( timeElapsed > 0.0 ) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    } else {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        lifeLeft = 0.0;
        gl_PointSize = 0.1;
    }
}`;

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
    if( lifeLeft > 0.9 ) {
        alpha = scaleLinear( lifeLeft, vec2( 1.0, 0.95 ), vec2( 0.0, 1.0 ) );
    } else {
        alpha = lifeLeft * 0.55;
    }
    vec4 tex = vec4(0.3); 
    gl_FragColor = vec4(0.3) + vec4( vColor.rgb * tex.a, alpha * tex.a );
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
        console.log("Particle constructor", options)

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
        for (i = 1e5; i > 0; i--) {
            this.rand.push(Math.random() - 0.5);
        }

        this.random = () => {
            return ++i >= this.rand.length ? this.rand[i = 0] : this.rand[i];
        }

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
            blending: THREE.AdditiveBlending,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        console.log(this.particleShaderMat)

        // define defaults for all values

        this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [0, 0, 0, 0];
        this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [0, 0, 0, 0];

        this.init();
        console.log("initied, ",this.PARTICLE_CURSOR)
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
const velocity = new THREE.Vector3();
const color = new THREE.Color();

// Subclass for particle containers, allows for very large arrays to be spread out

class GPUParticleContainer extends THREE.Object3D {
    private SEGMENT_COUNT: number = 1024;
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

        this.particleShaderGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('positionStart', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('segments', new THREE.BufferAttribute(new Float32Array(this.SEGMENT_COUNT * 3), 3).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(THREE.DynamicDrawUsage));

        this.particleShaderGeo.setAttribute('startTime', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('lifeTime', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('turbulence', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(THREE.DynamicDrawUsage));

        // material
        this.particleSystem = new THREE.Points(this.particleShaderGeo, particleSystem.particleShaderMat)
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
    }

    spawnParticle(options: ParticleOptions) {
        const positionStartAttribute = this.particleShaderGeo.getAttribute('positionStart');
        const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime');
        const velocityAttribute = this.particleShaderGeo.getAttribute('velocity');
        const turbulenceAttribute = this.particleShaderGeo.getAttribute('turbulence');
        const colorAttribute = this.particleShaderGeo.getAttribute('color');
        const sizeAttribute = this.particleShaderGeo.getAttribute('size');
        const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime');
        const gen = this.gen;

        options = options || {};

        // setup reasonable default values for all arguments

        options.position !== undefined ? position.copy(options.position) : position.set(0, 0, 0);
        options.velocity !== undefined ? velocity.copy(options.velocity) : velocity.set(0, 0, 0);
        options.color !== undefined ? color.set(options.color) : color.set(0xffffff);

        const positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
        const velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0;
        const colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1;
        const turbulence = options.turbulence !== undefined ? options.turbulence : 1;
        const lifetime = options.lifetime !== undefined ? options.lifetime : 5;
        let size = options.size !== undefined ? options.size : 10;
        const sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
        //const smoothPosition = false; //todo check options.smoothPosition !== undefined ? options.smoothPosition : false;

        if (this.DPR !== undefined) size *= this.DPR;

        const i = this.PARTICLE_CURSOR;

        // position

        if (options.velocity?.z == 0.0) {
            positionStartAttribute.setXYZ(i,
                gen.random() > 0.4 ? position.x : position.x + gen.random() * positionRandomness,
                position.y + gen.random() * 0.02,
                position.z + gen.random() * 0.02);
        } else {
            positionStartAttribute.setXYZ(i,
                position.x + gen.random() * 0.02,
                position.y + gen.random() * 0.02,
                gen.random() > 0.4 ? position.x : position.x + gen.random() * positionRandomness);
        }

        // if (smoothPosition) {
        //     startPosArr[i * 3    ] += -(velocity.x * gen.random());
        //     startPosArr[i * 3 + 1] += -(velocity.y * gen.random());
        //     startPosArr[i * 3 + 2] += -(velocity.z * gen.random());
        // }

        // velocity

        const maxVel = 2;
        let velX = velocity.x + gen.random() * velocityRandomness * 0.5;
        let velY = velocity.y + gen.random() * velocityRandomness * 0.5;
        let velZ = velocity.z + gen.random() * velocityRandomness * 0.5;

        velX = THREE.MathUtils.clamp((velX - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        velY = THREE.MathUtils.clamp((velY - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        velZ = THREE.MathUtils.clamp((velZ - (-maxVel)) / (maxVel - (-maxVel)), 0, 1);
        velocityAttribute.setXYZ(i,velX,velY,velZ)

        // color
        color.r = THREE.MathUtils.clamp(color.r + gen.random() * colorRandomness, 0, 1);
        color.g = THREE.MathUtils.clamp(color.g + gen.random() * colorRandomness, 0, 1);
        color.b = THREE.MathUtils.clamp(color.b + gen.random() * colorRandomness, 0, 1);
        colorAttribute.setXYZ(i, color.r, color.g, color.b)

        // turbulence, size, lifetime and startTime

        turbulenceAttribute.setX(i, turbulence);
        sizeAttribute.setX(i, size + gen.random() * sizeRandomness);
        lifeTimeAttribute.setX(i,  lifetime);
        startTimeAttribute.setX(i, this.time + gen.random() * 0.01);

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

            const positionStartAttribute = this.particleShaderGeo.getAttribute('positionStart') as THREE.BufferAttribute;
            const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime') as THREE.BufferAttribute;
            const velocityAttribute = this.particleShaderGeo.getAttribute('velocity') as THREE.BufferAttribute;
            const turbulenceAttribute = this.particleShaderGeo.getAttribute('turbulence') as THREE.BufferAttribute;
            const colorAttribute = this.particleShaderGeo.getAttribute('color') as THREE.BufferAttribute;
            const sizeAttribute = this.particleShaderGeo.getAttribute('size') as THREE.BufferAttribute;
            const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime') as THREE.BufferAttribute;

            const updateOffsets = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => attr.updateRange.offset = this.offset * attr.itemSize);
            }

            const updateCounts = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => attr.updateRange.count = this.count * attr.itemSize);
            }

            if (this.offset + this.count < this.PARTICLE_COUNT) {
                updateOffsets(positionStartAttribute,
                    startTimeAttribute,
                    velocityAttribute,
                    turbulenceAttribute,
                    colorAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)

                updateCounts(positionStartAttribute,
                    startTimeAttribute,
                    velocityAttribute,
                    turbulenceAttribute,
                    colorAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)
            } else {

                positionStartAttribute.updateRange.offset = 0;
                startTimeAttribute.updateRange.offset = 0;
                velocityAttribute.updateRange.offset = 0;
                turbulenceAttribute.updateRange.offset = 0;
                colorAttribute.updateRange.offset = 0;
                sizeAttribute.updateRange.offset = 0;
                lifeTimeAttribute.updateRange.offset = 0;

                // Use -1 to update the entire buffer, see #11476
                positionStartAttribute.updateRange.count = -1;
                startTimeAttribute.updateRange.count = -1;
                velocityAttribute.updateRange.count = -1;
                turbulenceAttribute.updateRange.count = -1;
                colorAttribute.updateRange.count = -1;
                sizeAttribute.updateRange.count = -1;
                lifeTimeAttribute.updateRange.count = -1;

            }

            positionStartAttribute.needsUpdate = true;
            startTimeAttribute.needsUpdate = true;
            velocityAttribute.needsUpdate = true;
            turbulenceAttribute.needsUpdate = true;
            colorAttribute.needsUpdate = true;
            sizeAttribute.needsUpdate = true;
            lifeTimeAttribute.needsUpdate = true;

            this.offset = 0;
            this.count = 0;
        }

    }

    dispose() {
        this.particleShaderGeo.dispose();
    }
}
