<template>
   <div>
     <input type="checkbox" id="stop" v-model="paused"> <label for="stop">paused</label>
   </div>

   <vuetrex height="79vh" width="100%" :camera="camera" :stopped="paused" :settings="settings" @ready="onStageReady">
      <row>
        <box name="xx" :text="'['+counter+']'" @click="counter++"/>
      </row>
      <row>
          <cylinder ref="cylinder" name="yy" text="click me" connection="xx" @click="cylClick"/>
      </row>
      <row>
       <box text="singleton" connection="yy" />
     </row>
   </vuetrex>
</template>

<script lang="ts">
import {ref} from 'vue';
import {Vuetrex, VxStage, VxSettings, VxMouseEvent} from '@/lib-components/index';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {Text} from 'troika-three-text';
import gsap from 'gsap';
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
    const cylinder = ref(null)
    const counter = ref(0)
    const paused = ref(false)
    const camera = ref("scene")
    let thing = null
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
      const pos = cylinder.value.element.mesh.position;
      if (camera.value === ev.vxNode.name) {
        camera.value = "scene"
        // gsap.to(thing.position, {duration:1, x:0, z:-1});
        //gsap.to(thing.position, {duration:1, x:0, y:-.5});
        gsap.to(pos, {duration:0.1, x:0, y:-0.1});
        gsap.to(pos, {duration:0.1, x:0, y:0.2, delay: 0.1});
        //gsap.to(pos, {duration:1, x:0, y:0.5});

      } else {
        camera.value = ev.vxNode.name;
        //gsap.to(thing.position, {duration:1, x:0, y:-1.5});
        gsap.to(pos, {duration:0.1, x:0, y:-0.1});
        gsap.to(pos, {duration:0.1, x:0, y:0.2, delay: 0.1});
      }

    }

    function loadGLTFModel(stage:VxStage) {
      //loading external model
      const loader = new GLTFLoader();
      loader.load('demo/assets/tripod2-2.gltf', gltf => {
            const sceneGroup = gltf.scene;
            thing = sceneGroup;
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

            const myText = new Text();
            stage.getScene().add(myText);
            myText.text = 'Welcome to the demo!\nThis is an example of\na simple 3D chart'
            myText.font = 'https://fonts.gstatic.com/s/notosans/v7/o-0IIpQlx3QUlC5A4PNr5TRG.woff'

            myText.anchorX = 'center'
            myText.selectable = true
            myText.lineHeight = 1.3
            myText.fontSize = 0.3
            myText.position.z = 2
            myText.position.y = 0.1
            myText.position.x = 0
            myText.rotation.x = -1.57
            myText.color = 0x8090A0
            myText.sync()

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
      cylinder,
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