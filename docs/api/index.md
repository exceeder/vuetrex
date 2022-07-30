# Core Concepts
## Layouting

Multiple _rows_:
```vue
 <vuetrex>
    <row>   <box/> <box/>  </row>
    <row>   <box/> <box/>  </row>
    <row>   <box/>         </row>            
  </vuetrex>
```
Rows orientation is from left to right, as if they were rows in the movie theater with the screen on the left side.
![EXAMPLE 2](/screen2.png)

Nested _layers_:
```vue
 <vuetrex>
    <row>
       <layer> <box /> <box /> </layer>   
    </row>
    <row> <box/> </row>
    <row>
      <layer>
         <row> <box/> </row>
         <row> <box/> </row> 
      </layer>   
    </row>            
  </vuetrex>
```
Note, that you can use `v-for` to bind elements to your data.

## Connectors and Captions

```vue
 <vuetrex>
    <box name="a"/>
    <cylinder name="b" text="Round" connection="a"/>
  </vuetrex>
```

![EXAMPLE 3](/screen3.png)

Connections are particle systems running along the connector lines. Both elements need to have a name
property to connect.

Caption reflects the text property. Caption text is reactive in case of `:text="prop"` syntax.

## Events

```vue
  <vuetrex>   
    <box :text="'['+counter+']'" @click="counter++"/>
  </vuetrex>
```
as one would expect, in `setup()` you will need a `const counter = ref(0)` that you return in this case.
There is only one possible event `click` at the moment.

## Camera

By setting a `camera` property to the name of the element you want to focus on, you will make Vuetrex zoom in on it.
If you set it to `"scene"` (default value), it will go back to overview position.

```vue
<template>
 <vuetrex :camera="camera">
   <row>
     <box v-for="item in list" :key="item" :text="item" @click="zoomIn"/>
   </row>
 </vuetrex>
</template>
<script>
//...
export default {
  components: { Vuetrex },
  setup() {
    const camera = ref("scene") 
    const list = reactive(["Bravo", "Charlie", "Echo", "Delta"])

    function zoomIn(event) {
        //zoom in on every clicked item, unless it is already in focus,
        // in which case zoom out to a full view
        camera.value = camera.value === event.vxNode.name ? "scene" : event.vxNode.name
    }

    return { camera, list, zoomIn} 
  }
}
</script> 
```
![Example](/zoom.gif)
