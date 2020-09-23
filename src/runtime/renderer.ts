import { createRenderer, RootRenderFunction } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { VuetrexStage } from "./index";

export function createRendererForStage(stage: VuetrexStage): RootRenderFunction {
    const { render } = createRenderer({
        patchProp,
        ...nodeOps(stage),
    });

    return render;
}
