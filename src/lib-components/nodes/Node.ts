import { Base } from "@/lib-components/nodes/Base";
import Element3d from "@/lib-components/three/element3d";
import {VuetrexStage} from "@/lib-components/three/stage";
import {nextTick, reactive} from "vue";

declare type VxEventListener<T extends Event> = (event: T) => void;

type NodeEvents = {
    onClick?: VxEventListener<Event>;
}

/**
 * Named node in the tree hierarchy of Vuetrex renderer.
 */
export class Node extends Base {
    public element: Element3d;

    public readonly stage: VuetrexStage
    public name: string = Math.floor(Math.random()*100000).toString(32)
    subscribed: boolean = false
    public readonly type: string = 'Node'

    public state = reactive({
        text: ''
    })

    readonly clickListener = (ev: any) => {
        this.dispatchClick(ev.originalEvent);
    }

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

    getLayer(): Node | null {
        let result = this.parent.value as Node;
        while (result !== null && result.type !== 'Layer') {
            result = result.parent.value as Node;
        }
        return result;
    }

    getScale(): number {
        if (this.getLayer() === undefined) return 1.0;
        return (this.getLayer()?.state as any)?.scale || 1.0;
    }

    getElevation() {
        let result = (this as any).state?.elevation || 0.0;
        let parent = this.getLayer();
        while (parent) {
            result += (parent as any)?.state?.elevation || 0.0;
            parent = parent.getLayer();
        }
        return result;
    }

    setName(name: string) {
        console.log("name ",name)
        this.name = name;
    }

    set onClick(e: VxEventListener<Event> | undefined) {
        this.nodeEvents.onClick = e;
    }

    dispatchClick(e: MouseEvent) {
        //console.log("dispatching ", (e as any).vxNode, this)
        if (this.nodeEvents.onClick)
            this.nodeEvents.onClick(e)

        //bubble up
        let pn : Node = this.parent.value as Node;
        if (pn) pn.dispatchClick(e);
    }

    syncWithThree() {
        nextTick(() => {
            if (!this.subscribed) {
                this.element.mesh?.addEventListener('click', this.clickListener)
                this.subscribed = true
            }
        }).catch(() => {});
        super.syncWithThree();
    }
}

/**
 * Do not proxify Nodes when using template refs.
 * See https://github.com/vuejs/vue-next/pull/1060
 */
(Node.prototype as any)["__v_skip"] = true;