import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";

/**
 * Layer class
 */
export class Layer extends Node {

    public scale = 1

    constructor(stage: VuetrexStage) {
        super(stage)
    }

    syncWithThree() {
        super.syncWithThree();
        if (this.getLayer()) {
            this.element!.pos = this.stage.positionLayoutElement(this.element!);
            this.scale = (this.getLayer() as Layer)?.scale + 1;
        }
        //update non-containers
        this.children.filter(c => c.firstChild == null).forEach(b => b.syncWithThree())
    }
}
