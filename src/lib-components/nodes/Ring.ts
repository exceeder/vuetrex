import { GroupNode } from '@/lib-components/nodes/GroupNode.js';
import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import {reactive} from 'vue';
import * as THREE from 'three';

export class Ring extends GroupNode {

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

        //ring center is local (0,0)
        const alpha = colIdx * 2.0 * Math.PI / cols;
        const xx = (D) * Math.sin(alpha) * scale;
        const zz = (D) * Math.cos(alpha) * scale;
        return new THREE.Vector3(xx, child.getElevation(), zz);
    }
}
