import * as THREE from "three";
import Scene from "./scene";
import {Geometry, Material, Object3D} from "three";
import Element3d from "./element3d";

const R = 1.3; //box radius
const D = 1.5; //box distance

export default class Stage extends Scene {
    public root: Element3d | null = null;
    private layout: THREE.Mesh<Geometry,Material>[][];
    private subscribers: Function[];
    private labelObject: THREE.Mesh | undefined

    constructor(domParent: HTMLElement, settings:any) {
        super(domParent);
        console.log("Settings: "+JSON.stringify(settings))
        this.layout = [];
        this.subscribers = [];
        console.log("Stage Created");
    }

    mount() {
        const scene = this.scene;
        this.createFloor(scene);
        this.createLights(scene);

        this.onAnimate(this.animateCamera());
        this.onAnimate(this.animateMouse());
    }

    getById(id: string) {
        //TODO
        console.log("GetById()",id)
        return this.root;
    }

    onHighlight(fn: Function) {
        this.subscribers.push(fn);
    }

    createFloor(scene: THREE.Scene) {
        const planeSize = 512;

        let material = new THREE.MeshBasicMaterial({
            opacity: 1.0,
            transparent: true
        });

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

    adjustRow(i: number, NBoxes:  number) {
        if (i < this.layout.length && NBoxes !== this.layout[i].length) {
            //remove extras
            while (NBoxes < this.layout[i].length) {
                const toRemove = <Object3D>this.layout[i].pop();
                this.scene.remove(toRemove);
            }
            //rcalculate remaining
            this.layout[i].forEach((box: THREE.Mesh, j: number) => {
                box.position.z = (-NBoxes * (R + D)) / 2 + (R + D) * j + (R + D) / 2;
            });
        }
    }

    ensureLayout(i: number, NBoxes: number, NLayers: number) {
        const scene = this.scene;
        while (this.layout.length > NLayers + 1) {
            let arr = this.layout.pop();
            if (arr) {
                arr.forEach(m => scene.remove(m))
            }
        }
        while (this.layout.length <= NLayers) {
            this.layout.push([]);
        }

        while (this.layout[i] && this.layout[i].length > NBoxes) {
            const toRemove = <Object3D>this.layout[i].pop();
            scene.remove(toRemove);
        }
    }

    createElementMaterial() {
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.3;
        bMaterial.metalness = 0.1;
        bMaterial.color.setHSL(0.0, 0.0, 0.3);
        return bMaterial;
    }

    positionLayoutElement(el: THREE.Mesh, j: number, i: number, NBoxes: number, NLayers: number) {
        //in WebGL, positive X to the right, Y to the top, Z to the back
        el.position.x = (-NLayers * (R + D)) / 2 + (R + D) * i + (R + D) / 2;
        el.position.y = 0.0;
        el.position.z = (-NBoxes * (R + D)) / 2 + (R + D) * j + (R + D) / 2;
        if (i === 0 && j === 0) {
            this.labelObject = el;
        }
    }

    renderBox(j: number, i: number, NBoxes: number, NLayers: number, name: string, size = R) {
        const scene = this.scene;
        const old = scene.getObjectByName("el-" + name);
        if (old) {
            this.positionLayoutElement(old as THREE.Mesh, j, i, NBoxes, NLayers);
            return old;
        }
        this.ensureLayout(i, NBoxes, NLayers);
        const bMaterial = this.createElementMaterial();

        let box = new THREE.Mesh(new THREE.BoxGeometry(R*0.9, R / 2, size), bMaterial);
        box.name = "el-" + name;
        this.positionLayoutElement(box, j, i, NBoxes, NLayers);
        box.castShadow = true;
        this.layout[i].push(box);
        scene.add(box);
        console.log("Scene total now:"+scene.children.length)
        return box;
    }

    renderCylinder(j: number, i: number, NBoxes: number, NLayers: number, name: string, size = R) {
        const scene = this.scene;

        const old = scene.getObjectByName("el-" + name);
        if (old) {
            return old;
        }

        this.ensureLayout(i, NBoxes, NLayers);
        let bMaterial = this.createElementMaterial();

        let cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(size / 2, R / 2, R / 2, 32),
            bMaterial
        );
        cyl.name = "el-" + name;
        this.positionLayoutElement(cyl, j, i, NBoxes, NLayers);
        cyl.castShadow = true;

        this.layout[i].push(cyl);
        scene.add(cyl);
        return cyl;
    }

    // --- events ---

    onCanvasClick(event: MouseEvent) {
        event.preventDefault();
        //display info beloa
        if (this.selectedObject) {
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
