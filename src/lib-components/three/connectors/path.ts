import Element3d from "@/lib-components/three/element3d";

// class Connector {
//     sEl: Element3d
//     tEl: Element3d
//     isVertical: boolean
//     mid: number
//     s: number
//     t: number
// }

export class Segment {
    horizontal: boolean
    mid: number
    s: number
    t: number
    len: number
    sEl: Element3d
    tEl: Element3d
    constructor(horizontal: boolean, mid: number, s: number, t: number, sEl: Element3d, tEl: Element3d) {
        this.horizontal = horizontal;
        this.mid = mid
        this.s = s
        this.t = t
        this.len = Math.abs(t-s);
        this.sEl = sEl;
        this.tEl = tEl;
    }
}
