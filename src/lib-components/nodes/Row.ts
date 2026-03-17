import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import { reactive } from 'vue';
import * as THREE from 'three';

export class Row extends Node {

    public readonly type: string = 'Row';

    public state: { text: string } = reactive({
        text: ''
    });

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
