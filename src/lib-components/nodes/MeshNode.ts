import { reactive, watchEffect, WatchStopHandle, nextTick } from 'vue';
import { Node } from '@/lib-components/nodes/Node.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import * as THREE from 'three';

export interface MeshState {
    text: string;
    size: number;
    height: number;
    connection: string | null;
}

/**
 * Base class for all geometry nodes (Box, Cylinder, etc.).
 * Handles reactive sync with Three.js, connection wiring, and cleanup.
 * Subclasses only need to implement modelGen().
 */
export abstract class MeshNode extends Node {

    public state: MeshState;
    protected stopHandle?: WatchStopHandle;
    protected readonly flushMode: 'post' | 'sync' = 'post';

    constructor(stage: VuetrexStage, stateDefaults: Partial<MeshState> = {}) {
        super(stage);
        this.state = reactive({ text: '', size: 1.0, height: 0.5, connection: null, ...stateDefaults });
    }

    abstract modelGen(): (height: number, size: number) => THREE.Object3D;

    setSize(size: number) { this.state.size = size; }
    setHeight(height: number) { this.state.height = height; }

    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            if (this.myIdx.value >= 0) {
                this.stage.renderMesh(this.element, this.state.height, this.state.size, this.modelGen());
            }
            if (this.state.connection) {
                nextTick(() => {
                    if (!this.state.connection) return;
                    const otherEnd = this.stage.getById(this.state.connection);
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd);
                    }
                }).catch(r => console.log(r));
            }
        }, { flush: this.flushMode });
    }

    onRemoved() {
        if (this.stopHandle) {
            this.stopHandle();
            this.stopHandle = undefined;
        }
        if (this.subscribed) {
            this.element.mesh?.removeEventListener(Node.CLICK, this.clickListener);
            this.element.mesh?.removeEventListener(Node.DBLCLICK, this.dblclickListener);
            this.element.mesh?.removeEventListener(Node.MOUSE_OVER, this.mouseOverListener);
            this.element.mesh?.removeEventListener(Node.MOUSE_OUT, this.mouseOutListener);
        }
        this.stage.removeObject(this.element);
        this.state.connection = null;
    }
}
