import { Base } from "./nodes/Base";
import { Comment, TextNode } from "./nodes/Root";
import { RendererOptions } from "@vue/runtime-core";
import { VuetrexStage } from "./index";
import {types} from "@/runtime/nodes/types";

export const nodeOps = (stage: VuetrexStage): Omit<RendererOptions<Base, Base>, "patchProp"> => ({

  insert: (child, parent, anchor) => {
    console.log("insert() ",child,parent)
    if (anchor != null) {
      parent._insertBefore(child, anchor);
    } else {
      parent._appendChild(child);
    }
  },

  remove: (child) => {
    console.log("remove() ",child)
    const parent = child.parent;
    if (parent != null) {
      parent._removeChild(child);
    }
  },

  createElement: (tag: keyof typeof types, isSVG, isCustomizedBuiltIn) => {
     console.log("create() ",tag)
     let type = types[tag];
     if (!type) {
       console.warn(`Unknown native tag: ${tag}`);
       type = types["node"];
     }
     //console.log("createElement tag: "+tag,isSVG,isCustomizedBuiltIn)
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
