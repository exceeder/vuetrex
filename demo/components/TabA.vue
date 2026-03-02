<template>
  <vuetrex :camera="camera" height="75vh">
    <layer>
      <row>
        <box v-for="(el,i) in items" :key="i" :name="'a'+i" :text="'dynamic '+el" connection="b2" @click="dBoxClick"/>
      </row>
      <row>
        <box name="b1" text="I'm lost" @click="dBoxClick"/>
        <box name="b2" text="busy bee" @click="dBoxClick" connection="a0"/>
        <box name="b3" @click="dBoxClick"  connection="b2"/>
        <box name="b4" @click="dBoxClick" text="bot"/>
      </row>
      <row>
        <box name="c1" />
        <cylinder name="c2" :text="'clicks: ' + counter" @click="cylinderClick" connection="b3"/>
        <cylinder name="c3" text="new" />
      </row>
      <row>
        <box name="d1" size="2" @click="dBoxClick" connection="c2" />
      </row>
      <row v-if="extraRow">
        <box name="e1" size="1" connection="d1"/>
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
    },
    extraRow: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const counter = ref(0);
    const camera = ref("scene"); //initially point camera to the overview

    function cylinderClick(ev:any) {
      counter.value++;
    }

    function dBoxClick(ev:any) {
      console.log("Clicked: ",ev.vxNode.name)
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
