import { createRendererForStage } from "@/lib-components/renderer";
import { defineComponent, Fragment, getCurrentInstance, nextTick, h, onMounted, ref, PropType, watch } from "vue";
import { Root } from "@/lib-components/nodes/Root";
import { VuetrexStage, VxStage as _VxStage, VxSettings as _VxSettings } from "@/lib-components/three/stage";

export type VxStage = _VxStage;
export type VxSettings = _VxSettings;

/**
 * Vuetrex is a container that wraps everything in 3D scene.
 * It uses Vue Custom Renderer to provide reactivity.
 * @vue-prop settings {VxSettings} - vuetrex settings (TBD)
 * @vue-prop position {String} - container div CSS position, static: absolute, relative
 * @vue-prop play {String} - whether to animate the scene from the start, "false" keeps it still until changed
 */
export default defineComponent({
    name: "Vuetrex",
    props: {
        settings: { type: Object as PropType<VxSettings>, default: {} },
        position: { type: String, default: "static" },
        height: { type: String, default: "50vh" },
        width: { type: String, default: "100%" },
        stopped: { type: Boolean, default: false },
        camera: {type: String, default: "scene"},
        items: {
            type: Array,
            default: () => ([])
        }
    },
    emits: {
        ready: null
    },
    setup(props, {slots, emit}) {
        const elRef = ref(undefined);

        const maxWidth = ref(4096);
        const maxHeight = ref(4096);

        const vuetrexComponent = getCurrentInstance();
        if (vuetrexComponent == null) {
            const err = "Vue's getCurrentInstance() returned null in Vuetrex setup(). It likely means" +
            " your app is misconfigured";
            console.error(err)
            return () => h("div",err);
        }

        /**
         * Since Vuetrex uses its own renderer, Vue's `appContext`, `root` and `provides` would normally be lost in
         * the Vuetrex components.
         *
         * We can fix this by overriding the component's parent, root, appContext and provides before rendering the slot
         * contents.
         */
        const Connector = defineComponent({
            setup(props, setupContext) {
                const instance = getCurrentInstance();
                if (instance != null) {
                    // @see runtime-core createComponentInstance
                    instance.parent = vuetrexComponent;
                    instance.appContext = vuetrexComponent.appContext;
                    instance.root = vuetrexComponent.root;
                    (instance as any).provides = (vuetrexComponent as any).provides;
                } else {
                    console.error("Vue's getCurrentInstance() returned null in Connector component. It likely means" +
                        " your app is misconfigured")
                }
                const defaultSlot = setupContext.slots.default!;
                return () => h(Fragment, defaultSlot());
            },
        });

        onMounted(() => {
            const defaultSlot = slots.default;
            if (defaultSlot && elRef.value) {
                const stage = new VuetrexStage(elRef.value as any, { ...props.settings }) as VuetrexStage;
                const vuetrexRenderer = createRendererForStage(stage);
                const stageRoot = new Root(stage);
                //create stage environment
                stage.mount();
                emit('ready', stage);
                //start animation
                if (!props.stopped) {
                    stage?.start();
                }
                watch(() => props.stopped,
                    (stopped) => {
                        if (stopped) stage.pause(); else stage.unpause();
                    })

                watch(() => props.camera, (camera: string) => stage.sendCameraTo(camera))

                // We must wait until nextTick to prevent interference in the effect queue.
                nextTick().then(() => {
                    const node = h(Connector, defaultSlot);
                    vuetrexRenderer(node, stageRoot);
                });
            } else {
                console.warn("No default slot is defined");
            }
        });

        // We need to use a wrapper for flexible size layouting to work with pixelRatio canvas auto-resizing.
        return () =>
            h(
                "div",
                {
                    class: "custom-renderer-wrapper",
                    style: { position: props.position,
                        height: props.height,
                        width: props.width,
                        maxWidth: maxWidth.value,
                        maxHeight: maxHeight.value },
                    ref: elRef
                }
            );
    },
});