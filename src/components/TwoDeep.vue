<template>
  <div>
    <p>
      [<span v-for="i in items" :key="i">{{i==1?'':','}}a{{ i }}</span>]
    </p>
  </div>
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
        console.log("vv2deep: new items:", i.length, i)
    });
  }
}
</script>