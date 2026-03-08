import { Base } from '@/lib-components/nodes/Base.js';
import Element3d from '@/lib-components/three/element3d.js';
import { VuetrexStage } from '@/lib-components/three/stage.js';
import { nextTick, reactive } from 'vue';
import * as THREE from 'three';

declare type VxEventListener<T extends Event> = (event: T) => void;

type NodeEvents = {
    onClick?: VxEventListener<Event>;
}

/**
 * Named node in the ThreeJS tree hierarchy of Vuetrex renderer.
 */
export abstract class Node extends Base {
    public element: Element3d;

    public readonly stage: VuetrexStage;
    public name: string = Math.floor(Math.random() * 100000).toString(32);
    protected subscribed: boolean = false;
    public readonly type: string = 'Node';

    public static readonly CLICK: string = 'click';

    public state = reactive({
        text: ''
    });

    readonly clickListener = (ev: any) => {
        this.dispatchClick(ev.originalEvent);
    };

    public _nodeEvents?: NodeEvents = undefined;

    constructor(stage: VuetrexStage) {
        super();
        this.element = new Element3d(stage, this);
        this.stage = stage;
    }

    isRenderableNode(): boolean { return true; }

    isLayer(): boolean { return false; }

    public get nodeEvents(): NodeEvents {
        if (!this._nodeEvents) {
            this._nodeEvents = {};
        }
        return this._nodeEvents;
    }

    getLayer(): Node | null {
        let result = this.parent.value as Node;
        while (result !== null && !result.isLayer()) {
            result = result.parent.value as Node;
        }
        return result;
    }

    getScale(): number {
        const layer = this.getLayer();
        if (layer === null) return 1.0;
        return (layer.state as any)?.scale || 1.0;
    }

    getElevation(): number {
        let result = (this as any).state?.elevation || 0.0;
        let parent = this.getLayer();
        while (parent) {
            result += (parent as any)?.state?.elevation || 0.0;
            parent = parent.getLayer();
        }
        return result;
    }

    /**
     * Returns the 3D position of `child` within this container's layout.
     * Default implementation: grid layout (rows × columns).
     * Container nodes (Row, Stack) override this to apply their own layout strategy.
     */
    layoutPositionOf(child: Node): THREE.Vector3 {
        const R = this.stage.boxRadius;
        const D = this.stage.boxDistance;
        const scale = child.getScale();

        let colIdx = child.myIdx.value;
        let rowIdx = child.parent.value?.myIdx.value;
        let cols = child.numColumns.value || 1;
        let rows = child.numRows.value || 1;

        if (rowIdx === undefined || rowIdx < 0) {
            rowIdx = 0; colIdx = 0; cols = 1; rows = 1;
        }

        const layerPos = child.getLayer()?.element.pos ?? new THREE.Vector3();
        const offX = layerPos.x;
        const offZ = layerPos.z;

        const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX;
        const rowPosZ = (-cols * (R + D)) / 2 / scale + (R + D) / 2 / scale + offZ;
        return new THREE.Vector3(
            rowPosX + (R + D) * rowIdx / scale,
            child.getElevation(),
            rowPosZ + (R + D) * colIdx / scale
        );
    }

    setName(name: string) {
        this.name = name;
    }

    set onClick(e: VxEventListener<Event> | undefined) {
        this.nodeEvents.onClick = e;
    }

    dispatchClick(e: MouseEvent) {
        if (this.nodeEvents.onClick)
            this.nodeEvents.onClick(e);

        // bubble up
        const pn = this.parent.value as Node;
        if (pn) pn.dispatchClick(e);
    }

    subscribeEvents() {
        nextTick(() => {
            if (!this.subscribed) {
                // @ts-ignore — THREE.EventDispatcher supports custom events but TS typing doesn't reflect it
                this.element.mesh?.addEventListener(Node.CLICK, this.clickListener);
                this.subscribed = true;
            }
        }).catch(() => {});
    }
}

/**
 * Do not proxify Nodes when using template refs.
 * See https://github.com/vuejs/vue-next/pull/1060
 */
(Node.prototype as any)["__v_skip"] = true;
