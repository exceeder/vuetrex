import {VuetrexStage} from "@/lib-components/three/stage";
import {Base} from "@/lib-components/nodes/Base";
import {Box} from "@/lib-components/nodes/Box";
import {Node} from "@/lib-components/nodes/Node";
import {Layer} from "@/lib-components/nodes/Layer";
import {Row} from "@/lib-components/nodes/Row";
import {Cylinder} from "@/lib-components/nodes/Cylinder";

export const types: Record<string, new (stage: VuetrexStage) => Base> = {
    box: Box,
    row: Row,
    layer: Layer,
    node: Node,
    cylinder: Cylinder
} as const;