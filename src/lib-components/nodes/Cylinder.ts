import {Node} from '@/lib-components/nodes/Node';
import Element3d from "@/lib-components/three/element3d";
import {VuetrexStage} from "@/lib-components/three/stage";
import {nextTick, reactive, watchEffect, WatchStopHandle} from "vue";
import * as THREE from "three";


export class Cylinder extends Node {

    public state : {text: string, height:number, size: number, connection: string | null} = reactive({
        text: '',
        size: 1.0,
        height: 0.33,
        connection : null
    })

    stopHandle?: WatchStopHandle

    constructor(stage: VuetrexStage, base?: Element3d) {
        super(stage);
    }

    setHeight(height: number) {
        this.state.height = height;
    }

    setSize(size: number) {
        this.state.size = size;
    }

    cylindricalSleeveSegment(size: number, N:number, { r = 0.5, R = 0.55} = {}): THREE.BufferGeometry {
        const theta = Math.PI * 2 / N - Math.PI*2/30; // 1/N circle
        const rr = size*r, RR = size*R;
        const shape = new THREE.Shape();
        shape.moveTo(rr, 0);
        // outer arc
        shape.absarc(0, 0, RR, 0, theta, false);
        // radial edge
        shape.lineTo(rr * Math.cos(theta), rr * Math.sin(theta));
        // inner arc (reverse)
        shape.absarc(0, 0, rr, theta, 0, true);
        shape.closePath();
        const extrudeSettings = {
            steps: 1,
            depth: this.stage.boxRadius/5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        return geometry;
    }

    beveledCylinder(size: number): THREE.BufferGeometry {
        const width = size/2.5 || 1.0;
        const r = width;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.absarc(0,0, width, 0, Math.PI/2, false);
        shape.absarc(0,0, width, Math.PI/2, Math.PI, false);
        shape.absarc(0,0, width, Math.PI, Math.PI*3/2, false);
        shape.absarc(0,0, width, Math.PI*3/2, Math.PI*1.999, false);
        shape.closePath();

        const extrudeSettings = {
            steps: 1,
            depth: this.stage.boxRadius/5,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.07,
            bevelOffset: 0,
            bevelSegments: 5
        };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }


    modelGen(): (height:number, size:number) => THREE.Object3D {
        return (height, size) => {
            let bMaterial = this.stage.createElementMaterial();
            if (size < 1.5) {
                const geometry = this.beveledCylinder(size);
                geometry.rotateX(Math.PI / 2)
                geometry.translate(0, 0.19, 0)
                return new THREE.Mesh(geometry, bMaterial)
            } else {
                const group = new THREE.Group();
                const N = 8;
                for (let i = 0; i < N; i++) {
                    const geometry = this.cylindricalSleeveSegment(size, N + 5);
                    geometry.rotateX(Math.PI / 2)
                    geometry.rotateY(2 * Math.PI / N * i)
                    geometry.translate(0, 0.19, 0)
                    group.add(new THREE.Mesh(geometry, bMaterial));
                }
                return group;
            }
        };
    }



    syncWithThree() {
        if (this.stopHandle) return;
        this.stopHandle = watchEffect(() => {
            //console.log(` >cyl weffect ${this.name} myIdx: ${this.myIdx.value} cols:${this.numColumns.value} rows:${this.numRows.value}`)
            if (this.myIdx.value >= 0) {
                this.stage.renderMesh(this.element, this.state.height, this.state.size, this.modelGen());
            }

            if (this.state.connection) {
                nextTick(() => {  //todo fixme, there should be a better way!
                    const otherEnd = this.stage.getById(this.state.connection || "");
                    if (this.element && otherEnd) {
                        this.stage.connect(this.element, otherEnd)
                    } else {
                        console.warn("Invalid connection from " + this.name + " to " + this.state.connection)
                    }
                }).catch(r => console.log(r));
            }
        },{flush: 'sync'})
    }

    onRemoved() {
        if (this.element) {
            if (this.stopHandle) {
                this.stopHandle();
                this.stopHandle = undefined;
            }
            if (this.subscribed) {
                // @ts-ignore //TODO THREE.EventDispatcher allows to dispatch custom events, but TS limits it
                this.element.mesh?.removeEventListener(Node.CLICK, this.clickListener)
            }
            this.stage.removeObject(this.element)
        }
        this.state.connection = null;
    }

}
