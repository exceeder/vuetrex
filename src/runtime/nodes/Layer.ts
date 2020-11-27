import {Node} from './Node';
import {VuetrexStage} from "@/runtime";

export class Layer extends Node {

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
    }
}
