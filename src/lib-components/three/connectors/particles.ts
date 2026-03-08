/*
 * Linear Particle System
 *
 *
 *
 * Credits:
 * Shader and JavaScript code derived from several Stack Overflow examples and some work of
 *  Charlie Hoey - http://charliehoey.com
 */

import * as THREE from 'three'
import {Object3D} from 'three';
import fragmentShader from './glsl/p-fragment.glsl';
import vertexShader from './glsl/p-vertex.glsl';

export interface ParticleOptions {
    position: THREE.Vector3
    positionRandomness: number
    particleSpread: number
    minMax: THREE.Vector2
    velocity: THREE.Vector3
    lifetime: number,
    size: number,
    sizeRandomness: number
}

export interface ParticleSystemOptions {
    blending?: THREE.Blending
    maxParticles?: number
    color: number
}

interface FastRandom {
    /**
     * @return noise producing function in [-0.5..0.5) range
     */
    random: () => number
}

/**
 * Class representing a particle system with GPU-accelerated support and customizable shaders.
 * Extends the THREE.Object3D class.
 *
 */
export class VuetrexParticles extends Object3D implements FastRandom {
    private readonly PARTICLE_COUNT: number;
    private particleContainer: GPUParticleContainer;
    private readonly rand: number[];

    particleShaderMat: THREE.ShaderMaterial;

    random: () => number;
    time: number;


    constructor(options: ParticleSystemOptions) {
        super();

        options = options || {};

        // parse options and use defaults, don't go over 100k particles
        this.PARTICLE_COUNT = options.maxParticles || 100000;

        this.time = 0;
        this.rand = [];

        {
            // FastRandom implementation, preload a million random numbers, closed under array and counter
            let idx = 0, rand = [], N = 16384;
            for (idx = N; idx >= 0; idx--) rand.push(Math.random() - 0.5);
            this.random = () => ++idx >= rand.length ? rand[idx = 0] : rand[idx];
        }

        const particleColor = new THREE.Color();
        particleColor.set(options.color || 0xffffff);

        this.particleShaderMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: true,
            uniforms: {
                'uTime': {
                    value: 0.0
                },
                'uScale': {
                    value: 1.0
                },
                'uColor': {
                    value: particleColor
                }
            },
            blending: options.blending || THREE.AdditiveBlending,
            side: THREE.FrontSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        this.particleContainer = new GPUParticleContainer(this.PARTICLE_COUNT, this);
        this.add(this.particleContainer); //Object3D.add()
    }

    spawnParticle(options: ParticleOptions) {
        this.particleContainer.spawnParticle(options);
    }

    update(time: number) {
        this.particleContainer.update(time);
    }

    dispose() {
        this.particleShaderMat.dispose();
        this.particleContainer.dispose();
        this.clear();
    }
}

//runners to avoid object creation for each particle
const position = new THREE.Vector3();
const minMax = new THREE.Vector2();
const velocity = new THREE.Vector3();

/**
 * A container for managing GPU-based particles in a Three.js rendering system.
 * Extends `THREE.Object3D` and represents a point cloud-based particle system.
 * Each particle is defined by multiple attributes including position, velocity, color, size, and lifetime.
 */
class GPUParticleContainer extends THREE.Object3D {
    private PARTICLE_COUNT: number;
    private PARTICLE_CURSOR: number = 0;
    private time: number = 0;
    private offset: number = 0;
    private DPR: number;
    private gen: FastRandom;
    private particleUpdate: boolean;
    private particleShaderGeo: THREE.BufferGeometry;
    private particleSystem: THREE.Points<THREE.BufferGeometry, any>;
    private particleShaderMat: THREE.ShaderMaterial;

    count: number = 0;

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

        this.particleShaderGeo.setAttribute('minMax', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT * 2, 2).setUsage(THREE.DynamicDrawUsage));

        this.particleShaderGeo.setAttribute('startTime', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('lifeTime', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));
        this.particleShaderGeo.setAttribute('size', new THREE.Float32BufferAttribute(this.PARTICLE_COUNT, 1).setUsage(THREE.DynamicDrawUsage));

        // material
        this.particleSystem = new THREE.Points(this.particleShaderGeo, particleSystem.particleShaderMat)
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
        this.particleSystem.renderOrder = 999;
    }

    spawnParticle(options: ParticleOptions) {
        const positionAttribute = this.particleShaderGeo.getAttribute('position') as THREE.Float32BufferAttribute;
        const minMaxAttribute = this.particleShaderGeo.getAttribute('minMax') as THREE.Float32BufferAttribute;
        const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime') as THREE.Float32BufferAttribute;
        const velocityAttribute = this.particleShaderGeo.getAttribute('velocity') as THREE.Float32BufferAttribute;
        const sizeAttribute = this.particleShaderGeo.getAttribute('size') as THREE.Float32BufferAttribute;
        const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime') as THREE.Float32BufferAttribute;
        const gen = this.gen;

        options = options || {};

        // setup reasonable default values for all arguments

        options.position !== undefined ? position.copy(options.position) : position.set(0, 0, 0);
        options.minMax !== undefined ? minMax.copy(options.minMax) : minMax.set(-10., 10.);
        options.velocity !== undefined ? velocity.copy(options.velocity) : velocity.set(0, 0, 0);
        const lifetime = options.lifetime !== undefined ? options.lifetime : 25;
        let size = options.size !== undefined ? options.size : 10;
        const sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;

        if (this.DPR !== undefined) size *= this.DPR;

        const i = this.PARTICLE_CURSOR;

        // position
        positionAttribute.setXYZ(i,
            position.x + gen.random() * options.particleSpread,
            position.y + gen.random() * options.particleSpread,
            position.z + gen.random() * options.particleSpread);

        minMaxAttribute.setXY(i, minMax.x, minMax.y);

        // velocity
        let velX = velocity.x;
        let velY = velocity.y;
        let velZ = velocity.z;

        velocityAttribute.setXYZ(i,velX,velY,velZ)

        // size, lifetime and startTime
        sizeAttribute.setX(i, size + gen.random() * sizeRandomness) ;
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

    /**
     * Updates the geometry for particle attributes of a single particle if a particle update is flagged.
     * Determines whether to update or reset the update ranges of various buffer attributes based on the offset and count.
     * Resets the offset and count values after processing.
     */
    geometryUpdate(): void {

        if (this.particleUpdate) {

            this.particleUpdate = false;

            const positionAttribute = this.particleShaderGeo.getAttribute('position') as THREE.BufferAttribute;
            const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime') as THREE.BufferAttribute;
            const minMaxAttribute = this.particleShaderGeo.getAttribute('minMax') as THREE.BufferAttribute;
            const velocityAttribute = this.particleShaderGeo.getAttribute('velocity') as THREE.BufferAttribute;
            const sizeAttribute = this.particleShaderGeo.getAttribute('size') as THREE.BufferAttribute;
            const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime') as THREE.BufferAttribute;

            const updateCountsOffsets = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => {
                    attr.addUpdateRange(this.offset * attr.itemSize, this.count * attr.itemSize);
                    attr.needsUpdate = true;
                });
            }

            const resetCountsOffsets = (...attrs: THREE.BufferAttribute[]) => {
                attrs.forEach(attr => {
                    attr.addUpdateRange(0, 0);
                    attr.needsUpdate = false;
                });
            }

            if (this.offset + this.count < this.PARTICLE_COUNT) {
                updateCountsOffsets(positionAttribute,
                    startTimeAttribute,
                    minMaxAttribute,
                    velocityAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)
            } else {
                resetCountsOffsets(positionAttribute,
                    startTimeAttribute,
                    minMaxAttribute,
                    velocityAttribute,
                    sizeAttribute,
                    lifeTimeAttribute)
            }

            this.offset = 0;
            this.count = 0;
        }

    }

    dispose() {
        this.particleShaderGeo.dispose();
        this.particleSystem.clear();
    }
}
