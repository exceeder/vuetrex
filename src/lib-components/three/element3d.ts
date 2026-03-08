import * as THREE from 'three';
import { VuetrexStage } from './stage.js';
import { Node } from '@/lib-components/nodes/Node.js';

export default class Element3d {

    private readonly stage: VuetrexStage;
    public node: Node;
    public mesh: THREE.Object3D | null = null;
    public pos: THREE.Vector3 | null = null;

    constructor(stage: VuetrexStage, node: Node) {
        this.stage = stage;
        this.node = node;
    }

    getCaption(): string {
        return this.node.state.text;
    }

    getStage(): VuetrexStage {
        return this.stage;
    }

    getPosition(): THREE.Vector3 {
        const parent = this.node.parent.value as Node | null;
        if (!parent) return new THREE.Vector3();
        return parent.layoutPositionOf(this.node);
    }
}
