import { VuetrexStage } from '@/lib-components/three/stage.js';
import { Segment } from '@/lib-components/three/connectors/path.js';
import { ConnectorRenderer } from '@/lib-components/three/connectors/types.js';
import * as THREE from 'three';

const LINE_HEIGHT = -0.1;
export class LineRenderer implements ConnectorRenderer {
    private group = new THREE.Group();
    private material = new THREE.LineBasicMaterial({ color: 0xa0ffff });

    constructor(private stage: VuetrexStage) {
        this.stage.scene.add(this.group);
    }

    update(segments: Segment[], timer: number, tick: number): void {
        // Simple implementation: rebuild lines every frame or only when segments change
        // For efficiency, we'll clear and rebuild for now
        this.group.clear();

        const points: THREE.Vector3[] = [];
        for (const s of segments) {
            if (s.horizontal) {
                points.push(new THREE.Vector3(s.s, LINE_HEIGHT, s.mid));
                points.push(new THREE.Vector3(s.t, LINE_HEIGHT, s.mid));
            } else {
                points.push(new THREE.Vector3(s.mid, LINE_HEIGHT, s.s));
                points.push(new THREE.Vector3(s.mid, LINE_HEIGHT, s.t));
            }
        }

        if (points.length > 0) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.LineSegments(geometry, this.material);
            this.group.add(line);
        }
    }

    dispose(): void {
        this.group.clear();
        this.stage.scene.remove(this.group);
        this.material.dispose();
    }
}
