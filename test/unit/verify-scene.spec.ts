import { beforeEach, describe, it, expect} from 'vitest'
import { shallowMount } from '@vue/test-utils'
import NoOp from "./NoOp.vue"
import Simple from "./Simple.vue"

beforeEach(() => {
    // HTMLCanvasElement.prototype.getContext = (type:string) => ({
    //     getParameter(p:any) { return 'WebGL 1.0'; },
    //     getExtension(p:any) { return 0; },
    //     createTexture() { return [] },
    //     bindTexture() { return [] },
    //     texParameteri() { return [] },
    //     texImage2D() { return [] },
    //     clearColor() { },
    //     clearRect() { },
    //     fillRect() { },
    //     clearDepth() { },
    //     clearStencil() { },
    //     depthFunc() { },
    //     enable() { },
    //     frontFace() { },
    //     cullFace() { },
    //     scissor() { },
    //     viewport() { },
    //     disable() { },
    //     clear() { },
    // }) as any;
});


describe('Vuetrex Component works object', () => {

    it('should be able to mount Scene', function() {
        // @ts-ignore
        const wrapper = shallowMount(Simple,{
        });
        expect(wrapper).toBeDefined();
    })
})