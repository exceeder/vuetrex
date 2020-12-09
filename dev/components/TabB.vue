<template>
  <vuetrex>
    <layer>
      <row>
        <box text="a1"/>
        <box text="a2"/>
        <layer>
          <row>
            <box text="a3-a1"/>
          </row>
          <row>
            <box text="a3-b1"/>
            <layer>
              <row>
                <box text="a3-b1-1"/>
              </row>
              <row>
                <box text="a3-b1-2"/>
                <box text="a3-b1-3"/>
              </row>
            </layer>
          </row>
        </layer>
      </row>
      <row>
        <box text="c1"/>
        <cylinder text="c2" @click="cylClick"/>
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