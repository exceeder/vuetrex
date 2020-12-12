import { Base } from "@/lib-components/nodes/Base";
import { Comment, TextNode } from "@/lib-components/nodes/Root";
import { RendererOptions } from "@vue/runtime-core";
import { VuetrexStage } from "@/lib-components/three/stage";
import {types} from "@/lib-components/nodes/types";

export const nodeOps = (stage: VuetrexStage): Omit<RendererOptions<Base, Base>, "patchProp"> => ({

  insert: (child, parent, anchor) => {
    if (anchor != null) {
      parent._insertBefore(child, anchor);
    } else {
      parent._appendChild(child);
    }
  },

  remove: (child) => {
    const parent = child.parent;
    if (parent != null) {
      parent._removeChild(child);
    }
  },

  createElement: (tag: keyof typeof types, isSVG, isCustomizedBuiltIn) => {
     let type = types[tag];
     if (!type) {
       console.warn(`Unknown native tag: ${tag}`);
       type = types["node"];
     }
     return new type(stage);
  },

  createText: (text) => {
    return new TextNode(text);
  },

  createComment: (text) => {
    return new Comment(text);
  },

  setText: (node, text) => {
    // Noop
  },

  setElementText: (node, text) => {
    node.setElementText(text);
  },

  parentNode: (node) => (node.parent ? node.parent : null),

  nextSibling: (node) => node.nextSibling,

});
