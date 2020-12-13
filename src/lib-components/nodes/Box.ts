import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";

export class Box extends Node {

    size:number = 1.0;
    connection: string | null = null;

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        if (this.element) {
            this.stage.renderMesh(this.element, this.size, this.stage.meshCreator('rbox'));
            if (this.connection) {
                setTimeout(() => {  //todo fixme, there should be a better way
                    const otherEnd = this.stage.getById(this.connection || "");
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd)
                    } else {
                        console.warn("Invalid connection from "+this.name+" to "+this.connection)
                    }
                },10);
            }
            super.syncWithThree();
        }
    }

    setSize(size: number) {
        this.size = size;
    }

    onRemoved() {
        if (this.element) {
            if (this.subscribed) {
                this.element.mesh?.removeEventListener("click", this.clickListener)
            }
            this.stage.removeObject(this.element)
        }
    }
}
