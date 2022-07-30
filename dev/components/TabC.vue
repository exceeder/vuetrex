<template>
   <div>
     <input type="checkbox" id="stop" v-model="paused"> <label for="stop">paused</label>
   </div>

   <vuetrex height="79vh" width="100%" :camera="camera" :stopped="paused" :settings="settings" @ready="onStageReady">
      <row>
        <box name="xx" :text="'['+counter+']'" @click="counter++"/>
      </row>
      <row>
          <cylinder name="yy" text="click me" connection="xx" @click="cylClick"/>
      </row>
      <row>
       <box text="singleton" connection="yy" />
     </row>
   </vuetrex>
</template>

<script lang="ts">
import {ref} from "vue";
import {Vuetrex, VxStage, VxSettings, VxMouseEvent} from '@/lib-components/index';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
//import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
//import {AdditiveBlending} from "three";


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
    const camera = ref("scene")
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
      particleVolume: 5,
      particleBlending: 1
    }

    function cylClick(ev: VxMouseEvent) {
      camera.value === ev.vxNode.name ? camera.value = "scene" : camera.value = ev.vxNode.name;
    }

    function loadGLTFModel(stage:VxStage) {
      //loading external model
      const loader = new GLTFLoader();
      loader.load('dev/assets/tripod2-2.gltf', gltf => {
            const sceneGroup = gltf.scene;
            sceneGroup.scale.set(0.75,0.75,0.75);
            sceneGroup.position.set(0.0, -0.30,-1.0);
            sceneGroup.rotation.set(0.0,0.50,0.0);


            sceneGroup.traverse(o => {

              if (o.parent !== null) {
                console.log(o.name, ':', o.isObject3D, o);
                (o as any).material.map.encoding = 3001; //THREE.LinearEncoding, see also THREE.sRGBEncoding
                o.castShadow = true;
                o.receiveShadow = false;
              }

            });
            stage.getScene().add(sceneGroup);

          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error) => {
            console.log('An error happened', error);
          });
    }

    function onStageReady(stage:VxStage) {
      loadGLTFModel(stage);
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
      camera,
      onStageReady,
      cylClick
    }
  }
}
</script>