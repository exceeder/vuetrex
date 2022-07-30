import { Base } from "@/lib-components/nodes/Base";
import { Comment, TextNode } from "@/lib-components/nodes/Root";
import { RendererOptions } from "@vue/runtime-core";
import { VuetrexStage } from "@/lib-components/three/stage";
import {types, FunctionalComponent, ClassComponent} from "@/lib-components/nodes/types";

export const nodeOps = (stage: VuetrexStage): Omit<RendererOptions<Base, Base>, "patchProp"> => ({

  insert: (child, parent, anchor) => {
    if (anchor != null) {
      parent.insertBefore(child, anchor);
    } else {
      parent.appendChild(child);
    }
  },

  remove: (child) => {
    const parent = child.parent.value;
    if (parent != null) {
      parent.removeChild(child);
    }
  },

  createElement: (tag: keyof typeof types, isSVG, isCustomizedBuiltIn) => {
    let type = types[tag];
     if (!type) {
       console.warn(`Vuetrex nodeOps: unknown tag: ${tag}`);
       return new Comment("Unknown "+tag);
     }
     if (typeof (type as any).setup === 'function') {
        return (type as FunctionalComponent).setup(stage);
     } else {
       return new (type as ClassComponent)(stage);
     }
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
