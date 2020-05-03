<template>
  <div>Place for future component {{name}}: '{{msg}}'</div>
</template>
<script>
    import { ref } from 'vue'
    export default {
        props: {
            msg: String
        },
        setup(){
            const name = ref("3D-Vit");
            return {name}
        }
    }
</script>