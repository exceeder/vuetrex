import {Node} from '@/lib-components/nodes/Node';
import VuetrexStage from "@/lib-components/three/stage";

export class Layer extends Node {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
    }
}
