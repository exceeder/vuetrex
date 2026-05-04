import { VuetrexStage } from '@/lib-components/three/stage.js';
import { VuetrexParticles, ParticleOptions } from '@/lib-components/three/connectors/particles.js';
import { Segment, ConnectorPath } from '@/lib-components/three/connectors/path.js';
import { ConnectorRenderer } from '@/lib-components/three/connectors/types.js';
import * as THREE from 'three';

const options: ParticleOptions = {
    position: new THREE.Vector3(-2.5, 0.2, -0.5),
    positionRandomness: 1.05,
    velocity: new THREE.Vector3(0.1, 0, 0),
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

const LINE_HEIGHT = -0.05;

export class ParticleRenderer implements ConnectorRenderer {
    private particleSystem: VuetrexParticles;

    constructor(private stage: VuetrexStage) {
        this.particleSystem = new VuetrexParticles({
            blending: stage.settings.particleBlending,
            maxParticles: spawnerOptions.maxParticles,
            color: stage.settings.particleColor || 0xa0ffff
        });
        this.stage.scene.add(this.particleSystem);
        options.particleSpread = stage.settings.particleSpread || 0.035;
        spawnerOptions.spawnRate = stage.settings.particleVolume || 50;
    }

    update(segments: Segment[], timer: number, tick: number): void {
        if (segments.length === 0) return;

        // Create a temporary ConnectorPath to use its sample method
        // In a real refactor, we might want to move sample logic to a shared utility
        const path = new ConnectorPath();
        (path as any).segments = segments;
        (path as any).updateLen();
        const totalLen = path.totaLength();

        for (let idx = 0; idx < spawnerOptions.spawnRate; idx++) {
            const rnd = this.particleSystem.random();
            const xys = path.sample(rnd * totalLen);
            const s = xys.s;
            if (s === null) continue;

            let start = s.s;
            let end = s.t;
            options.minMax.set(Math.min(start, end), Math.max(start, end));
            const len = options.minMax.y - options.minMax.x || 1;
            options.position.set(xys.x, LINE_HEIGHT, xys.y);
            if (s.horizontal)
                options.velocity.set((end - start) / len / 50.0, 0, 0);
            else
                options.velocity.set(0, 0, (end - start) / len / 50.0);
            this.particleSystem.spawnParticle(options);
        }
        this.particleSystem.update(tick);
    }

    dispose(): void {
        this.particleSystem.dispose();
        this.stage.scene.remove(this.particleSystem);
    }
}
