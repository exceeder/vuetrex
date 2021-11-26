import {reactive, watchEffect, WatchStopHandle, nextTick} from 'vue';
import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";

export class Box extends Node {

    public state: { text: string, size: number, height:number, connection: string | null } = reactive({
        text: '',
        size: 1.0,
        height: 0.5,
        connection: null
    })

    private stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage) {
        super(stage);
    }

    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            if (this.myIdx.value >= 0) {
                this.stage.renderMesh(this.element, this.state.size, this.stage.meshCreator('rbox'));
            }

            if (this.state.connection) {
                nextTick(() => {  //todo fixme, there should be a better way!
                    if (!this.state.connection) return;
                    const otherEnd = this.stage.getById(this.state.connection);
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd)
                    } //else {
                    //    console.warn("Invalid connection from " + this.name + " to " + this.state.connection)
                    //}
                }).catch(r => console.log(r));
            }
        }, {flush: 'post'})
        super.syncWithThree();
    }

    setSize(size: number) {
        this.state.size = size;
    }

    setHeight(height: number) {
        this.state.height = height;
    }

    onRemoved() {
        if (this.element) {
            if (this.stopHandle) {
                this.stopHandle();
                this.stopHandle = undefined;
            }
            if (this.subscribed) {
                this.element.mesh?.removeEventListener("click", this.clickListener)
            }
            this.stage.removeObject(this.element)
        }
        this.state.connection = null;
    }
}
