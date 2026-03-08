import Vuetrex from '@/lib-components/vuetrex.js'
import { shallowMount } from '@vue/test-utils'
import { describe, it, expect} from 'vitest'
import { createRendererForStage } from '@/lib-components/renderer.js';

describe('The Vuetrex Stage object', () => {

    it("should create a renderer for the given stage", () => {
        const mockStage = null as any
        const render = createRendererForStage(mockStage, {})
        expect(typeof render).toBe('function')
    })

    it('should be able to mount Stage', function() {
        // @ts-ignore
        const wrapper = shallowMount(Vuetrex,{
            propsData: {
                camera: "camera"
            }
        });
        expect(wrapper).toBeDefined();
        expect(wrapper.vm.camera).toBe("camera");
    })
})
