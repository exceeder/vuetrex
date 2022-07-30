import {VuetrexStage} from "./stage";
import {VuetrexParticles, ParticleOptions} from "@/lib-components/three/particles";
import * as THREE from "three"
import Element3d from "@/lib-components/three/element3d";

const options: ParticleOptions = {
    position: new THREE.Vector3(-2.5, 0.2, -0.5),
    positionRandomness: 1.95,
    velocity: new THREE.Vector3(0.1,0,0),
    minMax: new THREE.Vector2(-5.0, 5.0),
    velocityRandomness: 0.001,
    particleSpread: 0.035,
    color: 0xa0ffff,
    colorRandomness: 0.1,
    lifetime: 35,
    size: 0.9,
    sizeRandomness: 0.3
};

const spawnerOptions = {
    spawnRate: 50,
    horizontalSpeed: 0.2,
    verticalSpeed: 0.2,
    timeScale: 1.0,
    maxParticles: 12500,
    containerCount: 1
};


// class Connector {
//     sEl: Element3d
//     tEl: Element3d
//     isVertical: boolean
//     mid: number
//     s: number
//     t: number
// }

class Segment {
    horizontal: boolean
    mid: number
    s: number
    t: number
    len: number
    sEl: Element3d
    tEl: Element3d
    constructor(horizontal: boolean, mid: number, s: number, t: number, sEl: Element3d, tEl: Element3d) {
        this.horizontal = horizontal;
        this.mid = mid
        this.s = s
        this.t = t
        this.len = Math.abs(t-s);
        this.sEl = sEl;
        this.tEl = tEl;
    }
}

export class Connectors {

    stage: VuetrexStage;
    private readonly particleSystem: VuetrexParticles | null = null
    private segments: Segment[] = []
    //private dangling: Segment[] = []

    constructor(stage: VuetrexStage) {
        this.stage = stage;

        //particles
        this.particleSystem = new VuetrexParticles( {
            blending: stage.settings.particleBlending,
            maxParticles: spawnerOptions.maxParticles,
            containerCount: spawnerOptions.containerCount
        } );
        this.stage.scene.add( this.particleSystem );
        this.stage.onAnimate(this.animateParticles());
        options.color = stage.settings.particleColor || 0xa0ffff;
        options.particleSpread  = stage.settings.particleSpread || 0.035;
        spawnerOptions.spawnRate  = stage.settings.particleVolume || 50;
    }



    connect(el1: Element3d, el2: Element3d) {

        const snap = (a:number) => Math.round(a/1.5)*1.5;

        const sx = snap(el1.mesh?.position.x || 0)
        const sy = snap(el1.mesh?.position.z || 0)
        const tx = snap(el2.mesh?.position.x || 0)
        const ty = snap(el2.mesh?.position.z || 0)

        if( Math.abs(sy-ty) < 0.01 ) {
            //single horizontal line
            this.segments.push(new Segment(true, sy, sx, tx, el1, el2))
        } else if( Math.abs(sx-tx) < 0.01 ) {
            //single vertical line
            this.segments.push(new Segment(false, sx, sy, ty, el1, el2))
        } else if (Math.abs(tx-sx) / 2 > Math.abs(ty-sy)) {
            //zig-zag
            let midy = snap(( sy + ty ) / 2 );

            //if (midy > 0) midy += 0.3; else midy -= 0.3;

            this.segments.push(new Segment(false, sx, sy, midy, el1, el2))
            this.segments.push(new Segment(true, midy, sx, tx, el1, el2))
            this.segments.push(new Segment(false, tx, midy, ty, el1, el2))
        } else {
            let midx = snap(( sx + tx ) / 2);
            if (midx % 1 === 0.5) midx += 1.0; //offset to avoid hitting things
            this.segments.push(new Segment(true, sy, sx, midx, el1, el2))
            this.segments.push(new Segment(false, midx, sy, ty, el1, el2))
            this.segments.push(new Segment(true, ty, midx, tx, el1, el2))
        }
    }

    update(el: Element3d) {
        const removed = this.remove(el);
        //removed has multiple segments per pair, we only need unique pairs
        const processed : string[] = [];

        for (let s of removed) {
            const id = s.sEl.mesh?.name + "~"+s.tEl.mesh?.name
            if (processed.indexOf(id) >=0 ) continue;
            processed.push(id);
            this.connect(s.sEl, s.tEl); //re-calculate the paths in case object moved
        }
    }

    remove(el: Element3d): Segment[] {
        const removed = this.segments.filter(s => s.sEl === el || s.tEl === el);
        this.segments = this.segments.filter(s => s.sEl !== el && s.tEl !== el);
        return removed;
    }

    clear() {
        this.particleSystem?.dispose();
        this.segments.splice(0, this.segments.length);
    }

    animateParticles() {
        return (timer: number, tick: number) => {
            if (!this.particleSystem) return;
            const particles = this.particleSystem;

            for (let x = 0; x < spawnerOptions.spawnRate; x++) {
                if (this.segments.length == 0) continue;
                const rnd = particles.random() + 0.5;
                const rnd2 = particles.random() + 0.75;
                const seg = Math.floor(rnd * 16384) % this.segments.length
                const s = this.segments[seg];
                const mid = s.mid;
                let start = s.s;
                let end = s.t;
                //if (particles.random() > -2.0) {const t = start;start = end;end = t;}
                options.minMax.set(Math.min(start, end), Math.max(start, end))
                const len = (options.minMax.y - options.minMax.x);
                if (s.horizontal) {
                    options.position.set(start + (end - start) * rnd * rnd2, -0.25, mid)
                    options.velocity.set((end - start) / len / 30.0, 0, 0);
                } else {
                    //vertical
                    options.position.set(mid, -0.25, start + (end - start) * rnd * rnd2)
                    options.velocity.set(0, 0, (end - start) / len / 50);
                }
                particles.spawnParticle(options);
            }
            particles.update(tick);
        }
    }

}