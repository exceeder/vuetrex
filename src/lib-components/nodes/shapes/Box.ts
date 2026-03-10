import { MeshNode } from '@/lib-components/nodes/MeshNode.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';
import * as THREEx from '@/lib-components/three/three.imports.js';

export class Box extends MeshNode {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    modelGen(): (height: number, size: number) => THREE.Mesh {
        return (height, size) => {
            const bMaterial = this.stage.createElementMaterial();
            const bGeometry = new THREEx.RoundedBoxGeometry(size, height, size, 5, 0.05);
            const mesh = new THREE.Mesh(bGeometry, bMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };
    }
}
