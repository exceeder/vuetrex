import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import {reactive} from 'vue';
import * as THREE from 'three';

export class Ring extends Node {

    public readonly type: string = 'Ring';

    public state: { text: string, size: number } = reactive({
        text: '',
        size: 1.0
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }


    layoutPositionOf(child: Node): THREE.Vector3 {
        const D = this.stage.boxDistance * this.state.size;
        const scale = child.getScale()*this.getScale();
        const colIdx = child.myIdx.value;
        const cols = child.numColumns.value  || 1;
        const rows = child.numRows.value || 1;
        const rowIdx = child.parent.value?.myIdx.value ?? 0;

        const layerPos = child.getLayer()?.element.pos ?? new THREE.Vector3();
        const offX = layerPos.x;
        const offZ = layerPos.z;

        //ring center
        const posX = offX;
        const posY = offZ;
        const alpha = colIdx * 2.0 * Math.PI / cols;
        const xx = (D) * Math.sin(alpha) * scale;
        const zz = (D) * Math.cos(alpha) * scale;
        return new THREE.Vector3(posX + xx, child.getElevation(), posY + zz);
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
