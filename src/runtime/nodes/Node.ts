import { Base } from "./Base";
import Element3d from "@/runtime/nodes/element3d";

export class Node extends Base {
    public readonly stage: any; //todo fixme

    constructor(stage: any, base?: Element3d) {
        super(base);
        this.stage = stage;
    }

    getParentNode(): Node | undefined {
        let current = this.parent;
        while (current && !(current as any).el) {
            current = current.parent;
        }
        return current as Node;
    }
}