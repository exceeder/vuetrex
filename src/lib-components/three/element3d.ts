import * as THREE from "three";
import {VuetrexStage} from "./stage";
import {Node} from "@/lib-components/nodes/Node";

const R = 1.3; //box radius
const D = 1.5; //box distance

export default class Element3d {

    private stage: VuetrexStage;
    public node: Node;
    public mesh: THREE.Mesh | null = null;
    public pos: THREE.Vector3 | null = null;

    constructor(stage: VuetrexStage, node: Node) {
        this.stage = stage;
        this.node = node;
    }

    getCaption() {
        return this.node!.state.text;
    }

    getStage() {
        return this.stage;
    }

    getPosition() : THREE.Vector3 {
        const node = this.node;
        let scale = node.getScale();

        let colIdx = node.myIdx.value;
        let rowIdx = node.parent.value?.myIdx.value;
        let cols = node.numColumns.value || 1;
        let rows = node.numRows.value || 1;
        if (rowIdx === undefined || rowIdx < 0) {
            rowIdx = 0;
            colIdx = 0;
            cols = 1;
            rows = 1;
        }

        const layerPos = node.getLayer()?.element.pos || new THREE.Vector3(0, 0, 0);
        const offX = layerPos?.x || 0.0;
        const offZ = layerPos?.z || 0.0;

        if ((node.parent.value as Node).type === 'Stack') {
            let p = node.parent.value;
            if (p === null) return new THREE.Vector3(0);
            rowIdx = p.parent.value?.myIdx.value || 0;
            rows = p.numRows.value || 1;
            cols = p.numColumns.value || 1;
            let stackIdx = p.myIdx.value;
            const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX + (R + D) * rowIdx / scale;
            const rowPosZ = (-cols * (R + D)) / 2 / scale + (R + D) / 2 / scale + offZ + (R + D) * stackIdx / scale;
            return new THREE.Vector3(rowPosX, colIdx*0.7 + node.getElevation(), rowPosZ);
        } else if ((node.parent.value as any).state?.layout === 'circular') {

            const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX + (R + D) * rowIdx / scale;
            const rowPosZ = (-(R + D)) / 2 / scale + (R + D) / 2 / scale + offZ;
            const xx = (R + D) * Math.cos(colIdx * 2 * Math.PI / cols) / scale
            const zz = (R + D) * Math.sin(colIdx * 2 * Math.PI / cols) / scale
            return new THREE.Vector3(
                rowPosX + xx,
                node.getElevation(),
                rowPosZ + zz);
        } else {
            const rowPosX = (-rows * (R + D)) / 2 / scale + (R + D) / 2 / scale + offX;
            const rowPosZ = (-cols * (R + D)) / 2 / scale + (R + D) / 2 / scale + offZ;
            //in WebGL, positive X to the right, Y to the top, Z to the back
            return new THREE.Vector3(
                rowPosX + (R + D) * rowIdx / scale,
                node.getElevation(),
                rowPosZ + (R + D) * colIdx / scale);
        }

    }
}