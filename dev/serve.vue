<script lang="ts">
import { defineComponent } from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
import * as C from '@/entry.esm';

export default defineComponent({
  name: 'ServeDev',
  components: {
   Vuetrex: C.default
  }
});
</script>

<template>
  <div id="app">
    <vuetrex-sample />
  </div>
</template>
