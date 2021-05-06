import {ref, computed, queuePostFlushCb, ComputedRef, Ref, shallowRef} from "vue";

// defer synchronization until after rendering for all nodes to have complete data about parents and children
const pendingSyncBase: Base[] = [];
let pending = false;

const flushChanges = () => {
    pendingSyncBase.forEach(b => b.syncWithThree())
    pendingSyncBase.length = 0
    pending = false
};

const registerUpdatedBase = (base: Base) => {
    pendingSyncBase.push(base)
    if (!pending) {
        queuePostFlushCb(() => flushChanges())
        pending = true
    }
};

/**
 * Base class of render elements of Vuetrex renderer. Handles tree hierarchy: children, siblings, etc.
 */
export class Base {

    public parent: Ref<Base | null> = shallowRef(null);
    protected children: Ref<Base[]> = ref([]);

    private mustSync = false;

    readonly elements = computed(() => {
        return this.children.value.filter(c => ((c as any).state !== undefined))
    })
    public myIdx: ComputedRef<number> = computed(() => {
        //if (this.parent.value == null) return -2;
        const res = this.parent.value?.elements.value.indexOf(this);
        return res === undefined ? -1 : res;
    })

    public renderSize: ComputedRef<number> = computed(() => {
        const res = this.elements.value.length;
        return res || 0
    })

    public numColumns: ComputedRef<number> = computed(() => {
        const res = this.parent.value?.renderSize.value || 1
        return res || 0
    });

    public numRows: ComputedRef<number> = computed(() => (this.parent.value?.parent.value?.renderSize.value || 1));

    public readonly nextSibling : ComputedRef<Base | null> = computed(() => {
            if (this.parent.value === null) {
                return null;
            }
            const arr = this.parent.value.children.value;
            const idx = arr.indexOf(this) || -1;
            let result = null
            if (idx >= 0 && idx < arr.length-1) {
                result = arr[idx + 1]
            }
            return result
    })

    _appendChild(child: Base) {
        child.parent.value = this;
        this.children.value.push(child);
        this.registerSync();
    }

    _removeChild(child: Base) {
        child.parent.value = null;
        this.children.value.splice(this.children.value.indexOf(child),1);
        this.registerSync();
        child.onRemoved()
    }

    _insertBefore(child: Base, anchor: Base) {
        child.parent.value = this;
        const anchorIdx = this.children.value.indexOf(anchor);
        if (anchorIdx >= 0) {
            this.children.value.splice(anchorIdx, 0, child);
        } else {
            this.children.value.push(child);
        }
        this.registerSync();
    }

    registerSync() {
        if (!this.mustSync) {
            this.mustSync = true;
            registerUpdatedBase(this);
        }
    }

    syncWithThree() {
        this.mustSync = false;
    }

    setElementText(text: string) {
        // Default: ignore text.
    }

    onRemoved() {}
}

