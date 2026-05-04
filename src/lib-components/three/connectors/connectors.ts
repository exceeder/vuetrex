import {VuetrexStage} from '../stage.js';
import {Segment, ConnectorPath, OrthogonalStrategy, StraightStrategy} from '@/lib-components/three/connectors/path.js';
import {Element3d} from '@/lib-components/three/element3d.js';
import {ConnectorRenderer, ConnectorStrategy} from '@/lib-components/three/connectors/types.js';
import {ParticleRenderer} from '@/lib-components/three/connectors/ParticleRenderer.js';
import {LineRenderer} from '@/lib-components/three/connectors/LineRenderer.js';

type ConnectionRecord = [string, string, string, string]
/**
 * The Connectors class is responsible for managing connections between elements in a 3D scene,
 * represented by segments and enhanced with various renderers.
 */
export class Connectors {

    stage: VuetrexStage;
    private connections: Array<ConnectionRecord> = [];
    private activeConnections = new Map<string, ConnectionRecord>()

    private segments: ConnectorPath = new ConnectorPath();
    private renderers: Map<string, ConnectorRenderer> = new Map();
    private strategies: Map<string, ConnectorStrategy> = new Map();

    constructor(stage: VuetrexStage) {
        this.stage = stage;
    }

    mount() {
        // Default renderers
        this.renderers.set('particles', new ParticleRenderer(this.stage));
        this.renderers.set('line', new LineRenderer(this.stage));

        // Default strategies
        this.strategies.set('orthogonal', new OrthogonalStrategy());
        this.strategies.set('straight', new StraightStrategy());

        this.stage.registerAnimation(this.animate());
    }

    register(el1: string, el2: string, layout: string = 'orthogonal', type: string = 'particles') {
        this.connections.push([el1, el2, layout, type]);
    }

    connect(el1: Element3d, el2: Element3d, layout: string = 'orthogonal', type: string = 'particles') {
       const strategy = this.strategies.get(layout) || this.strategies.get('orthogonal')!;
       this.segments.setStrategy(strategy);
       this.removePair(el1, el2);
       this.segments.connect(el1, el2, type);
    }

    reconcileConnections() {
        const next = new Map<string, ConnectionRecord>()

        for (const record of this.connections) {
          const [a, b, layout, type] = record
          const fromEl = this.stage.getById(a)
          const toEl = this.stage.getById(b)

          if (!fromEl || !toEl) continue

          const key = `${a}->${b}`
          next.set(key, record)

          this.connect(fromEl, toEl, layout, type)
        }

        for (const key of this.activeConnections.keys()) {
          if (!next.has(key)) {
            const [from] = key.split('->')
            const fromEl = this.stage.getById(from)
            if (fromEl) this.remove(fromEl)
          }
        }

        this.activeConnections = next
        this.segments.updateLen()
    }

    update(el: Element3d) {
        const removed = this.remove(el);
        const processed : string[] = [];

        for (let s of removed) {
            const id = s.sEl.mesh?.name + "~"+s.tEl.mesh?.name
            if (processed.indexOf(id) >=0 ) continue;
            processed.push(id);
            // find original connection record to get layout
            const record = this.connections.find(c => c[0] === s.sEl.mesh?.name?.substring(3) && c[1] === s.tEl.mesh?.name?.substring(3));
            const layout = record ? record[2] : 'orthogonal';
            const type = s.type || 'particles';
            this.connect(s.sEl, s.tEl, layout, type);
        }
    }

    removePair(el1: Element3d, el2: Element3d) {
        this.segments.removePair(el1, el2);
    }

    remove(el: Element3d): Segment[] {
      return this.segments.remove(el);
    }

    clear() {
        this.renderers.forEach(r => r.dispose());
        this.renderers.clear();
        this.segments.clear();
    }

    /**
     * Animates all connector renderers.
     */
    private animate(): (timer: number, tick: number) => void {
        return (timer, tick) => {
            if (this.segments.size() === 0) return;

            const segmentsByRenderer = new Map<string, Segment[]>();
            for (let i = 0; i < this.segments.size(); i++) {
                const s = this.segments.getSegment(i);
                const type = s.type || 'particles';
                if (!segmentsByRenderer.has(type)) {
                    segmentsByRenderer.set(type, []);
                }
                segmentsByRenderer.get(type)!.push(s);
            }

            this.renderers.forEach((renderer, name) => {
                const segments = segmentsByRenderer.get(name) || [];
                renderer.update(segments, timer, tick);
            });
        }
    }

}
