import {VuetrexStage} from "../stage";
import {VuetrexParticles, ParticleOptions} from "@/lib-components/three/connectors/particles";
import {Segment, ConnectorPath} from "@/lib-components/three/connectors/path";
import Element3d from "@/lib-components/three/element3d";
import * as THREE from "three"

const options: ParticleOptions = {
    position: new THREE.Vector3(-2.5, 0.2, -0.5),
    positionRandomness: 1.05,
    velocity: new THREE.Vector3(0.1,0,0),
    minMax: new THREE.Vector2(-5.0, 5.0),
    particleSpread: 0.015,
    lifetime: 50,
    size: 0.8,
    sizeRandomness: 0.3
};

const spawnerOptions = {
    spawnRate: 10,
    horizontalSpeed: 0.2,
    verticalSpeed: 0.2,
    timeScale: 1.0,
    maxParticles: 12500
};


/**
 * The Connectors class is responsible for managing connections between elements in a 3D scene,
 * represented by segments and enhanced with particle animations.
 */
export class Connectors {

    stage: VuetrexStage;
    private readonly particleSystem: VuetrexParticles | null = null
    private segments: ConnectorPath = new ConnectorPath()

    constructor(stage: VuetrexStage) {
        this.stage = stage;

        //particles
        this.particleSystem = new VuetrexParticles( {
            blending: stage.settings.particleBlending,
            maxParticles: spawnerOptions.maxParticles,
            color: stage.settings.particleColor || 0xa0ffff
        } );
        this.stage.scene.add( this.particleSystem );
        //TODO apply unused spawnerOptions
        this.stage.registerAnimation(this.animateParticles());
        options.particleSpread  = stage.settings.particleSpread || 0.035;
        spawnerOptions.spawnRate  = stage.settings.particleVolume || 50;
    }

    connect(el1: Element3d, el2: Element3d) {
       this.segments.connect(el1, el2);
    }

    update(el: Element3d) {
        const removed = this.remove(el);
        //removed has multiple segments per pair, we only need unique pairs
        const processed : string[] = [];

        for (let s of removed) {
            const id = s.sEl.mesh?.name + "~"+s.tEl.mesh?.name
            if (processed.indexOf(id) >=0 ) continue;
            processed.push(id);
            this.connect(s.sEl, s.tEl); //re-calculate the paths in case this object moved
        }
    }

    remove(el: Element3d): Segment[] {
      return this.segments.remove(el);
    }

    clear() {
        this.particleSystem?.dispose();
        this.segments.clear();
    }

    /**
     * Animates particles within a particle system by spawning and updating particles
     * based on defined spawner options and segment data.
     *
     * The method calculates random positions, velocities, and other parameters
     * for the particles and assigns them to spawn particles in the system. It also
     * handles the update of particle states over time.
     *
     * @return {Function} A function with `timer` and `tick` parameters.
     * The `timer` parameter represents the elapsed time, and the `tick` parameter
     * represents the current system update tick. The returned function performs
     * particle spawning and updates.
     */
    animateParticles(): (timer: number, tick: number) => void {
        return (timer, tick) => {
            if (!this.particleSystem) return;
            const particles = this.particleSystem;

            for (let x = 0; x < spawnerOptions.spawnRate; x++) {
                if (this.segments.size() == 0) continue;
                const rnd = particles.random() + 0.5;
                const rnd2 = particles.random() + 0.75;
                const seg = Math.floor(rnd * 16384 + timer) % this.segments.size()
                const s = this.segments.getSegment(seg);
                const mid = s.mid;
                let start = s.s;
                let end = s.t;
                //if (particles.random() > 0.0) {const t = start; start = end; end = t;}
                options.minMax.set(Math.min(start, end), Math.max(start, end))
                const len = options.minMax.y - options.minMax.x;
                if (s.horizontal) {
                    options.position.set(start + (end - start) * rnd * rnd2, 0.15, mid)
                    options.velocity.set((end - start) / len / 40.0, 0, 0);
                } else {
                    //vertical
                    options.position.set(mid, 0.15, start + (end - start) * rnd * rnd2)
                    options.velocity.set(0, 0, (end - start) / len / 40.0);
                }
                particles.spawnParticle(options);
            }
            particles.update(tick);
        }
    }

}
