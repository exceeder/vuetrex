import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import {reactive} from 'vue';
import * as THREE from 'three';

export class Ring extends Node {

    public readonly type: string = 'Ring';

    public state: { text: string } = reactive({
        text: '',
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }


    layoutPositionOf(child: Node): THREE.Vector3 {
        const R = this.stage.boxRadius / 8;
        const D = this.stage.boxDistance;
        const scale = child.getScale();
        const colIdx = child.myIdx.value;
        const cols = child.numColumns.value  || 1;
        const rows = child.numRows.value || 1;
        const rowIdx = child.parent.value?.myIdx.value ?? 0;

        const layerPos = child.getLayer()?.element.pos ?? new THREE.Vector3();
        const offX = layerPos.x;
        const offZ = layerPos.z;

        //ring center
        const posX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX;
        const posY = (-(R + D)) / 2 / scale + (R + D) / 2 / scale + offZ;
        //todo this circular offset doesn't work with wedge

        const alpha = colIdx * 2.0 * Math.PI / cols;
        const xx = (R + D) * Math.sin(alpha) / scale;
        const zz = (R + D) * Math.cos(alpha) / scale;
        //let xx=0, zz=0;
        return new THREE.Vector3(posX + xx, child.getElevation(), posY + zz);
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
