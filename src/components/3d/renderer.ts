import {ComponentInternalInstance, RendererOptions, SuspenseBoundary, VNode} from '@vue/runtime-core';

export interface TNode {
    text: string
}

export default class TRenderer implements RendererOptions {

    constructor() {
    }

    patchProp(el: Element, key: string, prevValue: any, nextValue: any, isSVG?: boolean, prevChildren?: VNode[],
              parentComponent?: ComponentInternalInstance | null,
              parentSuspense?: SuspenseBoundary | null,
              unmountChildren?: any): void {

    }

    forcePatchProp?(el: Element, key: string): boolean {
        return false;
    }
    insert(el: VNode, parent: Element, anchor?: VNode | null): void {
        
    }
    remove(el: VNode): void {
        
    }
    createElement(type: string, isSVG?: boolean, isCustomizedBuiltIn?: string): Element {
        console.log("create "+type)
        return window.document.createElement(type);
    }
    createText(text: string): TNode {
        console.log("create t"+text)
        return {text};
    }
    createComment(text: string): TNode {
        return {text}
    }
    setText(node: TNode, text: string): void {
        
    }
    setElementText(node: Element, text: string): void {
        
    }
    parentNode(node: TNode): Element | null {
        return new Element();
    }
    nextSibling(node: TNode): TNode | null {
        return null;
    }
    querySelector?(selector: string): Element | null {
        return null;
    }
    setScopeId?(el: Element, id: string): void {
        
    }
    cloneNode?(node: TNode): TNode {
        return Object.assign({}, node);
    }
    insertStaticContent?(content: string, parent: Element, anchor: TNode | null, isSVG: boolean): Element[] {
        return [new Element()];
    }
}
