import Element3d from "./element3d"
import { queuePostFlushCb } from "vue";

export class Base {
    public element?: Element3d = undefined;

    protected children = new Set<Base>();

    public parent?: Base = undefined;

    public firstChild: Base | null = null;
    public lastChild: Base | null = null;
    public prevSibling: Base | null = null;
    public nextSibling: Base | null = null;

    private mustSync = false;

    constructor(element: Element3d | undefined) {
        this.element = element;
    }

    _appendChild(child: Base) {
        child.unlinkSiblings();

        child.parent = this;
        this.children.add(child);

        if (!this.firstChild) {
            this.firstChild = child;
        }
        child.prevSibling = this.lastChild;
        child.nextSibling = null;
        if (this.lastChild) {
            this.lastChild.nextSibling = child;
        }
        this.lastChild = child;

        this.registerSync();
    }

    private unlinkSiblings() {
        if (this.parent?.firstChild === this) {
            this.parent!.firstChild = this.nextSibling;
        }

        if (this.parent?.lastChild === this) {
            this.parent!.lastChild = this.prevSibling;
        }

        if (this.prevSibling) {
            this.prevSibling.nextSibling = this.nextSibling;
        }

        if (this.nextSibling) {
            this.nextSibling.prevSibling = this.prevSibling;
        }

        this.prevSibling = null;
        this.nextSibling = null;
    }

    _removeChild(child: Base) {
        child.unlinkSiblings();

        child.parent = undefined;

        this.children.delete(child);

        this.registerSync();
    }

    _insertBefore(child: Base, anchor: Base) {
        child.unlinkSiblings();

        child.parent = this;

        if (anchor.prevSibling) {
            child.prevSibling = anchor.prevSibling;
            anchor.prevSibling.nextSibling = child;
        }

        anchor.prevSibling = child;
        child.nextSibling = anchor;

        if (this.firstChild === anchor) {
            this.firstChild = child;
        }

        this.children.add(child);

        this.registerSync();
    }

    private registerSync() {
        if (!this.mustSync) {
            this.mustSync = true;
            registerUpdatedBase(this);
        }
    }

    syncWithThree() {
        // Ignore.
        this.mustSync = false;
    }

    setElementText(text: string) {
        // Default: ignore text.
    }
}

let pendingSyncBase: Base | undefined = undefined;

const registerUpdatedBase = (base: Base) => {
    if (pendingSyncBase && pendingSyncBase !== base) {
        pendingSyncBase.syncWithThree();
    }

    if (!pendingSyncBase) {
        queuePostFlushCb(() => {
            flushChanges();
        });
    }

    pendingSyncBase = base;
};

const flushChanges = () => {
    if (pendingSyncBase) {
        pendingSyncBase.syncWithThree();
    }
    pendingSyncBase = undefined;
};