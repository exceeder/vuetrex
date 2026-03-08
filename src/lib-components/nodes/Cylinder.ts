import { MeshNode } from '@/lib-components/nodes/MeshNode';
import { VuetrexStage } from '@/lib-components/three/stage';
import * as THREE from 'three';

export class Cylinder extends MeshNode {

    protected readonly flushMode = 'sync' as const;

    constructor(stage: VuetrexStage) {
        super(stage, { height: 0.33 });
    }

    private cylindricalSleeveSegment(size: number, N: number, { r = 0.5, R = 0.55 } = {}): THREE.BufferGeometry {
        const theta = Math.PI * 2 / N - Math.PI * 2 / 30;
        const rr = size * r, RR = size * R;
        const shape = new THREE.Shape();
        shape.moveTo(rr, 0);
        shape.absarc(0, 0, RR, 0, theta, false);
        shape.lineTo(rr * Math.cos(theta), rr * Math.sin(theta));
        shape.absarc(0, 0, rr, theta, 0, true);
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            depth: this.stage.boxRadius / 5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
    }

    private beveledCylinder(size: number): THREE.BufferGeometry {
        const width = size / 2.5 || 1.0;
        const shape = new THREE.Shape();
        shape.moveTo(width, 0);
        shape.absarc(0, 0, width, 0, Math.PI / 2, false);
        shape.absarc(0, 0, width, Math.PI / 2, Math.PI, false);
        shape.absarc(0, 0, width, Math.PI, Math.PI * 3 / 2, false);
        shape.absarc(0, 0, width, Math.PI * 3 / 2, Math.PI * 1.999, false);
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            depth: this.stage.boxRadius / 6,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.07,
            bevelOffset: 0,
            bevelSegments: 5
        });
    }

    modelGen(): (height: number, size: number) => THREE.Object3D {
        return (_height, size) => {
            const bMaterial = this.stage.createElementMaterial();
            if (size < 1.5) {
                const geometry = this.beveledCylinder(size);
                geometry.rotateX(Math.PI / 2);
                geometry.translate(0, 0.19, 0);
                return new THREE.Mesh(geometry, bMaterial);
            } else {
                const group = new THREE.Group();
                const N = 8;
                for (let i = 0; i < N; i++) {
                    const geometry = this.cylindricalSleeveSegment(size, N + 5);
                    geometry.rotateX(Math.PI / 2);
                    geometry.rotateY(2 * Math.PI / N * i);
                    geometry.translate(0, 0.19, 0);
                    group.add(new THREE.Mesh(geometry, bMaterial));
                }
                return group;
            }
        };
    }
}
