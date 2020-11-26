import { createRenderer, RootRenderFunction } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { VuetrexStage } from "./index";

/**
 * Effectively Vue's custom Renderer needs to implement
 * <pre><code>
 * interface RendererOptions<HostNode = RendererNode, HostElement = RendererElement> {
 *     patchProp(el: HostElement, key: string, prevValue: any, nextValue: any, isSVG?: boolean, prevChildren?: VNode<HostNode, HostElement>[], parentComponent?: ComponentInternalInstance | null, parentSuspense?: SuspenseBoundary | null, unmountChildren?: UnmountChildrenFn): void;
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
 * @param stage
 */

export function createRendererForStage(stage: VuetrexStage): RootRenderFunction {
    const { render } = createRenderer({
        patchProp,
        ...nodeOps(stage),
    });

    return render;
}
