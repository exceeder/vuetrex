import {Node} from './Node';
import Element3d from "@/three/element3d";
import Stage from "@/three/stage";

export class Cylinder extends Node {
    constructor(stage: any, base?: Element3d) {
        super(stage);
    }

    syncWithThree() {
        setTimeout(()=> {
            // @ts-ignore
            const rows = this.parent.parent.renderSize();
            // @ts-ignore
            const cols = this.parent.renderSize();
            // @ts-ignore
            const rowIdx = this.parent.getIdx()
            console.log("cyl syncd [",this.name,"] ",
                `rows:${rows}`,
                `cols:${cols}`,
                `rowIdx:${rowIdx}`,
                `cylIdx:${this.getIdx()}`);

            const s = this.stage as Stage;
            s.ensureLayout(rowIdx, cols, rows);
            s.renderCylinder(
                this.getIdx(), rowIdx, cols, rows,
                this.name,
                1.0
            );
        },1);
    }
}
