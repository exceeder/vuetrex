import {Node} from './Node';
import Element3d from "@/three/element3d";
import {Base} from "@/runtime/nodes/Base";

export class Row extends Node {

    constructor(stage: any, base?: Element3d) {
        super(stage);
        console.log("Row constructor")
    }

    syncWithThree() {
        super.syncWithThree();
        console.log("row syncd",this.children)
        this.children.forEach(b => b.syncWithThree())
    }

    private getChildren() {
        const items: Base[] = [];
        let c = this.firstChild;
        while (c) {
            //if (c.element) {
                items.push(c);
            //}
            c = c.nextSibling;
        }
        return items;
    }
}
