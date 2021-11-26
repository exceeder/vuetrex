import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";
import {reactive} from "vue";

export class Stack extends Node {

    public readonly type: string = 'Stack'

    public state : {text: string, layout: string} = reactive({
        text: '',
        layout: ''
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
