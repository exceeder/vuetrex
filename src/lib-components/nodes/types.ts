import {VuetrexStage} from "@/lib-components/three/stage";
import {Base} from "@/lib-components/nodes/Base";
import {Box} from "@/lib-components/nodes/Box";
import {Layer} from "@/lib-components/nodes/Layer";
import {Row} from "@/lib-components/nodes/Row";
import {Stack} from "@/lib-components/nodes/Stack";
import {Cylinder} from "@/lib-components/nodes/Cylinder";

interface FunctionalComponent {
    setup(stage: VuetrexStage): Base
}

type ClassComponent = new (stage: VuetrexStage) => Base

/**
 * NodeOps createElement uses this dictionary of elements to create custom DOM elements that are mapped to 3D scene
 */
const types: Record<string, ClassComponent | FunctionalComponent> = {
    layer: Layer,
    row: Row,
    box: Box,
    cylinder: Cylinder,
    stack: Stack
}

export {types}
export type {FunctionalComponent, ClassComponent}