import {VuetrexStage} from "@/runtime";
import {Base} from "./Base";
import {Box} from "./Box";
import {Node} from "./Node";
import {Layer} from "./Layer";
import {Row} from "./Row";
import {Cylinder} from "./Cylinder";

export const types: Record<string, new (stage: VuetrexStage) => Base> = {
    box: Box,
    row: Row,
    layer: Layer,
    node: Node,
    cylinder: Cylinder
} as const;