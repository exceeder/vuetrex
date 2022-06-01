import {reactive, watchEffect, WatchStopHandle} from 'vue';
import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";

/**
 * Layer class
 */
export class Layer extends Node {

    public readonly type: string = 'Layer'
    public state : {text: string, scale: number, elevation: number, visible: boolean} = reactive({
        text: '',
        scale: 1,
        elevation: 0.0,
        visible: false
    })

    stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage) {
        super(stage)
    }

    registerSync() {
        super.registerSync();
        //this.state.children = this.numChildren();
    }

    syncWithThree() {
        if (this.stopHandle) return
        this.stopHandle = watchEffect(() => {
                if (this.getLayer()) {
                    this.element.pos = this.element.getPosition();
                    this.state.scale = (this.getLayer() as Layer)?.state.scale + 1;
                }
                if (this.state.visible) {
                    this.stage.renderMesh(this.element, 1.0, 10.0, this.stage.meshCreator('plane'));
                }
        })
        super.syncWithThree();
    }

    onRemoved() {
        if (this.stopHandle) this.stopHandle();
        this.children.value.forEach(c => c.onRemoved());
    }
}
