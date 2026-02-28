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

    onRemoved() {
        this.children.value.forEach(c => c.onRemoved());
    }
}
