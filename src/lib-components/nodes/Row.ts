import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";

export class Row extends Node {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
        this.children.forEach(b => b.syncWithThree())
    }

    onRemoved() {
        this.children.forEach(c => c.onRemoved());
    }
}
