import {reactive, watchEffect, WatchStopHandle} from 'vue';
import {Node} from '@/lib-components/nodes/Node.js';
import {VuetrexStage} from '@/lib-components/three/stage.js';
import * as THREE from 'three';

/**
 * Layer class
 */
export class Layer extends Node {

    public readonly type: string = 'Layer'

    protected material: THREE.MeshStandardMaterial | null;

    isLayer(): boolean { return true; }
    public state : {text: string, scale: number, size:number, elevation: number, visible: boolean} = reactive({
        text: '',
        scale: 1.0,
        size: 1.0,
        elevation: 0.0,
        visible: false
    })

    stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage) {
        super(stage)
        this.material = null
    }

    modelGen(): (height:number, size:number) => THREE.Mesh {
        return (height, size) => {
            if (this.material == null) {
                const bMaterial = this.stage.createElementMaterial();
                bMaterial.transparent = true;
                bMaterial.opacity = 0.75;
                bMaterial.flatShading = true;
                bMaterial.side = THREE.DoubleSide;
                bMaterial.color.setRGB(255,255,255)
                this.material = bMaterial;
            }
            const geometry = new THREE.PlaneGeometry(size, size, 2, 2);
            geometry.rotateX(Math.PI/2)
            geometry.translate(0, this.state.elevation, 0);
            const result = new THREE.Mesh(geometry, this.material);
            return result;
        }
    }

    syncWithThree() {
        if (this.stopHandle) return
        this.stopHandle = watchEffect(() => {
            if (this.getLayer()) {
                this.element.pos = this.element.getPosition();
                this.state.scale = (this.getLayer() as Layer)?.state.scale * 0.66;
            }
            if (this.state.visible) {
                this.stage.renderMesh(this.element, 1.0, this.state.size*this.state.scale, this.modelGen());
            }
        })
    }

    onRemoved() {
        if (this.stopHandle) this.stopHandle();
        this.children.value.forEach(c => c.onRemoved());
    }
}
