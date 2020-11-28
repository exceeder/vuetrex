import {Node} from "@/lib-components/nodes/Node";
import VuetrexStage from "./stage";

export default class Element3d {

    public node: Node;
    public mesh: THREE.Mesh | null = null;

    constructor(stage: VuetrexStage, node: Node) {
        this.node = node;
        stage.register(this);
    }
}