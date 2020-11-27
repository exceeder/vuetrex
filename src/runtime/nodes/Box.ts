import {Node} from './Node';
import Element3d from "@/three/element3d";
import Stage from "@/three/stage";

export class Box extends Node {

    size:number = 1.0;

    constructor(stage: any, base?: Element3d) {
        super(stage);
    }

    syncWithThree() {
        if (this.element) {
            this.stage.renderMesh(this.element, this.size, this.stage.meshCreator('box'));
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
