<template>
    <layer>
      <row v-if="items.length > 0">
        <box v-for="(el,i) in items" :key="i" :name="'a'+el"/>
      </row>
      <row>
        <box name="b1" size="2"/>
        <box name="b2"/>
      </row>
      <row>
        <box name="c1"/>
        <cylinder name="c2" @click="cylClick"/>
      </row>
      <row>
        <box name="d1" size="4"/>
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

    console.log("     context:", context.attrs, context.slots, context.emit);

    watchEffect(() => {
      const i = (props as any).items;
      console.log("watchEffect on items:", i.length, i)
    });

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