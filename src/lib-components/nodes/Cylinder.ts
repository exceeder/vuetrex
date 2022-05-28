import {Node} from '@/lib-components/nodes/Node';
import Element3d from "@/lib-components/three/element3d";
import {VuetrexStage} from "@/lib-components/three/stage";
import {nextTick, reactive, watchEffect, WatchStopHandle} from "vue";

export class Cylinder extends Node {

    public state : {text: string, height:number, size: number, connection: string | null} = reactive({
        text: '',
        size: 1.0,
        height: 0.33,
        connection : null
    })

    stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage, base?: Element3d) {
        super(stage);
    }

    setHeight(height: number) {
        this.state.height = height;
    }

    setSize(size: number) {
        this.state.size = size;
    }


    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            //console.log(` >cyl weffect ${this.name} myIdx: ${this.myIdx.value} cols:${this.numColumns.value} rows:${this.numRows.value}`)
            if (this.myIdx.value >= 0) {
                this.stage.renderMesh(this.element, this.state.height, this.state.size, this.stage.meshCreator('cylinder-shape'));
            }

            if (this.state.connection) {
                nextTick(() => {  //todo fixme, there should be a better way!
                    const otherEnd = this.stage.getById(this.state.connection || "");
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd)
                    } else {
                        console.warn("Invalid connection from " + this.name + " to " + this.state.connection)
                    }
                }).catch(r => console.log(r));
            }
        },{flush: 'sync'})
        super.syncWithThree();
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
