<template>
  <vuetrex :camera="camera" >
    <layer @click="click3d">
      <row>
        <stack >
          <box size="1.5" name="s1" text="stack 1"/>
          <box size="0.7" />
          <box size="0.7"/>
        </stack>
        <stack >
          <box size="1.5" name="s2"  text="stack 2"/>
          <box size="0.7"/>
        </stack>
      </row>
      <row>
        <layer :elevation="elevation">
          <row layout="circular">
            <box text="a1" connection="s1" />
            <box text="a2" connection="s2" />
            <box text="a3" connection="s1"/>
            <box text="a4" connection="s2"/>
            <box text="a5" connection="s1"/>
            <box text="a6" connection="s2" />
            <box text="a7" connection="s1" />
          </row>
        </layer>
      </row>
      <row>
        <box text="left" size="3"/>
      </row>
    </layer>
  </vuetrex>
</template>

<script lang="ts">
import {defineComponent, SetupContext, ref} from "vue";
import {Vuetrex, VxSettings} from '@/lib-components/index';

export default defineComponent({
  components: {
    Vuetrex
  },
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  },
  setup(props: object, context: SetupContext) {
    const counter = ref(0);
    const elevation = ref(0.5)
    const camera = ref("scene")
    const settings: VxSettings = {
        particleVolume: 5
    }

    function click3d(ev:any) {
      console.log("TabD Click!",ev, ev.vxNode)
      if (ev.vxNode) {
        camera.value === ev.vxNode.name ? camera.value = "scene" : camera.value = ev.vxNode.name;
      } else {
        camera.value = "scene"
      }
    }

    setInterval(() => {
      counter.value  ++;
      elevation.value = 0.5 + 0.5 * Math.sin(Math.PI/32*counter.value);
    }, 100);

    return {
      camera,
      settings,
      counter,
      elevation,
      click3d
    }
  }
})
</script>