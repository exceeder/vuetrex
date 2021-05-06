import {VuetrexStage} from "@/lib-components/three/stage";
import {Base} from "@/lib-components/nodes/Base";
import {Box} from "@/lib-components/nodes/Box";
import {Layer} from "@/lib-components/nodes/Layer";
import {Row} from "@/lib-components/nodes/Row";
import {Cylinder} from "@/lib-components/nodes/Cylinder";

export const types: Record<string, new (stage: VuetrexStage) => Base> = {
    layer: Layer,
    row: Row,
    box: Box,
    cylinder: Cylinder
} as const;