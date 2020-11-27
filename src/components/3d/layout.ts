import {h, Ref, unref, defineComponent, provide, inject, onMounted, ref} from 'vue'

//const lenOr0 = (arr: any[]) => (arr && arr.length) || 0;
import {State3d} from './Stage3d.vue';
import Stage from '@/three/stage';

// interface RenderContext {
//   row: number,
//   col: number,
// }

export const Layout = defineComponent({
  setup(props, ctx) {

    const state3d = <State3d>inject('state3d');

    const info = { numRows: 0 }

    provide('numRows', () => info.numRows);

    return () => {
      const slots = state3d.ready.value && ctx.slots.default ? ctx.slots.default() : [];
      if (slots.length) {
        info.numRows = slots.length; //remember num rows
        slots.forEach((vNode, idx) => {
          vNode.props = Object.assign({ idx: idx }, vNode.props);
          //console.log(vNode, idx)
        });
      }
      console.log('layout slots:',slots)
      return h("div", { style: { display: "none" } }, slots);
    }
  }
});

export const Row = defineComponent({
  props: ['idx'],
  setup(props, ctx) {
    const state3d: State3d = <State3d>inject('state3d');
    const numRows = <Function>inject('numRows');
    // onMounted(() => {
    //   console.log('Row:',state3d,' numRows',  numRows(), ' idx', props.idx);
    // })
    return () => {
      const slots = state3d.ready && ctx.slots.default ? ctx.slots.default() : [];
      if (slots.length) {
        const rowSize = slots.length;
        slots.forEach((vNode, idx) => {
          console.log("   vNode "+JSON.stringify(vNode.dynamicProps)+" "+JSON.stringify(vNode.props))
          vNode.props = Object.assign(vNode.props || {},
              {idx: idx, row: props.idx, rowSize: rowSize, numRows: numRows});
          console.log("   vNode "+JSON.stringify(vNode.props))
        });
      }
      console.log('  row slots:',slots)
      return h("i", slots);
    }
  }
})

export const Box = defineComponent({
  props: ["idx", "row", "rowSize", "numRows", "name", "size", "altitude"],
  setup(props, ctx) {
    const state3d: State3d = <State3d>inject('state3d');
    if (state3d === null || state3d.stage === null) return;
    const stage = unref(<Stage>state3d.stage);
    console.log('    sbox '+JSON.stringify(props))
    return () => {
      console.log('    box '+JSON.stringify(props))
      if (props.idx !== undefined) {
        const box3d = stage.renderMesh(
            props.idx, props.row, props.rowSize, props.numRows(),
            props.name,
            props.size
        );
        if ('altitude' in props) {
          box3d.position.y = parseFloat(props.altitude);
        }
      }
    };
  }
})

export const Cylinder = defineComponent({
  props: ["idx", "row", "rowSize", "numRows", "name", "size", "altitude"],
  setup(props, ctx) {
    const state3d: State3d = <State3d>inject('state3d');
    if (state3d === null || state3d.stage === null) return;
    const stage = unref(<Stage>state3d.stage);
    return () => {
      console.log('    cyl '+props.name, props.idx, props.row)
      const cylinder3d = stage.renderCylinder(
          0,0,2,1,
          props.name,
          props.size
      );
      if ('altitude' in props) {
        cylinder3d.position.y = parseFloat(props.altitude);
      }
    };
  }
})
