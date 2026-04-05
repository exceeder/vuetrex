import { MeshNode } from '@/lib-components/nodes/MeshNode.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';

export class Wedge extends MeshNode {

    readonly material: THREE.Material;

    constructor(stage: VuetrexStage) {
        super(stage, { height: 0.33 });
        this.material = stage.createElementMaterial();
    }

    private cylindricalSleeveSegment(height:number, size: number, segmentCount: number,
                                     { r = 0.75, R = 0.85 } = {}): THREE.BufferGeometry {
        const theta = Math.PI * 2 / segmentCount - Math.PI/12;
        const rr = size * r, RR = size * R;
        const shape = new THREE.Shape();
        shape.absarc(0, 0, RR, -theta/2, theta/2, false);
        shape.lineTo(rr * Math.cos(theta/2), rr * Math.sin(theta/2));
        shape.absarc(0, 0, rr, theta/2, -theta/2, true);
        shape.closePath();
        const geometry =  new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            depth: height,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });

        geometry.translate(0, 0, -height / 2);
        geometry.rotateX(Math.PI / 2);
        geometry.rotateY(-Math.PI / 2);
        // Center the arc at the mesh's local origin so that scale/position
        // animations (GSAP mesh.scale, mesh.position) pivot from the visual
        // centre of the wedge rather than from the ring's centre point.
        // The bounding-box midpoint of the arc (not the radius midpoint) is
        // (rr·cos(θ/2) + RR) / 2 — this accounts for the arc endpoints
        // pulling the near edge inward for large segment spans.
        geometry.translate(0, 0, -(rr * Math.cos(theta / 2) + RR) / 2);
        const scale = this.getScale()
        geometry.scale(scale, scale, scale);
        return geometry;
    }

    modelGen(): (height: number, size: number) => THREE.Mesh {
        const { myIdx: i, siblingCount: N } = this.layoutContext.value;
        return (height, size) => {
            const geometry = this.cylindricalSleeveSegment(height, size, N);
            const mesh = new THREE.Mesh(geometry, this.material);
            geometry.rotateY(i * (Math.PI * 2) / N);
            return mesh;
        };
    }
}
