<template>
  <img alt="Vue logo" src="./assets/logo.png" style="float:left; padding:0;margin:0">
  <tabs>
    <tab title="Example 1" :selected="true">
      <section>
        <h2>Multi-Row Setup</h2>
        <label>
          Boxes in the first row ( {{items.length}} ):
          <input type="range" min="0" max="5" :value="items.length" @input="e => updateItems(e.target.value)">
        </label>
        <p/>
        <vuetrex>
          <Boxes :items="items" />
        </vuetrex>

      </section>
    </tab>
    <tab title="Example 2">
      <h1>How much we do it for</h1>
    </tab>
    <tab title="Example 3">
      <h1>Example 3</h1>
    </tab>
  </tabs>

</template>

<script lang="ts">
import {Vuetrex} from '@/lib-components/index';
import Boxes from './components/Boxes.vue';
import Tabs from './components/Tabs.vue';
import Tab from './components/Tab.vue';
import {defineComponent, ref, reactive} from "vue";

export default defineComponent( {
  components: {
    Vuetrex,
    Boxes,
    Tabs,
    Tab
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
