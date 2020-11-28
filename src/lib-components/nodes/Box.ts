import {Node} from '@/lib-components/nodes/Node';
import VuetrexStage from "@/lib-components/three/stage";

export class Box extends Node {

    size:number = 1.0;

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        if (this.element) {
            this.stage.renderMesh(this.element, this.size, this.stage.meshCreator('rbox'));
            if (this.nodeEvents.onClick) {
                this.element.mesh?.addEventListener('click', ev => {
                    this.dispatchClick(ev.originalEvent);
                })
            }
        }
    }

    setSize(size: number) {
        this.size = size;
    }

    onRemoved() {
        if (this.element) {
            this.stage.removeObject(this.element)
        }
    }
}
