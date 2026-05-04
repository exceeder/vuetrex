import { Element3d } from '@/lib-components/three/element3d.js';
import { Segment } from '@/lib-components/three/connectors/path.js';
import * as THREE from 'three';

export interface ConnectorStrategy {
    calculatePath(el1: Element3d, el2: Element3d, type?: string): Segment[];
    getPoints(el1: Element3d, el2: Element3d): THREE.Vector3[];
}

export interface ConnectorRenderer {
    update(segments: Segment[], timer: number, tick: number): void;
    dispose(): void;
}
