<template>
  <section>
    <label>
      <input type="range" min="0" max="5" v-model="items">
    </label>
    <ul>
      <li v-for="i in parseInt(items)" :key="i">{{'b'+i}}</li>
    </ul>
    <Stage3d :items="items">
      <Layout>
        <Row>
          <Box name="a1"/>
          <Box name="a2" :altitude="alt / 20.0"/>
        </Row>
        <Row>
          <Box name="b1" size="1"/>
          <Box name="b2" size="1"/>
        </Row>
        <Row>
          <Box name="c1" size="7" :altitude="alt / 10.0"/>
        </Row>
        <Row>
          <Box name="dd" size="1" :altitude="alt / 10.0"/>
          <Box v-for="i in parseInt(items)" :key="i" :name="'d'+i" size="1" altitude="0"/>
        </Row>
      </Layout>
    </Stage3d>
    <label>
      <input type="range" min="0" max="20" v-model="alt">
    </label>
  </section>

</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Stage3d from "./3d/Stage3d.vue";
import {Layout, Row, Box,
  // Cylinder
} from "./3d/layout";


export  default defineComponent({
  components: {
    Stage3d, Layout, Row, Box,
    // Cylinder
  },
  data() {
    return {
      items: 3,
      alt: 0.0
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
