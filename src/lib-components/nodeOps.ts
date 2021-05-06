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
    const parent = child.parent.value;
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
    //sometimes text === 'v-if' and we should have a placeholder for VirtualDOM even when condition is false
    return new Comment(text);
  },

  setText: (node, text) => {
    // NOOP
  },

  setElementText: (node, text) => {
    node.setElementText(text);
  },

  parentNode: (node) => (node.parent.value ? node.parent.value : null),

  nextSibling: (node) => (node.nextSibling.value)

});
