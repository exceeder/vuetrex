import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";
import {reactive} from "vue";

export class Row extends Node {

    public state : {text: string} = reactive({
        text: ''
    })

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    registerSync() {
        super.registerSync();
    }

    syncWithThree() {
        this.children.value.forEach(b => b.syncWithThree())
        super.syncWithThree();
    }

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
