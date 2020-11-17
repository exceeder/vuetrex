<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <Vuetrex >
<!--  <Vuetrex v-compiler:vuetrex >-->
    <Boxes/>
  </Vuetrex>
</template>

<script lang="ts">
//import Vit from './components/Vit.vue';
import Vuetrex from '@/runtime';
import Boxes from '@/components/Boxes.vue';
import {defineComponent} from "vue";

export default defineComponent( {
  components: {
    Vuetrex,
    Boxes
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
