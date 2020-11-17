import { Base } from "./Base";
import Element3d from "@/three/element3d";

/**
 * Named node in the tree hierarchy of Vuetrex renderer.
 */
export class Node extends Base {
    public readonly stage: any; //todo fixme
    public name: string = '';

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

    setName(name: string) {
        this.name = name;
    }
}