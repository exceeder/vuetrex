<template>
  <vuetrex>
    <layer>
      <row>
        <box name="b1" text="I'm b1"/>
        <box name="b2" text="I'm b1" />
        <box name="b3" />
        <box name="b4" />
      </row>
    </layer>
  </vuetrex>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {Vuetrex} from '@/lib-components';

export default defineComponent({
  components: {
    Vuetrex
  },
  props: {
  },
  setup() {
    const counter = ref(0);
    return {
      counter
    }
  }
})
</script>