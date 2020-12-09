import Vuetrex from "@/lib-components/vuetrex"
import { shallowMount } from '@vue/test-utils'

beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = (type:string) => ({
        getParameter(p:any) { return 'WebGL 1.0'; },
        getExtension(p:any) { return 0; },
        createTexture() { return [] },
        bindTexture() { return [] },
        texParameteri() { return [] },
        texImage2D() { return [] },
        clearColor() { },
        clearRect() { },
        fillRect() { },
        clearDepth() { },
        clearStencil() { },
        depthFunc() { },
        enable() { },
        frontFace() { },
        cullFace() { },
        scissor() { },
        viewport() { },
        disable() { },
        clear() { },
    }) as any;
});


describe('The Vuetrex Stage object', () => {

    it('should be able to mount Stage', function() {
        // @ts-ignore
        const wrapper = shallowMount(Vuetrex,{
            propsData: {
                play: false
            }
        });
        expect(wrapper).toBeDefined();
    })
})