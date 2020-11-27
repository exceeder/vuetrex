import {Node} from './Node';
import {VuetrexStage} from "@/runtime";

export class Row extends Node {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
        setTimeout(()=> {
            console.log("row syncd", this.children)
            this.children.forEach(b => b.syncWithThree())
        },1)
    }

    onRemoved() {
        this.children.forEach(c => c.onRemoved());
    }
}
