import * as THREE from "three";
import {Reflector} from "three/examples/jsm/objects/Reflector";
import Scene from "@/lib-components/three/scene";
import Element3d from "@/lib-components/three/element3d";
import {RoundedBoxBufferGeometry} from "three/examples/jsm/geometries/RoundedBoxBufferGeometry";

const R = 1.3; //box radius
const D = 1.5; //box distance

/**
 * Stage keeps top-level structures to draw the tree of runtime nodes.
 * It replaces browser's drawing of DOM elements.
 */
export default class VuetrexStage extends Scene {
    public root: Element3d | null = null;
    private subscribers: Function[];

    constructor(domParent: HTMLElement, settings:any) {
        super(domParent);
        this.subscribers = [];
    }

    mount() {
        const scene = this.scene;
        this.createGroundMirror(scene);
        this.createFloor(scene);
        this.createLights(scene);

        this.onAnimate(this.animateCamera());
        this.onAnimate(this.animateMouse());
    }

    register(el: Element3d) {

    }

    getById(id: string) {
        //TODO
        console.log("GetById()",id)
        return this.root;
    }

    onHighlight(fn: Function) {
        this.subscribers.push(fn);
    }

    createGroundMirror(scene: THREE.Scene) {
        const geometry = new THREE.PlaneBufferGeometry(100, 100);
        const groundMirror = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: this.width * window.devicePixelRatio,
            textureHeight: this.height * window.devicePixelRatio,
            color: new THREE.Color(0x777777)
        });
        groundMirror.rotateX(-Math.PI / 2);
        groundMirror.position.y = -0.49;
        groundMirror.receiveShadow = false;
        scene.add(groundMirror);
    }

    createFloor(scene: THREE.Scene) {
        const planeSize = 512;
        let material = new THREE.MeshBasicMaterial({opacity: 1.0, transparent: true});
        let plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeSize, planeSize),
            material
        );
        plane.rotation.x = -Math.PI / 2.0;
        plane.position.y = -0.5;
        scene.add(plane);
    }

    createLights(scene: THREE.Scene) {
        let light = new THREE.PointLight(0xbbbbff, 0.8);
        light.position.set(-10, 30, 10);
        light.castShadow = false;
        scene.add(light);

        let light2 = new THREE.SpotLight(0xffffff, 0.7);
        light2.position.set(1, 30, 15);
        scene.add(light2);

        let light3 = new THREE.PointLight(0xbbbbff, 0.1);
        light3.position.set(10, 30, 10);
        scene.add(light3);

        let light4 = new THREE.AmbientLight(0xffffff, 0.1);
        light3.position.y = 10;
        scene.add(light4);
    }

    createElementMaterial() {
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.3;
        bMaterial.metalness = 0.1;
        bMaterial.color.set(this.colorMain);
        return bMaterial;
    }

    removeObject(el: Element3d) {
        if (el.mesh) {
            this.scene.remove(el.mesh);
            el.mesh = null;
        }
    }

    positionLayoutElement(el: THREE.Mesh, j: number, i: number, NBoxes: number, NLayers: number) {
        //in WebGL, positive X to the right, Y to the top, Z to the back
        el.position.x = (-NLayers * (R + D)) / 2 + (R + D) * i + (R + D) / 2;
        el.position.y = 0.0;
        el.position.z = (-NBoxes * (R + D)) / 2 + (R + D) * j + (R + D) / 2;
    }

    meshCreator(type: string): (size:number) => THREE.Mesh {
        switch (type) {
            case 'cylinder': {
                return size => {
                    let bMaterial = this.createElementMaterial();
                    return new THREE.Mesh(
                        new THREE.CylinderGeometry(size / 2, R / 2, R / 2, 32),
                        bMaterial
                    );
                }
            }
            case 'rbox': {
                return size => {
                    const bMaterial = this.createElementMaterial();
                    return new THREE.Mesh(new RoundedBoxBufferGeometry(R, R / 2, R,  5, .1), bMaterial);
                }

            }
            default:
            case 'box': {
                return size => {
                    const bMaterial = this.createElementMaterial();
                    return new THREE.Mesh(new THREE.BoxGeometry(R*0.9, R / 2, size), bMaterial);
                }
            }
        }
    }

    renderMesh(el: Element3d, size: number = R, gen: (size:number) => THREE.Mesh) {
        const node = el.node;

        const j = node.getIdx();
        const i = node.parent?.getIdx() || 0;
        const cols = node.parent?.renderSize() || 1;
        const rows = node.parent?.parent?.renderSize() || 1;

        console.log("render [",node.name,"] ",
            `rows:${rows}`,
            `cols:${cols}`,
            `rowIdx:${i}`,
            `boxIdx:${j}`);

        const scene = this.scene;

        if (el.mesh !== null) {
            this.positionLayoutElement(el.mesh, j, i, cols, rows);
            return;
        }

        const mesh = gen(size);
        mesh.name = "el-" + name;
        mesh.castShadow = true;
        this.positionLayoutElement(mesh, j, i, cols, rows);

        scene.add(mesh);
        el.mesh = mesh;
    }

    // --- events ---

    onCanvasClick(event: MouseEvent) {
        event.preventDefault();
        //display info below
        if (this.selectedObject) {
            this.selectedObject.dispatchEvent({type:'click', originalEvent: event})
            this.onShowAnnotation(this.selectedObject);
        }

    }

    onShowAnnotation(mesh: THREE.Mesh) {
        if (!mesh) return;

        const vector = this.toScreenPosition(mesh, this.camera);
        this.subscribers.forEach(fn => fn(mesh.name, vector));
    }

    render() {
        super.render();
    }
}
