import {reactive, watchEffect, WatchStopHandle, nextTick} from 'vue';
import {Node} from '@/lib-components/nodes/Node';
import {VuetrexStage} from "@/lib-components/three/stage";
import * as THREE from "three";
import * as THREEx from "@/lib-components/three/three.imports";

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

    modelGen(): (height:number, size:number) => THREE.Mesh {
        return (height, size) => {
            const bMaterial = this.stage.createElementMaterial();
            const bGeometry = new THREEx.RoundedBoxGeometry(size, height, size,  5, .05);
            const mesh = new THREE.Mesh(bGeometry, bMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }
    }

    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            if (this.myIdx.value >= 0) {
                this.stage.renderMesh(this.element, this.state.height, this.state.size, this.modelGen());
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
                // @ts-ignore //TODO THREE.EventDispatcher allows to dispatch custom events, but TS limits it
                this.element.mesh?.removeEventListener(Node.CLICK, this.clickListener)
            }
            this.stage.removeObject(this.element)
        }
        this.state.connection = null;
    }
}
