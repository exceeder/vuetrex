import {VuetrexStage} from "@/lib-components/three/stage";
import {Base} from "@/lib-components/nodes/Base";
import {Box} from "@/lib-components/nodes/Box";
import {Layer} from "@/lib-components/nodes/Layer";
import {Row} from "@/lib-components/nodes/Row";
import {Stack} from "@/lib-components/nodes/Stack";
import {Cylinder} from "@/lib-components/nodes/Cylinder";

export interface FunctionalComponent {
    setup(stage: VuetrexStage): Base
}

export type ClassComponent = new (stage: VuetrexStage) => Base

export type ElementRegistry = Record<string, ClassComponent | FunctionalComponent>

/**
 * Built-in element types shipped with Vuetrex.
 * Use registerElement() to add custom types globally or pass an `elements`
 * prop to <vuetrex> for per-instance registration.
 */
const builtins: ElementRegistry = {
    layer: Layer,
    row: Row,
    box: Box,
    cylinder: Cylinder,
    stack: Stack
}

/**
 * Register a custom element type globally. Must be called before the
 * <vuetrex> component mounts. For per-instance registration use the
 * `elements` prop instead.
 */
export function registerElement(tag: string, impl: ClassComponent | FunctionalComponent): void {
    builtins[tag] = impl
}

export { builtins as types }
