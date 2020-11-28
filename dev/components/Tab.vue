<template>
  <div v-show="isActive"><slot></slot></div>
</template>
<script type="ts">
import {defineComponent, inject, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";

export default defineComponent({
  name: 'Tab',
  props: ['title'],
  setup() {
    const index = ref(0);
    const isActive = ref(false);

    const tabs = inject("TabsProvider");

    watch(
        () => tabs.selectedIndex,
        () => {
          isActive.value = index.value === tabs.selectedIndex;
        }
    );

    onBeforeMount(() => {
      index.value = tabs.count;
      tabs.count++;
      isActive.value = index.value === tabs.selectedIndex;
    });

    onBeforeUnmount(() => {
      tabs.count--
    })

    return {index, isActive};
  }
});
</script>