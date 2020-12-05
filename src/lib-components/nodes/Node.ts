import { Base } from "@/lib-components/nodes/Base";
import Element3d from "@/lib-components/three/element3d";
import VuetrexStage from "@/lib-components/three/stage";

declare type VxEventListener<T extends Event> = (event: T) => any;

type NodeEvents = {
    onClick?: VxEventListener<Event>;
}

/**
 * Named node in the tree hierarchy of Vuetrex renderer.
 */
export class Node extends Base {
    public element?: Element3d;

    public readonly stage: VuetrexStage;
    public name: string = '';
    public text: string = '';

    public _nodeEvents?: NodeEvents = undefined;

    constructor(stage: VuetrexStage) {
        super();
        this.element = new Element3d(stage, this);
        this.stage = stage;
    }

    public get nodeEvents(): NodeEvents {
        if (!this._nodeEvents) {
            this._nodeEvents = {};
        }
        return this._nodeEvents;
    }

    getLayer(): Node | undefined {
        return this.parent?.parent as Node;
    }

    getRow(): Node | undefined {
        return this.parent as Node;
    }

    getScale(): number {
        if (this.getLayer() === undefined) return 1.0;
        return (this.getLayer() as any).scale || 1.0;
    }

    getIdx() {
        if (!this.parent) return 0;
        let idx = 0, i: Base | null = this.prevSibling;
        while (i !== null) {
            if (i instanceof Node) idx++;
            i = i.prevSibling;
        }
        return idx;
    }

    renderSize() {
        return this.children.filter(el => el instanceof Node).length;
    }

    setName(name: string) {
        this.name = name;
    }

    set onClick(e: VxEventListener<Event> | undefined) {
        this.nodeEvents.onClick = e;
    }

    dispatchClick(e: MouseEvent) {
        if (this.nodeEvents.onClick)
            this.nodeEvents.onClick(e)
    }
}

/**
 * Do not proxify Nodes when using template refs.
 * See https://github.com/vuejs/vue-next/pull/1060
 */
(Node.prototype as any)["__v_skip"] = true;