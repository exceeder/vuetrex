/*
* This is a helper to handle Three.js dependencies in one place.
* It also allows to prefix all three.js classes with THREE.*
*/

export * from "three";
export {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
export {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
export {Reflector} from "three/examples/jsm/objects/Reflector";
export {RoundedBoxBufferGeometry} from "three/examples/jsm/geometries/RoundedBoxBufferGeometry";

/* ---

The approach below uses Three.js sources directly
to let tree shaking optimize better, but the result is 30% worse than using '* from three' as above,
 ie. rollup works better with the original...
see https://discourse.threejs.org/t/tree-shaking-three-js/1349

export { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
export { Scene } from 'three/src/scenes/Scene';
export { Mesh } from 'three/src/objects/Mesh';
export * from 'three/src/geometries/Geometries';
export * from 'three/src/materials/Materials';
export { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
export { Vector3 } from 'three/src/math/Vector3';
export { Color } from 'three/src/math/Color';
export {PointLight} from 'three/src/lights/PointLight'
export {SpotLight} from 'three/src/lights/SpotLight'
export {AmbientLight} from 'three/src/lights/AmbientLight'
export * from 'three/src/cameras/Camera'
export * from 'three/src/core/Raycaster'
export {Object3D} from 'three/src/core/Object3D'

// export * from 'three/src/constants';
// export { BufferGeometry } from 'three/src/core/BufferGeometry';
// export * from 'three/src/core/BufferAttribute';
// export { TextureLoader } from 'three/src/loaders/TextureLoader';
// export { LoadingManager } from 'three/src/loaders/LoadingManager';
// export { FontLoader } from 'three/src/loaders/FontLoader';
// export { Cache } from 'three/src/loaders/Cache';
// export { MathUtils } from 'three/src/math/MathUtils';
// export { Vector2 } from 'three/src/math/Vector2';

--- */