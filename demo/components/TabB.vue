<template>
  <div class="k8s-root">
    <div class="k8s-hud">
      <div v-if="selected" class="k8s-panel">
        <div class="k8s-title">{{ services[selected].label }}</div>
        <div class="k8s-meta">
          <span>namespace: default</span>
          <span>{{ podCounts[selected] }}/{{ podCounts[selected] }} pods ready</span>
        </div>
        <div class="k8s-actions">
          <button @click="triggerScaleUp">&#x2191; Scale</button>
          <button @click="triggerScaleDown">&#x2193; Drain</button>
          <button @click="triggerRestart">&#x21BA; Restart</button>
          <button class="k8s-close" @click="deselectAll">&#x2715;</button>
        </div>
      </div>
      <div v-else-if="hovered" class="k8s-hint k8s-hint--hover">
        {{ services[hovered].label }} &mdash; {{ podCounts[hovered] }} pods &nbsp;·&nbsp; dblclick to burst-scale
      </div>
      <div v-else class="k8s-hint">Click a deployment to inspect &mdash; click its pods to drain</div>
    </div>

    <vuetrex height="75vh" :camera="camera"  @ready="onStageReady">
      <layer>
        <!-- API Gateway -->
        <row>
          <stack>
            <box name="api-gw" text="api-gateway" size="1.8"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <layer :elevation="0.25">
              <ring size="0.8">
                <wedge
                  v-for="i in podCounts['api-gw']"
                  :key="'api-gw-pod-' + i"
                  :name="'api-gw-pod-' + i"
                  text="" height="0.75" size="1.5"
                  @click="onPodClick"
                  @pointerenter="onPodHoverIn"
                  @pointerleave="onPodHoverOut"
                />
              </ring>
            </layer>

          </stack>
        </row>

        <!-- Microservices -->
        <row>
          <stack>
            <box name="auth-svc" text="auth-svc" connection="api-gw"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <cylinder
              v-for="i in podCounts['auth-svc']"
              :key="'auth-svc-pod-' + i"
              :name="'auth-svc-pod-' + i"
              text="" height="0.22" size="0.85"
              @click="onPodClick"
              @pointerenter="onPodHoverIn"
              @pointerleave="onPodHoverOut"
            />
          </stack>
          <stack>
            <box name="product-svc" text="product-svc" connection="api-gw"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <cylinder
              v-for="i in podCounts['product-svc']"
              :key="'product-svc-pod-' + i"
              :name="'product-svc-pod-' + i"
              text="" height="0.22" size="0.85"
              @click="onPodClick"
              @pointerenter="onPodHoverIn"
              @pointerleave="onPodHoverOut"
            />
          </stack>
          <stack>
            <box name="order-svc" text="order-svc" connection="api-gw"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <cylinder
              v-for="i in podCounts['order-svc']"
              :key="'order-svc-pod-' + i"
              :name="'order-svc-pod-' + i"
              text="" height="0.22" size="0.85"
              @click="onPodClick"
              @pointerenter="onPodHoverIn"
              @pointerleave="onPodHoverOut"
            />
          </stack>
        </row>

        <!-- Data layer -->
        <row>
          <stack>
            <box name="mongo" text="MongoDB" size="1.4" connection="product-svc"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <cylinder
              v-for="i in podCounts['mongo']"
              :key="'mongo-pod-' + i"
              :name="'mongo-pod-' + i"
              text="" height="0.22" size="0.75"
              @click="onPodClick"
              @pointerenter="onPodHoverIn"
              @pointerleave="onPodHoverOut"
            />
          </stack>
          <stack>
            <box name="redis" text="Redis" size="1.4" connection="order-svc"
              @click="onDeployClick"
              @dblclick="onDeployBurst"
              @pointerenter="onDeployHoverIn"
              @pointerleave="onDeployHoverOut"
            />
            <cylinder
              v-for="i in podCounts['redis']"
              :key="'redis-pod-' + i"
              :name="'redis-pod-' + i"
              text="" height="0.22" size="0.75"
              @click="onPodClick"
              @pointerenter="onPodHoverIn"
              @pointerleave="onPodHoverOut"
            />
          </stack>
        </row>

      </layer>
    </vuetrex>
  </div>
</template>

<script lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { Vuetrex, VxSettings, VxStage, VxMouseEvent } from '@/lib-components/index.js'
import gsap from 'gsap'

export default {
  components: { Vuetrex },

  setup() {
    const camera = ref('scene')
    const selected = ref<string | null>(null)
    const hovered = ref<string | null>(null)
    let stage: any = null

    const services: Record<string, { label: string }> = {
      'api-gw':      { label: 'api-gateway' },
      'auth-svc':    { label: 'auth-svc' },
      'product-svc': { label: 'product-svc' },
      'order-svc':   { label: 'order-svc' },
      'mongo':       { label: 'MongoDB' },
      'redis':       { label: 'Redis' },
    }

    const podCounts = reactive<Record<string, number>>({
      'api-gw':      3,
      'auth-svc':    2,
      'product-svc': 2,
      'order-svc':   1,
      'mongo':       1,
      'redis':       1,
    })

    function getPodMesh(svc: string, idx: number) {
      return stage?.getById(`${svc}-pod-${idx}`)?.mesh ?? null
    }

    function getDeployMesh(svc: string) {
      return stage?.getById(svc)?.mesh ?? null
    }

    // Gentle upward lift — pods rise a small amount and settle back smoothly.
    function liftPods(svc: string, baseDelay = 0) {
      const count = podCounts[svc]
      for (let i = 1; i <= count; i++) {
        const mesh = getPodMesh(svc, i)
        if (!mesh) continue
        const origY = mesh.position.y
        gsap.timeline({ delay: baseDelay + (i - 1) * 0.1 })
          .to(mesh.position, { duration: 0.45, y: origY + 0.13, ease: 'sine.out' })
          .to(mesh.position, { duration: 0.55, y: origY, ease: 'sine.inOut' })
      }
    }

    // Subtle scale accent — used for both selection and restart feedback.
    function accentBox(svc: string) {
      const mesh = getDeployMesh(svc)
      if (!mesh) return
      gsap.timeline()
        .to(mesh.scale, { duration: 0.35, x: 1.07, z: 1.07, ease: 'sine.out' })
        .to(mesh.scale, { duration: 0.5, x: 1.0, z: 1.0, ease: 'sine.inOut' })
    }

    // New pod slides in from slightly above with a clean power ease — no bounce.
    function podEntranceAnim(svc: string, podIdx: number) {
      nextTick(() => {
        const mesh = getPodMesh(svc, podIdx)
        if (!mesh) return
        const finalY = mesh.position.y
        mesh.position.y = finalY + 0.4
        mesh.scale.set(0.05, 0.05, 0.05)
        gsap.timeline()
          .to(mesh.position, { duration: 0.55, y: finalY, ease: 'power2.out' })
          .to(mesh.scale, { duration: 0.5, x: 1, y: 1, z: 1, ease: 'power2.out' }, '<')
      })
    }

    // Pod shrinks and drops away quietly.
    function podExitAnim(svc: string, podIdx: number, onDone: () => void) {
      const mesh = getPodMesh(svc, podIdx)
      if (!mesh) { onDone(); return }
      gsap.timeline({ onComplete: onDone })
        .to(mesh.scale, { duration: 0.4, x: 0.05, y: 0.05, z: 0.05, ease: 'power2.inOut' })
        .to(mesh.position, { duration: 0.4, y: mesh.position.y - 0.2, ease: 'power2.inOut' }, '<')
    }

    // Double-click: burst-scale — add 2 pods in rapid succession (fast deploy surge)
    function onDeployBurst(ev: VxMouseEvent) {
      const svc = ev.vxNode.name
      if (!services[svc]) return
      const burst = Math.min(2, 8 - podCounts[svc])
      if (burst <= 0) return
      for (let i = 0; i < burst; i++) {
        gsap.delayedCall(i * 0.18, () => {
          podCounts[svc]++
          podEntranceAnim(svc, podCounts[svc])
        })
      }
    }

    // pointerenter on deployment: health ping — pods pulse to signal liveness, HUD previews the service
    function onDeployHoverIn(ev: VxMouseEvent) {
      const svc = ev.vxNode.name
      if (!services[svc] || selected.value) return
      hovered.value = svc
      //liftPods(svc)
    }

    // pointerleave on deployment: dismiss hover preview
    function onDeployHoverOut(ev: VxMouseEvent) {
      if (!selected.value) hovered.value = null
    }

    // pointerenter on pod: scale up to signal "this would be drained on click"
    function onPodHoverIn(ev: VxMouseEvent) {
      const mesh = stage?.getById(ev.vxNode.name)?.mesh
      if (!mesh) return
      gsap.to(mesh.scale, { duration: 0.18, x: 1.18, y: 1.18, z: 1.18, ease: 'sine.out' })
    }

    // pointerleave on pod: restore normal scale
    function onPodHoverOut(ev: VxMouseEvent) {
      const mesh = stage?.getById(ev.vxNode.name)?.mesh
      if (!mesh) return
      gsap.to(mesh.scale, { duration: 0.22, x: 1, y: 1, z: 1, ease: 'sine.inOut' })
    }

    function onDeployClick(ev: VxMouseEvent) {
      const svc = ev.vxNode.name
      if (!services[svc]) return

      if (selected.value === svc) {
        // Second click: rolling restart — cascade on API GW, self-restart otherwise
        if (svc === 'api-gw') {
          ;['auth-svc', 'product-svc', 'order-svc'].forEach((s, i) => {
            gsap.delayedCall(i * 0.5, () => {
              accentBox(s)
              liftPods(s)
            })
          })
        } else {
          accentBox(svc)
          liftPods(svc)
        }
      } else {
        selected.value = svc
        hovered.value = null
        camera.value = svc
        accentBox(svc)
        liftPods(svc)
      }
    }

    function onPodClick(ev: VxMouseEvent) {
      const match = ev.vxNode.name.match(/^(.+)-pod-\d+$/)
      if (!match) return
      const svc = match[1]
      if (!podCounts[svc] || podCounts[svc] <= 1) return

      // Always drain the topmost pod for a clean visual
      const topIdx = podCounts[svc]
      podExitAnim(svc, topIdx, () => {
        podCounts[svc]--
      })
    }

    function triggerScaleUp() {
      const svc = selected.value
      if (!svc || podCounts[svc] >= 8) return
      podCounts[svc]++
      podEntranceAnim(svc, podCounts[svc])
    }

    function triggerScaleDown() {
      const svc = selected.value
      if (!svc || podCounts[svc] <= 1) return
      const topIdx = podCounts[svc]
      podExitAnim(svc, topIdx, () => { podCounts[svc]-- })
    }

    function triggerRestart() {
      if (!selected.value) return
      accentBox(selected.value)
      liftPods(selected.value)
    }

    function deselectAll() {
      selected.value = null
      hovered.value = null
      camera.value = 'scene'
    }

    // const vsSettings: VxSettings = {
    //   color:          0x1e3a5f,
    //   highlightColor: 0x3fa8ff,
    //   floorColor:     0x0a1628,
    //   captionColor:   0x7fc4ff,
    //   particleColor:  0x3fa8ff,
    //   lightColor1:    0x5599ff,
    //   lightColor2:    0xffffff,
    //   mirrorOpacity:  0.82,
    //   particleSpread: 0.025,
    //   particleVolume: 8,
    //   unit:           1.3,
    //   distance:       1.6,
    // }

    function onStageReady(s: VxStage) {
      stage = s
      // Add cross-cutting connections once all meshes have been placed
      setTimeout(() => {
        const connect = (a: string, b: string) => {
          const e1 = (stage as any).getById(a)
          const e2 = (stage as any).getById(b)
          if (e1 && e2) (stage as any).connect(e1, e2)
        }
        connect('auth-svc',  'mongo')
        connect('order-svc', 'mongo')
        connect('auth-svc',  'redis')
      }, 600)
    }

    return {
      camera, selected, hovered, services, podCounts,
      onDeployClick, onDeployBurst, onDeployHoverIn, onDeployHoverOut,
      onPodClick, onPodHoverIn, onPodHoverOut,
      triggerScaleUp, triggerScaleDown, triggerRestart, deselectAll,
      onStageReady,
    }
  }
}
</script>

<style scoped>
.k8s-root {
  position:relative;
}

.k8s-hud {
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 10;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  pointer-events: none;
}

.k8s-panel {
  background: rgba(8, 16, 32, 0.92);
  border: 1px solid rgba(63, 168, 255, 0.3);
  border-radius: 6px;
  padding: 10px 16px;
  color: #7fc4ff;
  pointer-events: all;
  min-width: 300px;
  box-shadow: 0 0 24px rgba(63, 168, 255, 0.12);
}

.k8s-title {
  font-size: 15px;
  font-weight: bold;
  color: #a8d8ff;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}

.k8s-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  font-size: 12px;
  opacity: 0.65;
}

.k8s-actions {
  display: flex;
  gap: 8px;
}

.k8s-actions button {
  background: rgba(63, 168, 255, 0.1);
  border: 1px solid rgba(63, 168, 255, 0.4);
  color: #7fc4ff;
  border-radius: 4px;
  padding: 3px 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: background 0.2s;
}

.k8s-actions button:hover {
  background: rgba(63, 168, 255, 0.25);
}

.k8s-close {
  margin-left: auto;
  background: rgba(255, 80, 80, 0.08) !important;
  border-color: rgba(255, 80, 80, 0.4) !important;
  color: #ff8080 !important;
}

.k8s-hint {
  color: rgba(168, 213, 255, 0.53);
  font-size: 12px;
  padding: 4px 0;
}

.k8s-hint--hover {
  color: rgba(63, 168, 255, 0.7);
}
</style>
