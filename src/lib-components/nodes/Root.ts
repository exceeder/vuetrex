import {Node} from '@/lib-components/nodes/Node';
import {Base} from '@/lib-components/nodes/Base';

export class Root extends Node {
    constructor(stage: any) {
        super(stage);
    }

    syncWithThree() {
        super.syncWithThree();
        //update non-containers
        this.children.value.forEach(b => b.syncWithThree())
    }
}

export class Comment extends Base {
    public readonly text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }
}

export class TextNode extends Base {
    public text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    setElementText(text: string) {
        this.text = text;
    }
}