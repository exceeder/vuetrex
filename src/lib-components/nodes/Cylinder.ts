import {Node} from '@/lib-components/nodes/Node';
import Element3d from "@/lib-components/three/element3d";
import {VuetrexStage} from "@/lib-components/three/stage";

export class Cylinder extends Node {

    connection: string | null = null;

    constructor(stage: VuetrexStage, base?: Element3d) {
        super(stage);
    }

    syncWithThree() {
        if (this.element) {
            this.stage.renderMesh(this.element, 1.0, this.stage.meshCreator('cylinder-shape'));

            if (this.connection) {
                this.stage.connect(this.element, this.stage.getById(this.connection))
            }
            super.syncWithThree();
        }
    }

}
