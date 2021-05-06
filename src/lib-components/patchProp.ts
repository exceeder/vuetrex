import { ComponentInternalInstance, SuspenseBoundary, VNode } from "vue";
import { Base } from "@/lib-components/nodes/Base";

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
  if (!setterCache[key]) {
    setterCache[key] = (el, value) => {
      // @ts-ignore
      if (el.state !== undefined && el.state[key] !== undefined) { // @ts-ignore
        if (typeof el.state[key] === 'boolean') // @ts-ignore
          el.state[key] = "true" == value; // @ts-ignore
        else if (typeof el.state[key] === 'number') // @ts-ignore
          el.state[key] = Number.parseFloat(value);
        else // @ts-ignore
          el.state[key] = value;
      } else {
        // @ts-ignore
        el[key] = value
      }
    }
  }
  return setterCache[key];
};
