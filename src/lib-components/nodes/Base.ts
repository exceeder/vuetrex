import { queuePostFlushCb } from "vue";

// defer synchronization until after rendering for all nodes to have complete data about parents and children
let pendingSyncBase: Base | null = null;

const flushChanges = () => {
    if (pendingSyncBase) {
        pendingSyncBase.syncWithThree();
    }
    pendingSyncBase = null;
};

const registerUpdatedBase = (base: Base) => {
    if (pendingSyncBase && pendingSyncBase !== base) {
        pendingSyncBase.syncWithThree();
    }

    if (!pendingSyncBase) {
        queuePostFlushCb(() => flushChanges());
    }

    pendingSyncBase = base;
};

/**
 * Base for render elements of Vuetrex renderer. Handles tree hierarchy: children, siblings, etc.
 */
export class Base {

    protected children: Base[] = [];

    public parent?: Base = undefined;

    public firstChild: Base | null = null;
    public lastChild: Base | null = null;
    public prevSibling: Base | null = null;
    public nextSibling: Base | null = null;

    private mustSync = false;

    _appendChild(child: Base) {
        //console.log("append",child);

        child.unlinkSiblings();

        child.parent = this;
        this.children.push(child);

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
        this.children.splice(this.children.indexOf(child),1);
        this.registerSync();
        child.onRemoved()
    }

    _insertBefore(child: Base, anchor: Base) {
        //console.log("insert",child);

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

        this.children.push(child);

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

    onRemoved() {}

    getIdx() { return 0; }
    renderSize() { return 0; }
}

