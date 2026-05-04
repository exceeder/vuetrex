import {ComponentInternalInstance, ElementNamespace, SuspenseBoundary, VNode} from 'vue';
import { Base } from '@/lib-components/nodes/Base.js';

/**
 * Executed when a prop is passed to a custom object
 */
export function patchProp(
    el: Base,
    key: string,
    prevValue: any,
    nextValue: any,
    namespace?: ElementNamespace,
    parentComponent?: ComponentInternalInstance | null
) {
  getSetter(key)(el, nextValue);
}

type SetterFunction = (el: Base, value: any) => void;

const setterCache: Record<string, SetterFunction> = {};

const getSetter = (key: string) => {
  if (!setterCache[key]) {
    setterCache[key] = (el, value) => el.setStateValue(key, value);
  }
  return setterCache[key];
};
