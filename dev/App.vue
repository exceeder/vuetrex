<template>
  <section>
    <div><img alt="Vue logo" src="./assets/logo.png"></div>
    <label>
      Boxes in the middle row:
      <input type="range" min="0" max="5" :value="items.length" @input="e => updateItems(e.target.value)">
    </label>
    <OneDeep>
      <TwoDeep :items="items" />
    </OneDeep>
    <hr/>

    <Vuetrex>
      <Boxes :items="items" />
    </Vuetrex>

  </section>
</template>

<script lang="ts">
import {Vuetrex} from '@/lib-components/index';
import Boxes from './components/Boxes.vue';
import OneDeep from './components/OneDeep.vue';
import TwoDeep from './components/TwoDeep.vue';
import {defineComponent, ref, reactive} from "vue";

export default defineComponent( {
  components: {
    Vuetrex,
    Boxes,
    OneDeep,
    TwoDeep
  },

  setup() {
    const items = reactive([1])
    const alt = ref(0.1)

    function updateItems(n: number) {
      if (n > items.length) {
        for (let i=0; i < n - items.length; i++) items.push(items.length + 1)
      } else if ( n < items.length) {
        for (let i=0; i < items.length - n; i++) items.pop();
      }
    }

    return {
      items,
      alt,
      updateItems
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
img {
  width: 7em;
}
</style>
