import {Node} from '@/lib-components/nodes/Node.js';
import {Base} from '@/lib-components/nodes/Base.js';
import { nextTick } from 'vue'

export class Root extends Node {
    constructor(stage: any) {
        super(stage);
    }

    destroy() {
        while (this.children.value.length > 0)
            this.removeChild(this.children.value[this.children.value.length-1]);
        this.stage.destroy();
    }

    private readonly afterFlush = () => {
        nextTick(() => this.stage.reconcileConnections())
    }

    protected override getAfterFlushHook(): (() => void) {
        return this.afterFlush
    }
}

export class Comment extends Base {
    public readonly text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    protected subscribeEvents() : void {}

    public get state() { return {}; }
}

export class TextNode extends Base {
    public text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    protected subscribeEvents() : void {}

    public get state() { return {}; }

    setElementText(text: string) {
        this.text = text;
    }
}
