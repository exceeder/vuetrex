import { Node } from '@/lib-components/nodes/Node';
import { VuetrexStage } from '@/lib-components/three/stage';
import { reactive } from 'vue';
import * as THREE from 'three';

export class Stack extends Node {

    public readonly type: string = 'Stack';

    public state: { text: string, layout: string } = reactive({
        text: '',
        layout: ''
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    layoutPositionOf(child: Node): THREE.Vector3 {
        const R = this.stage.boxRadius;
        const D = this.stage.boxDistance;
        const scale = child.getScale();

        const colIdx = child.myIdx.value;
        const height = this.elements.value
            .slice(0, colIdx)
            .map(el => (el as any).state?.height || 0)
            .reduce((a: number, b: number) => a + b, 0);

        const rowIdx = this.parent.value?.myIdx.value ?? 0;
        const rows = this.numRows.value || 1;
        const cols = this.numColumns.value || 1;
        const stackIdx = this.myIdx.value;

        const layerPos = child.getLayer()?.element.pos ?? new THREE.Vector3();
        const offX = layerPos.x;
        const offZ = layerPos.z;

        const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX + (R + D) * rowIdx / scale;
        const rowPosZ = (-cols * (R + D)) / 2 / scale + (R + D) / 2 / scale + offZ + (R + D) * stackIdx / scale;
        return new THREE.Vector3(rowPosX, child.getElevation() + height - 0.25, rowPosZ);
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}