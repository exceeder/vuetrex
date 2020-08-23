<template>
  <div>Place for future component {{name}}: '{{msg}}'</div>
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue'
    export default defineComponent({
        props: {
            msg: String
        },
        setup(){
            const name = ref("3D-Vit");
            return {name}
        }
    })
</script>