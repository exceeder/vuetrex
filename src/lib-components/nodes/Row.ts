import { GroupNode } from '@/lib-components/nodes/GroupNode.js';
import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import { reactive } from 'vue';
import * as THREE from 'three';

export class Row extends GroupNode {

    public readonly type: string = 'Row';

    public state: { text: string } = reactive({
        text: ''
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    layoutPositionOf(child: Node): THREE.Vector3 {
        const R = this.stage.boxRadius;
        const D = this.stage.boxDistance;
        const scale = child.getScale();

        let colIdx = child.myIdx.value;
        let rowIdx = child.parent.value?.myIdx.value;
        let cols = child.numColumns.value || 1;
        let rows = child.numRows.value || 1;

        if (rowIdx === undefined || rowIdx < 0) {
            rowIdx = 0; colIdx = 0; cols = 1; rows = 1;
        }

        const rowPosX = (-cols * (R + D)) / 2 / scale + (R + D) / 2 / scale;
        const rowPosZ = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale;
        return new THREE.Vector3(
            rowPosX + (R + D) * colIdx / scale,
            child.getElevation(),
            rowPosZ + (R + D) * rowIdx / scale
        );
    }
}
