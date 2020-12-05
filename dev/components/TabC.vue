<template>
    <layer>
      <row>
        <box name="a1"/>
        <box name="a2"/>
        <box name="a3"/>
      </row>
    </layer>
</template>

<script lang="ts">
import {watchEffect, SetupContext, ref} from "vue";

export default {
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  },
  setup(props: object, context: SetupContext) {

    const counter = ref(0);

    function cylClick(ev:any) {
      console.log("Cylinder Click!",ev)
    }

    return {
      counter,
      cylClick
    }
  }
}
</script>