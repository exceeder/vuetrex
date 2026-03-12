import { MeshNode } from '@/lib-components/nodes/MeshNode.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';
import {Node} from '@/lib-components/nodes/Node.js';

export class Wedge extends MeshNode {

    readonly material: THREE.Material;

    constructor(stage: VuetrexStage) {
        super(stage, { height: 0.33 });
        this.material = stage.createElementMaterial();
    }

    private cylindricalSleeveSegment(height:number, size: number, segmentCount: number,
                                     { r = 0.55, R = 0.95 } = {}): THREE.BufferGeometry {
        const theta = Math.PI * 2 / segmentCount;
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

        geometry.translate(0,0,-height/2)
        geometry.rotateX(Math.PI / 2);
        geometry.rotateY(-Math.PI / 2);
        return geometry;
    }

    modelGen(): (height: number, size: number) => THREE.Object3D {
        return (height, size) => {
            const N = (this.parent.value as Node).renderSize.value; //number of visible siblings
            const i = this.myIdx.value

            //using N=siblings+1 so that segments have visual gaps
            const geometry = this.cylindricalSleeveSegment(height, size, N);


            const mesh = new THREE.Mesh(geometry, this.material);
            //this rotates wedge to the right segment index position, but it should be handled by the ring layout (todo)
            const alpha = i * (Math.PI*2) / N;
            geometry.rotateY(alpha );
            geometry.translate(-size * Math.sin(alpha), 0, -size * Math.cos(alpha))

            return mesh;
        };
    }
}
