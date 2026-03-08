import {reactive, watchEffect, WatchStopHandle} from 'vue';
import {Node} from '@/lib-components/nodes/Node.js';
import {VuetrexStage} from '@/lib-components/three/stage.js';
import * as THREE from 'three';

/**
 * Layer class
 */
export class Layer extends Node {

    public readonly type: string = 'Layer'

    isLayer(): boolean { return true; }
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

    modelGen(): (height:number, size:number) => THREE.Mesh {
        return (_, size) => {
            let bMaterial = this.stage.createElementMaterial();
            bMaterial.transparent = true;
            bMaterial.opacity = 0.75;
            bMaterial.flatShading = true;
            bMaterial.side = THREE.DoubleSide;
            bMaterial.color.setRGB(255,255,255)
            const result = new THREE.Mesh(
                new THREE.PlaneGeometry(size, size, 2, 2),
                bMaterial
            );
            result.rotateX(Math.PI/2)
            return result;
        }
    }

    syncWithThree() {
        if (this.stopHandle) return
        this.stopHandle = watchEffect(() => {
            if (this.getLayer()) {
                this.element.pos = this.element.getPosition();
                this.state.scale = (this.getLayer() as Layer)?.state.scale + 1;
            }
            if (this.state.visible) {
                this.stage.renderMesh(this.element, 1.0, 10.0, this.modelGen());
            }
        })
    }

    onRemoved() {
        if (this.stopHandle) this.stopHandle();
        this.children.value.forEach(c => c.onRemoved());
    }
}
