import { ComponentInternalInstance, SuspenseBoundary, VNode } from "@vue/runtime-core";
import { Base } from "./nodes/Base";

/**
 * Executed when a prop is passed to a custom object
 */
export function patchProp(
    el: Base,
    key: string,
    prevValue: any,
    nextValue: any,
    isSVG: boolean,
    prevChildren?: VNode[],
    parentComponent?: ComponentInternalInstance,
    parentSuspense?: SuspenseBoundary,
    unmountChildren?: any,
) {
  getSetter(key)(el, nextValue);
}

type SetterFunction = (el: Base, value: any) => void;

const setterCache: Record<string, SetterFunction> = {};

const getSetter = (key: string) => {
  //console.log("patchProp setter for ",key, " in ", setterCache)
  if (!setterCache[key]) {
    setterCache[key] = (el, value) => {
      //console.log(">> pathProp:", key, el);
      // @ts-ignore
      el[key] = value
    }
        //new Function("el", "value", `console.log("a!a!:", el); el["${key}"] = value`) as SetterFunction;
  }
  return setterCache[key];
};
