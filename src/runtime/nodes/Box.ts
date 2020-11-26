import {Node} from './Node';
import Element3d from "@/three/element3d";
import Stage from "@/three/stage";

export class Box extends Node {

    size:number = 1.0;

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
            console.log("box syncd [",this.name,"] ",
                `rows:${rows}`,
                `cols:${cols}`,
                `rowIdx:${rowIdx}`,
                `boxIdx:${this.getIdx()}`);

            const s = this.stage as Stage;
            s.ensureLayout(rowIdx, cols, rows);
            s.renderBox(
                this.getIdx(), rowIdx, cols, rows,
                this.name,
                this.size
            );
        }, 1);
    }

    setSize(size: number) {
        this.size = size;
    }
}
