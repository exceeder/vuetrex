import {Node} from './Node';
import Element3d from "@/three/element3d";
import Stage from "@/three/stage";

export class Cylinder extends Node {
    constructor(stage: any, base?: Element3d) {
        super(stage);
    }

    syncWithThree() {
        if (this.element) {
            this.stage.renderMesh(this.element, 1.0, this.stage.meshCreator('cylinder'));

            if (this.nodeEvents.onClick) {
                this.element.mesh?.addEventListener('click', ev => {
                    this.dispatchClick(ev.originalEvent);
                })
            }
        }
    }

}
