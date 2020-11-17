import {Node} from './Node';
import Element3d from "@/three/element3d";
import Stage from "@/three/stage";

export class Cylinder extends Node {
    constructor(stage: any, base?: Element3d) {
        super(stage);
    }

    syncWithThree() {
        // @ts-ignore
        const rows = this.parent.parent.children.size;
        // @ts-ignore
        const cols = this.parent.children.size;
        // @ts-ignore
        const rowIdx = this.parent.getIdx()
        console.log("cyl syncd [",this.name,"] ",
            `rows:${rows}`,
            `cols:${cols}`,
            `row idx:${rowIdx}`,
            `box idx:${this.getIdx()}`);

        const s = this.stage as Stage;
        s.ensureLayout(rowIdx,cols);
        s.renderCylinder(
            this.getIdx(), rowIdx, cols, rows,
            this.name,
            1.0
        );
    }
}
