<template>
  <vuetrex>
    <layer>
      <row v-if="items.length > 0">
        <box v-for="(el,i) in items" :key="i" :text="'dynamic '+el" connection="b2"/>
      </row>
      <row>
        <box name="b1" size="1"/>
        <box name="b2" />
        <box name="b3"/>
        <box name="b4"/>
      </row>
      <row>
        <box name="c1" connection="b1"/>
        <cylinder name="c2" :text="'clicks: ' + counter" @click="cylClick" connection="b3"/>
      </row>
      <row>
        <box name="d1" size="3" connection="b4"/>
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
      counter.value++;
    }

    return {
      counter,
      cylClick
    }
  }
}
</script>