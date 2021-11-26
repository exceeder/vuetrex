import { createRenderer, RootRenderFunction } from "vue";
import { nodeOps } from "@/lib-components/nodeOps";
import { patchProp } from "@/lib-components/patchProp";
import {VuetrexStage} from "@/lib-components/three/stage";

/**
 * Vuetrex Stage requires implementation of Vue's Custom Renderer to hijack painting of boxes and cylinders and other
 * 3D elements.
 * To do that it needs to implement needs to implement the following via a factory function below:
 * <pre><code>
 * interface RendererOptions<HostNode = RendererNode, HostElement = RendererElement> {
 *     patchProp(el: HostElement, key: string, prevValue: any, nextValue: any, isSVG?: boolean,
 *               prevChildren?: VNode<HostNode, HostElement>[],
 *               parentComponent?: ComponentInternalInstance | null,
 *               parentSuspense?: SuspenseBoundary | null, unmountChildren?: UnmountChildrenFn): void;
 *     forcePatchProp?(el: HostElement, key: string): boolean;
 *     insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void;
 *     remove(el: HostNode): void;
 *     createElement(type: string, isSVG?: boolean, isCustomizedBuiltIn?: string): HostElement;
 *     createText(text: string): HostNode;
 *     createComment(text: string): HostNode;
 *     setText(node: HostNode, text: string): void;
 *     setElementText(node: HostElement, text: string): void;
 *     parentNode(node: HostNode): HostElement | null;
 *     nextSibling(node: HostNode): HostNode | null;
 *     querySelector?(selector: string): HostElement | null;
 *     setScopeId?(el: HostElement, id: string): void;
 *     cloneNode?(node: HostNode): HostNode;
 *     insertStaticContent?(content: string, parent: HostElement, anchor: HostNode | null, isSVG: boolean): HostElement[];
 * }
 * </code></pre>
 *
 * @param stage Vuetrex Stage
 */

export function createRendererForStage(stage: VuetrexStage): RootRenderFunction {
    const { render } = createRenderer({
        patchProp,
        ...nodeOps(stage),
    });

    return render;
}
