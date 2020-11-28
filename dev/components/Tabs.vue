<template>
  <div>
    <div class="tabs">
        <div v-for="(tab, index) in tabs" :key="index" @click="selectTab(index)"
            :class="{'tab-selected': index === selectedIndex}" >
          {{ tab.props.title }}
        </div>
    </div>

    <div class="tabs-details">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent, watch, onMounted, provide, reactive, toRefs, VNode} from "vue";

interface TabProps {
  name: string;
  href: string;
}

export default defineComponent({
  name: 'Tabs',
  setup(_, {slots}) {

    const state = reactive({
      selectedIndex: 0,
      tabs: [] as VNode<TabProps>[],
      count: 0
    });

    provide("TabsProvider", state);

    const selectTab = (i: number) => { state.selectedIndex = i }

    watch(
        () => state.count,
        () => {
          if (slots.default) {
            state.tabs = slots.default().filter((child:any) => child.type.name === "Tab") as VNode<TabProps>[];
          }
        }
    )

    onMounted(() => { selectTab(0) })

    return {
      ...toRefs(state),
      selectTab
    }
  }
});
</script>

<style>
.tabs > div {
  text-align:left; display: inline-block;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}
.tabs > .tab-selected {
  text-decoration: underline;
  color: #2c3e50;
}

.tabs-details {
  border: #777 1px solid;
}
</style>