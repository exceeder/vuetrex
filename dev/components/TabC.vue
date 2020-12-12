<template>
   <div>
     <input type="checkbox" id="stop" v-model="paused"> <label for="stop">paused</label>
   </div>

   <vuetrex height="79vh" width="100%" :stopped="paused" :settings="settings" @ready="onStageReady">
      <row>
          <box name="xx"  :text="'['+counter+']'" @click="counter++"/>
          <cylinder />
      </row>
     <row>
       <box text="singleton" connection="xx"/>
     </row>
   </vuetrex>
</template>

<script lang="ts">
import {SetupContext, ref} from "vue";
import {Vuetrex, VxStage, VxSettings} from '@/lib-components/index';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


export default {
  components: {
    Vuetrex
  },
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  },
  setup() {
    const counter = ref(0)
    const paused = ref(false)
    //light scheme example
    const settings : VxSettings = {
      unit: 1.25,
      distance: 1.5,
      color: 0x334455,
      highlightColor: 0x3377bb,
      floorColor: 0xffffff,
      captionColor: 0x333333,
      particleColor: 0x707070,
      lightColor1: 0xffffff,
      lightColor2: 0xffffff,
      lightColor3: 0xffffff,
      mirrorOpacity: 0.9,
      particleSpread: 0.1,
      particleVolume: 5
    }

    function cylClick(ev:any) {
      console.log("Cylinder Click!",ev)
    }

    function onStageReady(stage:VxStage) {

      //loading external model
      const loader = new GLTFLoader();
      loader.load('tripod2.gltf', gltf => {
            const sceneGroup = gltf.scene;
            sceneGroup.scale.set(0.75,0.75,0.75);
            sceneGroup.position.set(-3.5,-0.5,0.0);
            stage.getScene().add(sceneGroup);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error) => {
            console.log('An error happened', error);
      });

      //animation simply counts fps
      let pTime = ( performance || Date ).now();
      let frames = 0;
      stage.onEachFrame((time, tick) => {
         frames++;
         if (frames > 1000) {
           console.log("FPS:", ( frames * 1000 ) / ( time - pTime ))
           frames = 0;
           pTime = time;
         }
      })
    }

    return {
      paused,
      counter,
      settings,
      onStageReady,
      cylClick
    }
  }
}
</script>