import { MeshNode } from '@/lib-components/nodes/MeshNode.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';

export class Cylinder extends MeshNode {

    readonly material: THREE.Material;

    constructor(stage: VuetrexStage) {
        super(stage, { height: 0.33 });
        this.material = this.stage.createElementMaterial()
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

    modelGen(): (height: number, size: number) => THREE.Mesh {
        return (_height, size) => {
            const geometry = this.beveledCylinder(size);
            geometry.rotateX(Math.PI / 2);
            geometry.translate(0, 0.19, 0);
            return new THREE.Mesh(geometry, this.material);
        };
    }
}
