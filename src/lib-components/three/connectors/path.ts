import {Element3d} from '@/lib-components/three/element3d.js';
import {ConnectorStrategy} from '@/lib-components/three/connectors/types.js';
import {Vector3} from 'three';

export class Segment {
    horizontal: boolean
    mid: number
    s: number
    t: number
    len: number
    sEl: Element3d
    tEl: Element3d
    type: string
    constructor(horizontal: boolean, mid: number, s: number, t: number, sEl: Element3d, tEl: Element3d, type: string = 'particles') {
        this.horizontal = horizontal;
        this.mid = mid
        this.s = s
        this.t = t
        this.len = Math.abs(t-s);
        this.sEl = sEl;
        this.tEl = tEl;
        this.type = type;
    }
}

export class OrthogonalStrategy implements ConnectorStrategy {
    calculatePath(el1: Element3d, el2: Element3d, type: string = 'particles'): Segment[] {
        const segments: Segment[] = [];
        const distance = el1.node.stage.boxDistance;
        const snap = (a:number) => Math.round(a/distance)*distance;

        const p1 = el1.getWorldPosition();
        const p2 = el2.getWorldPosition();

        const sx = snap(p1.x)
        const sy = snap(p1.z)
        const tx = snap(p2.x)
        const ty = snap(p2.z)

        if( Math.abs(sy-ty) < 0.01 ) {
            //single horizontal line
            segments.push(new Segment(true, sy, sx, tx, el1, el2, type))
        } else if( Math.abs(sx-tx) < 0.01 ) {
            //single vertical line
            segments.push(new Segment(false, sx, sy, ty, el1, el2, type))
        } else if (Math.abs(ty-sy) / 2 > Math.abs(tx-sx)) {
            //zig-zag vertical (along Z)
            let midx = snap(( sx + tx ) / 2 );
            if (midx % 1 === 0.5) midx += 1.0; //offset to avoid hitting things
            segments.push(new Segment(true, sy, sx, midx, el1, el2, type))
            segments.push(new Segment(false, midx, sy, ty, el1, el2, type))
            segments.push(new Segment(true, ty, midx, tx, el1, el2, type))
        } else {
            //zig-zag horizontal (along X)
            let midy = snap(( sy + ty ) / 2)+0.25; //offset down to allow space for caption text
            if (midy % 1 === 0.5) midy += 1.0; //offset to avoid hitting things
            segments.push(new Segment(false, sx, sy, midy, el1, el2, type))
            segments.push(new Segment(true, midy, sx, tx, el1, el2, type))
            segments.push(new Segment(false, tx, midy, ty, el1, el2, type))
        }
        return segments;
    }

    getPoints(el1: Element3d, el2: Element3d): Vector3[] {
        const p1 = el1.getWorldPosition();
        const p2 = el2.getWorldPosition();
        const segments = this.calculatePath(el1, el2);
        if (segments.length === 0) return [p1, p2];

        const points: Vector3[] = [p1];
        for (const seg of segments) {
            if (seg.horizontal) {
                points.push(new Vector3(seg.t, p1.y, seg.mid));
            } else {
                points.push(new Vector3(seg.mid, p1.y, seg.t));
            }
        }
        return points;
    }
}

export class StraightStrategy implements ConnectorStrategy {
    calculatePath(el1: Element3d, el2: Element3d, type: string = 'particles'): Segment[] {
        const p1 = el1.getWorldPosition();
        const p2 = el2.getWorldPosition();
        const sx = p1.x;
        const sy = p1.z;
        const tx = p2.x;
        const ty = p2.z;

        // For a straight line in 2D (XZ plane), we can use a single segment.
        // If it's not strictly horizontal or vertical, we'll mark it horizontal
        // but it will be slightly "wrong" for the current Segment/sample logic.
        // Actually, Segment is designed for orthogonal lines (horizontal/vertical).
        // For general straight lines, we might need to enhance Segment or use a different sampling.
        // Keeping it orthogonal-first for now as per current Segment design.
        // TODO: improve Segment for non-orthogonal
        return [new Segment(true, sy, sx, tx, el1, el2, type)];
    }

    getPoints(el1: Element3d, el2: Element3d): Vector3[] {
        return [el1.getWorldPosition(), el2.getWorldPosition()];
    }
}

export class BezierStrategy implements ConnectorStrategy {
    calculatePath(el1: Element3d, el2: Element3d, type: string = 'particles'): Segment[] {
        // Fallback to straight line for now, but placeholder for Catmull-Rom or similar
        const p1 = el1.getWorldPosition();
        const p2 = el2.getWorldPosition();
        const sx = p1.x;
        const sy = p1.z;
        const tx = p2.x;
        const ty = p2.z;
        return [new Segment(true, sy, sx, tx, el1, el2, type)];
    }

    getPoints(el1: Element3d, el2: Element3d): Vector3[] {
        return [el1.getWorldPosition(), el2.getWorldPosition()];
    }
}

export class ConnectorPath {
    private segments: Segment[] = [];
    private totalLength: number = 0;
    private strategy: ConnectorStrategy = new OrthogonalStrategy();

    constructor() {
    }

    setStrategy(strategy: ConnectorStrategy) {
        this.strategy = strategy;
    }

    connect(el1: Element3d, el2: Element3d, type: string = 'particles') {
        const newSegments = this.strategy.calculatePath(el1, el2, type);
        this.segments.push(...newSegments);
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

    removePair(el1: Element3d, el2: Element3d) : Segment[] {
        const removed = this.segments.filter(s =>
            (s.sEl === el1 && s.tEl === el2) || (s.sEl === el2 && s.tEl === el1)
        );
        this.segments = this.segments.filter(s =>
            !((s.sEl === el1 && s.tEl === el2) || (s.sEl === el2 && s.tEl === el1))
        );
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
                    // Horizontal segment: vary X, fixed Z (mid)
                    return { x: currentPos, y: seg.mid, s: seg };
                } else {
                    // Vertical segment: vary Z, fixed X (mid)
                    return { x: seg.mid, y: currentPos, s: seg };
                }
            }
            d -= seg.len;
        }

        const last = this.segments[this.segments.length - 1];
        return last.horizontal ? { x: last.t, y: last.mid, s: last  } : { x: last.mid, y: last.t, s: last };
    }

}
