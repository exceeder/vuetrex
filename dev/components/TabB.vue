<template>
    <layer>
      <row>
        <box name="a1"/>
        <box name="a2"/>
        <layer>
          <row>
            <box name="a3-a1"/>
          </row>
          <row>
            <box name="a3-b1"/>
            <layer>
              <row>
                <box name="a3-b1-1"/>
              </row>
              <row>
                <box name="a3-b1-2"/>
                <box name="a3-b1-3"/>
              </row>
            </layer>
          </row>
        </layer>
      </row>
      <row>
        <box name="c1"/>
        <cylinder name="c2" @click="cylClick"/>
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