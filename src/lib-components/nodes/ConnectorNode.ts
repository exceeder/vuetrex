import { Node } from '@/lib-components/nodes/Node.js'
import { VuetrexStage } from '@/lib-components/three/stage.js'
import { watchEffect, WatchStopHandle, reactive } from 'vue'

export class ConnectorNode extends Node {
    public readonly type: string = 'Connector'

    public state: { from: string, to: string, text: string, type: string, layout: string } = reactive({
        from: '',
        to: '',
        text: '',
        type: 'particles',
        layout: 'orthogonal'
    })

    private stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage) {
        super(stage)
    }

    isRenderableNode(): boolean {
        return true
    }

    syncWithThree() {
        if (this.stopHandle) return
        this.stopHandle = watchEffect(() => {
            const { from, to, layout, type } = this.state
            if (from && to) {
                    this.stage.connect(from, to, layout, type)
            }
        })
    }

    onRemoved() {
        if (this.stopHandle) {
            this.stopHandle()
        }
        const { from, to } = this.state

        if (from && to) {
            // connectors in VuetrexStage might need more explicit removal if they aren't THREE.Objects
            // But stage.connect handles it for now.
            this.stage.disconnect(this.stage.getById(from), this.stage.getById(to));
        }
    }

    subscribeEvents() {}
}
