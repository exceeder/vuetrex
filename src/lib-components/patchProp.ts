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
      el[key] = value
      if (key === 'text' && (el as any).element?.mesh) {
        el.syncWithThree();
      }
    }
  }
  return setterCache[key];
};
