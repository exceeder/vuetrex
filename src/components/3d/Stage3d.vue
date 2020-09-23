<template>
  <div>
    <div>
      <span>Loaded: {{ state3d.ready.value }}. </span>
      <span>Displaying {{ items }} boxes. </span>
      <span v-if="state3d.highlight.value">Currently selected: {{ state3d.highlight.value }}.</span>
    </div>
    <div class="canvas3d" ref="canvas3d"></div>
    <slot></slot>
  </div>
</template>

<script lang="ts">

import Stage from "@/three/stage";
// import {Layout, Box, Cylinder, Row} from "@/components/3d/Layout.vue";
import {defineComponent, provide, onMounted, ref} from "vue";

export interface State3d {
  stage: (object | null),
  ready: ReturnType<typeof ref>
  highlight: ReturnType<typeof ref>
}

export default defineComponent({
  props: {
    items: {
      default: 0
    }
  },
  setup() {

    const state3d: State3d = {
      stage: null,
      ready: ref(false),
      highlight: ref('-none-')
    };

    provide('state3d', state3d);

    const canvas3d = ref(); //template ref

    onMounted(() => {
      console.log('mounted!',canvas3d.value)
      const stage = new Stage(canvas3d.value);
      //create stage environment
      stage.mount();
      //start animation
      stage.start();
      //bind events
      stage.onHighlight( (name:string) => (state3d.highlight.value = name));
      //save stage for layouting
      state3d.stage = stage;
      state3d.ready.value = true;
    });

    return {
      canvas3d,
      state3d
    }
  }
});

</script>

<style scoped>
.canvas3d {
  width: 100%;
  height: calc(100vh - 210px);
  overflow: hidden;
}
</style>