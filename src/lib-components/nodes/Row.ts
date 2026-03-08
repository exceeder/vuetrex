import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import { reactive } from 'vue';
import * as THREE from 'three';

export class Row extends Node {

    public readonly type: string = 'Row';

    public state: { text: string, layout: string } = reactive({
        text: '',
        layout: ''
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    layoutPositionOf(child: Node): THREE.Vector3 {
        if (this.state.layout !== 'circular') {
            return super.layoutPositionOf(child);
        }

        const R = this.stage.boxRadius;
        const D = this.stage.boxDistance;
        const scale = child.getScale();
        const colIdx = child.myIdx.value;
        const cols = child.numColumns.value || 1;
        const rows = child.numRows.value || 1;
        const rowIdx = child.parent.value?.myIdx.value ?? 0;

        const layerPos = child.getLayer()?.element.pos ?? new THREE.Vector3();
        const offX = layerPos.x;
        const offZ = layerPos.z;

        const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX;
        const rowPosZ = (-(R + D)) / 2 / scale + (R + D) / 2 / scale + offZ;
        const xx = (R + D) * Math.cos(colIdx * 2 * Math.PI / cols) / scale;
        const zz = (R + D) * Math.sin(colIdx * 2 * Math.PI / cols) / scale;
        return new THREE.Vector3(rowPosX + xx, child.getElevation(), rowPosZ + zz);
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
