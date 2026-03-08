import Element3d from '@/lib-components/three/element3d.js';

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

export class ConnectorPath {
    private segments: Segment[] = [];
    private totalLength: number = 0;

    constructor() {
    }

    connect(el1: Element3d, el2: Element3d) {
        //todo figure out snapping constant reference, assumes grid with 1.4 units distance between cells
        const snap = (a:number) => Math.round(a/1.4)*1.4;

        const sx = snap(el1.mesh?.position.x || 0)
        const sy = snap(el1.mesh?.position.z || 0)
        const tx = snap(el2.mesh?.position.x || 0)
        const ty = snap(el2.mesh?.position.z || 0)

        if( Math.abs(sy-ty) < 0.01 ) {
            //single horizontal line
            this.segments.push(new Segment(true, sy, sx, tx, el1, el2))
        } else if( Math.abs(sx-tx) < 0.01 ) {
            //single vertical line
            this.segments.push(new Segment(false, sx, sy, ty, el1, el2))
        } else if (Math.abs(tx-sx) / 2 > Math.abs(ty-sy)) {
            //zig-zag
            let midy = snap(( sy + ty ) / 2 );

            this.segments.push(new Segment(false, sx, sy, midy, el1, el2))
            this.segments.push(new Segment(true, midy, sx, tx, el1, el2))
            this.segments.push(new Segment(false, tx, midy, ty, el1, el2))
        } else {
            let midx = snap(( sx + tx ) / 2);
            if (midx % 1 === 0.5) midx += 1.0; //offset to avoid hitting things
            this.segments.push(new Segment(true, sy, sx, midx, el1, el2))
            this.segments.push(new Segment(false, midx, sy, ty, el1, el2))
            this.segments.push(new Segment(true, ty, midx, tx, el1, el2))
        }

       this.updateLen();
    }

    clear() {
        this.segments.splice(0, this.segments.length);
    }

    size() {
        return this.segments.length;
    }

    totaLength() {
        return this.totalLength;
    }

    updateLen() {
        let totalLen = 0;
        for (const seg of this.segments) {
            totalLen += seg.len;
        }
        this.totalLength = totalLen;
    }

    remove(el: Element3d) : Segment[] {
        const removed = this.segments.filter(s => s.sEl === el || s.tEl === el);
        this.segments = this.segments.filter(s => s.sEl !== el && s.tEl !== el);
        this.updateLen();
        return removed;
    }

    getSegment(idx: number) : Segment {
        return this.segments[idx];
    }

    /**
     * Sample a position and direction by distance along the polyline.
     * Distance wraps around [0,totalLen).
     */
    sample(distance: number): { x: number; y: number, s: Segment | null } {
        if (this.segments.length === 0) {
            return { x: 0, y: 0, s: null };
        }
        const totalLen = this.totalLength;

        // Wrap into [0, totalLen)
        let d = ((distance % totalLen) + totalLen) % totalLen;

        for (const seg of this.segments) {
            if (d <= seg.len) {
                const t = seg.len === 0 ? 0 : d / seg.len;
                const currentPos = seg.s + (seg.t - seg.s) * t;

                if (seg.horizontal) {
                    return { x: currentPos, y: seg.mid, s: seg };
                } else {
                    return { x: seg.mid, y: currentPos, s: seg };
                }
            }
            d -= seg.len;
        }

        const last = this.segments[this.segments.length - 1];
        return last.horizontal ? { x: last.t, y: last.mid, s: last  } : { x: last.mid, y: last.t, s: last };
    }

}
