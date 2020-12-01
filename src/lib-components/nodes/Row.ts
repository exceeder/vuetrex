import {Node} from '@/lib-components/nodes/Node';
import VuetrexStage from "@/lib-components/three/stage";

export class Row extends Node {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
        setTimeout(()=> {
            //console.log("row syncd", this.children)
            this.children.forEach(b => b.syncWithThree())
        },1)
    }

    onRemoved() {
        this.children.forEach(c => c.onRemoved());
    }
}
