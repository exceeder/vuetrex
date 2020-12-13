<template>
  <vuetrex :camera="camera" height="75vh">
    <layer>
      <row>
        <box v-for="(el,i) in items" :key="i" :text="'dynamic '+el" connection="b2" @click="dBoxClick"/>
      </row>
      <row>
        <box name="b1" size="1"/>
        <box name="b2" />
        <box name="b3"/>
        <box name="b4"/>
      </row>
      <row>
        <box name="c1" connection="b1"/>
        <cylinder name="c2" :text="'clicks: ' + counter" @click="cylinderClick" connection="b3"/>
      </row>
      <row>
        <box name="d1" size="3" connection="b4"/>
      </row>
    </layer>
  </vuetrex>
</template>

<script lang="ts">
import {ref} from "vue";
import {Vuetrex} from '@/lib-components/index';

export default {
  components: {
    Vuetrex
  },
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  },
  setup() {
    const counter = ref(0);
    const camera = ref("scene"); //initially point camera to the overview

    function cylinderClick(ev:any) {
      counter.value++;
    }

    function dBoxClick(ev:any) {
      camera.value === ev.vxNode.name ? camera.value = "scene" : camera.value = ev.vxNode.name;
    }

    return {
      camera,
      counter,
      cylinderClick,
      dBoxClick
    }
  }
}
</script>