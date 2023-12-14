import Vuetrex from "@/lib-components/vuetrex"
import { shallowMount } from '@vue/test-utils'
import { describe, it, expect} from 'vitest'

describe('The Vuetrex Stage object', () => {

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