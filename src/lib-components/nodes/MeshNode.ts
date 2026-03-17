import { reactive, watchEffect, WatchStopHandle, nextTick, computed, ComputedRef } from 'vue';
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
 * Aggregates all layout-affecting reactive values from the node hierarchy.
 * Declaring these as a single computed ensures watchEffect tracks every
 * dependency — including parent sibling count — without relying on where
 * reactive reads happen to execute inside modelGen() closures.
 *
 * Subclasses that depend on additional hierarchy values (e.g. Stack needing
 * cumulative sibling heights) should override layoutContext and spread super:
 *   protected layoutContext = computed(() => ({ ...super.layoutContext.value, precedingHeight: ... }))
 */
export interface LayoutContext {
    myIdx: number;
    siblingCount: number;
}

/**
 * Base class for all geometry nodes (Box, Cylinder, etc.).
 * Handles reactive sync with Three.js, connection wiring, and cleanup.
 * Subclasses only need to implement modelGen().
 */
export abstract class MeshNode extends Node {

    protected state: MeshState;
    protected stopHandle?: WatchStopHandle;
    protected readonly flushMode: 'post' | 'sync' = 'post'; // see Vue's WatchEffectOptions, Callback Flush Timing

    protected layoutContext: ComputedRef<LayoutContext> = computed(() => ({
        myIdx: this.myIdx.value,
        siblingCount: this.numColumns.value,
    }));

    constructor(stage: VuetrexStage, stateDefaults: Partial<MeshState> = {}) {
        super(stage);
        this.state = reactive({ text: '', size: 1.0, height: 0.5, connection: null, ...stateDefaults });
    }

    abstract modelGen(): (height: number, size: number) => THREE.Mesh;

    setSize(size: number) { this.state.size = size; }
    setHeight(height: number) { this.state.height = height; }

    /**
     * Removes the current mesh from the scene and resets the event subscription flag
     * so that the next renderMesh call starts clean and events can be re-wired to
     * the new mesh object. Called both on geometry rebuild and on node removal.
     */
    private clearMesh() {
        if (!this.element.mesh) return;
        if (this.subscribed) {
            this.element.mesh.removeEventListener(Node.CLICK, this.clickListener);
            this.element.mesh.removeEventListener(Node.DBLCLICK, this.dblclickListener);
            this.element.mesh.removeEventListener(Node.MOUSE_OVER, this.mouseOverListener);
            this.element.mesh.removeEventListener(Node.MOUSE_OUT, this.mouseOutListener);
            this.subscribed = false;
        }
        this.stage.removeObject(this.element);
    }

    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            const { myIdx } = this.layoutContext.value;
            if (myIdx >= 0) {
                this.clearMesh();
                this.stage.renderMesh(this.element, this.state.height, this.state.size, this.modelGen());
                this.subscribeEvents();
            }
            if (this.state.connection) {
                nextTick(() => {
                    if (!this.state.connection) return;
                    const otherEnd = this.stage.getById(this.state.connection);
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd);
                    }
                }).catch(r => console.warn(r));
            }
        }, { flush: this.flushMode });
    }

    onRemoved() {
        if (this.stopHandle) {
            this.stopHandle();
            this.stopHandle = undefined;
        }
        this.clearMesh();
        this.state.connection = null;
    }
}
