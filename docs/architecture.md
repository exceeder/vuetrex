# Vuetrex Architecture

Vuetrex replaces Vue's DOM renderer with a Three.js scene. Vue templates author 3D diagrams; the custom renderer drives Three.js instead of the browser DOM.

---

## Rendering pipeline

```
Vue template
    │ Vue Custom Renderer (nodeOps.ts, patchProp.ts)
    ▼
Base / Node tree          ← logical, reactive (Vue refs/computed)
    │ syncWithThree() + watchEffect
    ▼
Three.js scene            ← visual, imperative
    │ gsap ticker (25 fps)
    ▼
WebGL canvas
```

---

## Key abstractions

### `Base` (`nodes/Base.ts`)
Tree node skeleton. Owns parent/children refs, `appendChild`/`removeChild`/`insertBefore`, and the deferred sync queue (`registerSync` → `applySync`). No Three.js knowledge. `Comment` and `TextNode` extend this directly.

### `Node` (`nodes/Node.ts`)
Extends `Base`. Everything that can exist in the 3D scene. Holds:
- `element: Element3d` — the bridge to Three.js
- `stage: VuetrexStage` — scene-level services
- click event dispatch (bubbling)
- **`layoutPositionOf(child): Vector3`** — default grid layout; container nodes override this

### `MeshNode` (`nodes/MeshNode.ts`)
Extends `Node`. Base for all geometry nodes. Provides reactive `state` (`text`, `size`, `height`, `connection`, `material`, `hover`), shared `syncWithThree()` lifecycle (watchEffect → `stage.renderMesh`), connection wiring, and `onRemoved()` cleanup. **To add a new shape: extend `MeshNode`, implement `modelGen()`.**

### Material & Interaction (`nodes/material.ts`)

- **`VxMaterialProps`:** reactive material state (color, opacity, roughness, metalness, emissive, etc.)
- **`VxHoverProps`:** hover overrides (`VxMaterialProps` + `scale`, `transition`)
- **`MeshNode` hover:** manages snapshots of base material, applies overrides on `onMouseOver` using `gsap` for smooth transitions, and restores from snapshot on `onMouseOut`.

### Concrete nodes

| Class      | Role                                | Key override                             |
|------------|-------------------------------------|------------------------------------------|
| `Box`      | Rounded-box geometry                | `modelGen()`                             |
| `Cylinder` | Beveled cylinder                    | `modelGen()`, `flushMode = 'sync'`       |
| `Wedge`    | Beveled ring segment                | `modelGen()`, `flushMode = 'sync'`       |
| `Layer`    | Grouping plane with scale/elevation | `isLayer()`, `syncWithThree()`           |
| `Row`      | Horizontal layout container         | `layoutPositionOf()` — grid              |
| `Stack`    | Vertical stacking container         | `layoutPositionOf()` — cumulative height |
| `Ring`     | Circular layout container           | `layoutPositionOf()` — circular          |
| `Root`     | Tree root, owns destroy             | —                                        |

### `Element3d` (`three/element3d.ts`)
Thin bridge: holds `mesh: THREE.Object3D` and `pos: Vector3`. `getPosition()` delegates to `node.parent.layoutPositionOf(node)` — no layout logic lives here.

### `VuetrexStage` (`three/stage.ts`)
Scene infrastructure. Manages floor, mirror, lights, caption texture, connectors, `renderMesh()`, `removeObject()`, camera, raycasting. Exposes `boxRadius` / `boxDistance` (configurable via `VxSettings`).

- **`VxAnimProps`:** target transform values for `animateTo()` (positionY, scale, etc.)
- **`VxAnimOptions`:** animation timing and easing (duration, ease, delay, onComplete)
- **`animateTo(id, props, opts)`:** programmatically animates a node's transform, isolating callers from Three.js internals.

---

## Layout system

Each container node owns the position calculation for its children via `layoutPositionOf(child: Node): Vector3`. Containers read `stage.boxRadius` / `stage.boxDistance` for spacing.

- **`Node` (default):** grid — rows × columns, offset by parent layer position
- **`Row`:** circular if `state.layout === 'circular'`, otherwise inherits default
- **`Stack`:** stacks children on Y axis by cumulative height

Adding a new layout: subclass `Node` (or `Row`), override `layoutPositionOf()`.

---

## Reactive sync

Structural changes (append/remove/insert) call `registerSync()` which batches via `queuePostFlushCb`. After Vue's render flush, `applySync()` calls `syncWithThree()` on each child. `MeshNode.syncWithThree()` installs a `watchEffect` that re-runs whenever reactive state (size, height, position) changes.

---

## Events

### click:
1. DOM mousedown → `scene.ts:bindEvents` → `stage.ts:onCanvasClick` → `el3d.mesh.dispatchEvent({type:'click'})` → Three.js event on mesh
2. `Node.subscribeEvents()` binds clickListener on the mesh → calls `dispatchClick()` → `nodeEvents.onClick(e)`
3. `patchProp.ts` sets `el.onClick = handler` via the set onClick() setter on Node

### dblclick is like click 
DOM event → raycast → Three.js mesh event → node dispatch → bubbles up the tree

### pointerenter/pointerleave 
Driven by the existing per-frame hover tracker in mouseAnimationFn (maintains selectedObject). They call new 
onMouseOver/onMouseOut hooks that stage.ts overrides, keeping scene.ts generic. These don't bubble, matching DOM semantics

---

## Adding a new node type

1. Create `nodes/shapes/MyShape.ts`, `extends MeshNode`
2. Implement `modelGen()` returning a `(height, size) => THREE.Object3D` factory
3. Override `protected readonly flushMode` if sync timing matters
4. Register in `nodes/types.ts`: `myshape: MyShape`

For a new container layout: `extends Node`, override `layoutPositionOf(child)`.
