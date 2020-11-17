import { createRendererForStage } from "./renderer";
import {
    defineComponent,
    Fragment,
    //watchEffect,
    h,
    onMounted,
    Ref,
    ref,
    getCurrentInstance,
    RootRenderFunction,
} from "@vue/runtime-core";
import Stage from "../three/stage";
import { Root } from "./nodes/Root";
import { nextTick } from "vue";

export type VuetrexStage = Stage; //& {helpers: AnyHelpers}

export default defineComponent({
    name: "Vuetrex",
    props: {
        settings: { type: Object },
        position: { type: String, default: "static" },
    },
    setup(props, context) {
        const elRef: Ref<HTMLDivElement | undefined> = ref();

        const maxWidth = ref(4096);
        const maxHeight = ref(4096);

        const vuetrexComponent = getCurrentInstance()!;

        onMounted(() => {
            let vuetrexRenderer: RootRenderFunction;
            let stage: VuetrexStage;
            let stageRoot: Root;

            if (elRef.value) {
                stage = new Stage(elRef.value, { ...props.settings }) as VuetrexStage;

                //stage.eventHelpers = setupEvents(props.settings?.eventsTarget || elRef.value, stage);

                vuetrexRenderer = createRendererForStage(stage);
                stageRoot = new Root(stage);

                //create stage environment
                stage.mount();
                //start animation
                stage.start();

                // Auto-inherit dimensions.
                //stageRoot["func-w"] = (w: number) => w;
                //stageRoot["func-h"] = (w: number, h: number) => h;

                // Keep correct aspect-ratio issues when the page is zoomed out.
                //const maxTextureSize = stage.getMaxTextureSize();
                //maxWidth.value = maxTextureSize / stage.pixelRatio;
                //maxHeight.value = maxTextureSize / stage.pixelRatio;
            }

            const defaultSlot = context.slots.default;
            if (defaultSlot) {
                // We must wait until nextTick to prevent interference in the effect queue.
                nextTick().then(() => {
                    const node = h(Connector, defaultSlot);
                    vuetrexRenderer(node, stageRoot);
                });
            } else {
                console.warn("No default slot is defined");
            }
        });

        /**
         * Since vuetrex uses its own renderer, the ancestor vue's appContext, root and provides would normally be lost in
         * the vuetrex components.
         *
         * We can fix this by overriding the component's parent, root, appContext and provides before rendering the slot
         * contents.
         */
        const Connector = defineComponent({
            setup(props, setupContext) {
                const instance = getCurrentInstance()!;

                // @see runtime-core createComponentInstance
                instance.parent = vuetrexComponent;
                instance.appContext = vuetrexComponent.appContext;
                instance.root = vuetrexComponent.root;
                (instance as any).provides = (vuetrexComponent as any).provides;

                const defaultSlot = setupContext.slots.default!;
                return () => h(Fragment, defaultSlot());
            },
        });

        // We need to use a wrapper for flexible size layouting to work with tree2d pixelRatio canvas auto-resizing.
        return () =>
            h(
                "div",
                {
                    class: "custom-renderer-wrapper",
                    style: { position: props.position,
                        height:'50vw',
                        maxWidth: maxWidth.value,
                        maxHeight: maxHeight.value },
                    ref: elRef
                }
            );
    },
});