<template>
  <div>
    <section>Hello, {{msg}}!</section>
    <vuetrex>
      <row>
        <box/>
      </row>
    </vuetrex>
  </div>
</template>
<script>
  import {ref} from "vue";
  export default {
    setup() {
      const msg = ref("Vuetrex")
      return {msg}
    }
  }
</script>
