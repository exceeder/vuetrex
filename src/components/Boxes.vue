<template>
    <layer>
      <row v-if="items.length > 0">
        <box v-for="i in items" :key="i" :name="'a'+i"/>
      </row>
      <row>
        <box name="b1"/>
        <box name="b2"/>
      </row>
      <row>
        <box name="c1"/>
        <cylinder name="c2"/>
      </row>
      <row>
        <box name="d1" size="4"/>
      </row>
    </layer>

</template>

<script lang="ts">
import {watchEffect, SetupContext} from "vue";

export default {
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  },
  setup(props: object, context: SetupContext) {
    console.log("     context:", context.attrs, context.slots, context.emit);
    watchEffect(() => {
      const i = (props as any).items;
      console.log("$$$ new items:", i.length, i)
    });
  }
}
</script>