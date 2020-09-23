import {nodeOps, TestNode, TestElement, NodeTypes, dumpOps} from '@/render/nodeOps';
import {patchProp} from '@/render/patchProp';
//import App from './App.vue';
import { extend } from '@vue/shared'
import { serializeInner } from '@/render/serialize'

import { h, createRenderer, VNode, RootRenderFunction, CreateAppFunction } from '@vue/runtime-core'
//import TRenderer from '@/components/3d/renderer'
const { render: baseRender, createApp: baseCreateApp } = createRenderer(
    extend({ patchProp }, nodeOps)
)

// const root : TestElement = {
//     id: 0,
//     type: NodeTypes.ELEMENT,
//     parentNode: null,
//     tag: "div",
//     children: [],
//     props: {},
//     eventListeners: null
// }

export const render = baseRender as RootRenderFunction<TestElement>
export const createApp = baseCreateApp as CreateAppFunction<TestElement>


// convenience for one-off render validations
export function renderToString(vnode: VNode) {
    const root = nodeOps.createElement('div')
    render(vnode, root)
    return serializeInner(root)
}

const App = {
    data () {
        return {
            msg: 'Hello World!'
        }
    },
    render: function ():VNode {


        return h('div',
            // @ts-ignore
            [h('p','abc'), h('p',this.msg)],

        )
    }
}


const root = nodeOps.createElement('div')
render(h(App), root)

const ops = dumpOps()
console.log(ops)

//createApp(<any>App).mount(root);
