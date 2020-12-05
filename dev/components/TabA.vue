<template>
    <layer>
      <row v-if="items.length > 0">
        <box v-for="(el,i) in items" :key="i" :name="'dynamic '+el" size="1"/>
      </row>
      <row>
        <box name="b1" size="2"/>
        <box name="b2"/>
        <box name="b3"/>
      </row>
      <row>
        <box name="c1" connection="b1"/>
        <cylinder name="c2" :text="' ' + counter" @click="cylClick"/>
      </row>
      <row>
        <box name="d1" size="4" connection="c2"/>
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

    // watchEffect(() => {
    //   const i = (props as any).items;
    //   console.log("watchEffect on items:", i.length, i)
    // });

    function cylClick(ev:any) {
      counter.value++;
    }

    return {
      counter,
      cylClick
    }
  }
}
</script>