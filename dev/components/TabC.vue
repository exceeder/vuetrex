<template>
  <vuetrex>
    <layer>
      <row>
        <box name="a1" />
        <box name="a2" connection="a1"/>
        <box name="a3" connection="a2"/>
      </row>
    </layer>
  </vuetrex>
</template>

<script lang="ts">
import {SetupContext, ref} from "vue";
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