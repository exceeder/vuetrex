<template>
  <vuetrex :camera="camera" >
    <layer @click="click3d">
      <row>
        <stack >
          <box size="1.3" height="0.25" name="s1" text="stack 1"/>
          <box size="0.5" height="0.25"/>
          <box size="0.5" height="0.25"/>
          <box size="0.5" height="0.25"/>
          <box size="0.5" height="0.25"/>
        </stack>
        <stack >
          <box size="1.5" height="0.25" name="s2"  text="stack 2"/>
          <box size="0.5"/>
        </stack>
        <stack >
          <box size="1.5" height="0.25" name="s3"  text="stack 2"/>
          <box size="0.5"/>
        </stack>
        <stack >
          <box size="1.5" height="0.25" name="s4"  text="stack 2"/>
          <box size="0.5"/>
        </stack>
      </row>
      <row>
        <layer :elevation="-0.5">
          <row layout="circular">
            <box text="a1" />
            <box text="a2" />
            <box text="a3" />
            <box text="a4" />
            <box text="a5" />
            <box text="a6" />
            <box text="a7" />
          </row>
        </layer>
      </row>
      <row>
        <stack >
          <box size="1.3" height="0.25" name="t1" text="Empty Spot" connection="s1"/>

        </stack>
        <stack >
          <box size="1.5" height="0.25" name="t2"  text="Small Deploy"/>
          <box size="0.5"/>
        </stack>
        <stack >
          <box size="1.5" height="0.25" name="t3"  text="Complex set"/>
          <box size="0.5" height="0.2"/>
          <box size="0.5" height="0.3"/>
          <box size="0.5" height="0.3"/>
          <box size="0.5" height="0.3"/>
          <box size="0.5" height="0.1"/>
        </stack>
        <stack >
          <box size="1.5" height="0.25" name="t4"  text="Lebowsky" connection="s4"/>
          <box size="0.5"/>
        </stack>
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
      if (ev.vxNode) {
        camera.value === ev.vxNode.name ? camera.value = "scene" : camera.value = ev.vxNode.name;
      } else {
        camera.value = "scene"
      }
    }

    setInterval(() => {
      counter.value  ++;
      elevation.value = 0.1 + 0.2 * Math.sin(Math.PI/32*counter.value);
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