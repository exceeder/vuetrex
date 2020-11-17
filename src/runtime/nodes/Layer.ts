import {Node} from './Node';
import Element3d from "@/three/element3d";

export class Layer extends Node {

    children3d?: Element3d[];

    constructor(stage: any, base?: Element3d) {
        super(stage);
        console.log("Layer constructor")
    }

    syncWithThree() {
        super.syncWithThree();
        //this.children3d = this.getChildren();
        console.log("layer syncd", this.children)
    }

    private getChildren() {
        const items: Element3d[] = [];
        let c = this.firstChild;
        while (c) {
            if (c.element) {
                items.push(c.element);
            }
            c = c.nextSibling;
        }
        return items;
    }
}
