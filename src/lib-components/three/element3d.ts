import {Node} from "@/lib-components/nodes/Node";
import {VuetrexStage} from "./stage";

export default class Element3d {

    public node: Node;
    public mesh: THREE.Mesh | null = null;
    public pos: THREE.Vector3 | null = null;

    constructor(stage: VuetrexStage, node: Node) {
        this.node = node;
    }

    getCaption() {
        return this.node.text ? this.node.text : "";
    }
}