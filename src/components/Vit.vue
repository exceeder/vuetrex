<template>
  <div>
    Place for future component {{state.name}}: '{{msg}}'
    <p/>
    <button @click="onBtnClick">Click me</button>
    <div>
      <DiagramTool/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import DiagramTool from './DiagramTool.vue';

const Vit = defineComponent( {
  props: {
    msg: {
      type: String,
      default:'not  there'
    }
  },
  components: {
    DiagramTool
  },
  setup() {

    const state =  reactive({
      name: 'hi'
    })

    const onBtnClick = () => {
      console.log('clicked')
      state.name += ''  + Math.floor(Math.random()*50);
    }
    return {
      state,
      onBtnClick
    }
  },

})
export default Vit;
</script>