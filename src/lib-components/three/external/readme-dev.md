This directory contains only utilities that have no official Three.js jsm equivalent.

- `DynamicTexture` — adapted from https://github.com/jeromeetienne/threex.dynamictexture

Previously held copies of Three.js jsm add-ons (EffectComposer, RenderPass, Reflector,
RoundedBoxGeometry) that worked around Rollup bundling issues (three.js#17482) and the
old `three/src` import paths in jsm files. Both issues are resolved in modern Three.js (r140+),
so those files have been removed in favour of direct `three/examples/jsm/*` imports.