import {Node} from "@/runtime/nodes/Node";
import {VuetrexStage} from "@/runtime";

export default class Element3d {

    public node: Node;
    public mesh: THREE.Mesh | null = null;

    constructor(stage: VuetrexStage, node: Node) {
        this.node = node;
        stage.register(this);
    }
}