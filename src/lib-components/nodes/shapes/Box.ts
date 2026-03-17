import { MeshNode } from '@/lib-components/nodes/MeshNode.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';
import * as THREEx from '@/lib-components/three/three.imports.js';

export class Box extends MeshNode {

    readonly material: THREE.Material;

    constructor(stage: VuetrexStage) {
        super(stage);
        this.material = stage.createElementMaterial();
    }

    modelGen(): (height: number, size: number) => THREE.Mesh {
        return (height, size) => {
            const R = size * this.getScale()
            const bGeometry = new THREEx.RoundedBoxGeometry(R, height, R, 5, 0.05);
            const mesh = new THREE.Mesh(bGeometry, this.material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };
    }
}
