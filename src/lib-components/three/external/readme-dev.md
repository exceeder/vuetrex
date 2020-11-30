This directory contains copies of files from three/examples/jsm/* with imports sections adjusted to local tree.

The reason not to reference them in examples is twofold:
1. Rollup tree shaking and bundling fails on them: https://github.com/mrdoob/three.js/issues/17482
2. Their imports reference three/src instad of "three", causing double-inclusion