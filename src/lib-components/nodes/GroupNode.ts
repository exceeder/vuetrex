import { Node } from '@/lib-components/nodes/Node.js'
import { VuetrexStage } from '@/lib-components/three/stage.js'
import { Vector3, Group } from 'three'

export class GroupNode extends Node {
    readonly group = new Group()
    readonly isGroupNode = true

    constructor(stage: VuetrexStage) {
        super(stage)
        this.element.mesh = this.group as any   // satisfies `Element3d.mesh` type, TODO rethink the strategy here
    }

    syncWithThree() {
        // Position the group in its parent object (scene or ancestor group)
        this.group.position.copy(this.element.getPosition())
        const parentObj = this.nearestAncestorObject()
        if (!this.group.parent) parentObj.add(this.group)
        else this.group.position.copy(this.element.getPosition())
        if (this.stage?.connectors) {
            this.stage.connectors.update(this.element)
        }
    }

    // Override in subclasses or accept a layout fn prop
    layoutPositionOf(child: Node): Vector3 {
        return new Vector3(0,0,0)
    }

    onRemoved() {
        this.group.removeFromParent()
        this.children.value.forEach(c => c.onRemoved())
    }

    subscribeEvents() {}  // groups have no mesh events
}
