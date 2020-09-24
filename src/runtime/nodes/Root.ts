import {Node} from './Node';
import {Base} from './Base';

export class Root extends Node {}

export class Comment extends Base {
    public readonly text: string;

    constructor(text: string) {
        super(undefined);
        this.text = text;
    }
}

export class TextNode extends Base {
    public readonly text: string;

    constructor(text: string) {
        super(undefined);
        this.text = text;
    }
}