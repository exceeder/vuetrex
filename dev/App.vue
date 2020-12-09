<template>
  <img alt="Vue logo" src="./assets/logo.png" style="float:left; padding:0;margin:0">
  <tabs>
    <tab title="Example 1" :selected="true">
        <h2>Multi-Row Setup</h2>
        <section>
          <label>
            Boxes in the first row ( {{items.length}} ):
            <input type="range" min="0" max="5" :value="items.length" @input="e => updateItems(e.target.value)">
          </label>
          <p/>
            <TabA :items="items" />
        </section>
    </tab>
    <tab title="Example 2">
      <h1>Nested layers</h1>
      <section>
        <TabB :items="items" />
      </section>
    </tab>
    <tab title="Example 3">
      <h1>Stacks and Connectors</h1>
      <section>
        <TabC />
      </section>
    </tab>
  </tabs>

</template>

<script lang="ts">
import TabA from './components/TabA.vue';
import TabB from './components/TabB.vue';
import TabC from './components/TabC.vue';
import Tabs from './components/Tabs.vue';
import Tab from './components/Tab.vue';
import {defineComponent, ref, reactive} from "vue";

export default defineComponent( {
  components: {
    TabA,
    TabB,
    TabC,
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
