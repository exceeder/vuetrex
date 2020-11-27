import {Node} from './Node';
import {Base} from './Base';

export class Root extends Node {
    constructor(stage: any) {
        super(stage);
        console.log("Root constructor")
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