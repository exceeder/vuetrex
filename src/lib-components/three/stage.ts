import * as THREE from "three";
import * as THREEx from "@/lib-components/three/three.imports";
import Scene from "@/lib-components/three/scene";
import Element3d from "@/lib-components/three/element3d";
import {Node} from "@/lib-components/nodes/Node";
import {Connectors} from "@/lib-components/three/connectors";

//import gsap from 'gsap';

export interface VxStage {
    getScene(): THREE.Scene
    onEachFrame(fn: (time: number, tick:number) => void): void
}

export interface VxSettings {
    color?: number
    mirrorOpacity?: number
    floorColor?: number
    highlightColor?: number
    particleColor?: number
    captionColor?: number

    lightColor1?: number
    lightColor2?: number
    lightColor3?: number

    particleSpread?: number
    particleVolume?: number
    particleBlending?: THREE.Blending

    unit?: number
    distance?: number
}

export interface VxMouseEvent extends MouseEvent {
    vxNode: Node;
    vxPosition: any;
}

interface EvType {
    type: string
    originalEvent: MouseEvent
}

let R = 1.3; //box radius
let D = 1.5; //box distance

/**
 * Stage is a top level container of Vue-connected nodes. It literally sets the stage for everything happening in 3D.
 *
 * By using Vue's Custom Renderer interface (NodeOps) it replaces browser's drawing of DOM elements with updating
 * ThreeJS scene.
 */
export class VuetrexStage extends Scene implements VxStage {
    public root: Element3d | null = null;
    private subscribers: Function[];
    private connectors: Connectors |  null = null;
    settings: VxSettings
    private caps: { repeats: number; size: number; planeSize: number; updateFn: () => void; texture: THREEx.DynamicTexture | null } = {
        planeSize: 256,
        size: 2048,
        repeats: 17,
        texture: null,
        updateFn: () => {}
    }
    private captions: Array<{x:number, y:number, text:string}> = []

    constructor(domParent: HTMLElement, settings:VxSettings) {
        super(domParent)
        this.subscribers = []
        this.settings = settings

        R = settings.unit || R
        D = settings.distance || D
        this.colorMain = new THREE.Color(settings.color || 0x555555);
        this.colorHighlight = new THREE.Color(settings.highlightColor || 0x4c7fb2);
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    onEachFrame(fn: (time: number, tick:number) => void): void {
        // this.onAnimate(fn);
    }

    mount() {
        const scene = this.scene;
        this.createGroundMirror(scene);
        this.createFloor(scene);
        this.createLights(scene);

        //particle system
        this.connectors = new Connectors(this);

        //TODO
        //gsap.to(this.camera.position, {duration:2.1, x:0.2, y:1.75, z:2.5,  delay: 0.5});
        this.registerAnimation(this.cameraAnimationFn()); //push tween function to be called on each frame
        this.registerAnimation(this.mouseAnimationFn());
    }

    getById(id: string): Element3d {
        return (this.scene.getObjectByName('el-'+id) as THREE.Mesh)?.userData.el;
    }

    onHighlight(fn: Function) {
        this.subscribers.push(fn);
    }

    createGroundMirror(scene: THREE.Scene) {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const groundMirror = new THREEx.Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: this.width * window.devicePixelRatio * 2,
            textureHeight: this.height * window.devicePixelRatio * 2,
            color: new THREE.Color(this.settings.floorColor || 0x777777)
        });
        groundMirror.rotateX(-Math.PI / 2);
        groundMirror.position.y = -0.35;
        groundMirror.receiveShadow = false;
        scene.add(groundMirror);
    }

    createFloor(scene: THREE.Scene) {
        const caps = this.caps;
        const textureOffset = Math.floor(caps.repeats/2);
        //overlay plane
        const texture = new THREEx.DynamicTexture(caps.size, caps.size)
        caps.texture = texture
        texture.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        texture.texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.texture.generateMipmaps = true
        texture.texture.repeat.set(caps.repeats, caps.repeats)
        texture.texture.offset.set(-textureOffset, -textureOffset)

        this.repaintTitles(caps.planeSize)
        caps.updateFn = () => this.repaintTitles(caps.planeSize)

        let material = new THREE.MeshStandardMaterial({
            color: '#f0f0f0',
            roughness: 0.1,
            metalness: 0.5,
            opacity: 0.999,
            transparent: true,
            map: texture.texture
        });
        material.toneMapped = false;
        let plane = new THREE.Mesh(new THREE.PlaneGeometry(caps.planeSize, caps.planeSize), material);
        plane.rotation.x = -Math.PI / 2.0;
        plane.position.y = -0.3495;
        plane.castShadow = false;
        plane.receiveShadow = true;
        scene.add(plane);
    }

    repaintTitles(mirrorSize: number) {
        const caps = this.caps;
        const textureSize = caps.size;
        const textureRepeats = caps.repeats;
        const texture = caps.texture!;
        texture.clear(undefined)
        texture.clear('#' + ( this.settings.floorColor || 0x3f3f3f).toString(16) +
            Math.floor((this.settings.mirrorOpacity || 0.85)*256).toString(16) //opacity
        );

        texture.context.font = "bold "+Math.floor(textureSize/72)+"px Helvetica"
        const scale = textureSize / mirrorSize * textureRepeats;
        this.captions.forEach(c => {
            const w = texture.context.measureText(c.text).width

            const x = c.x * scale
            const y = c.y * scale
            texture.drawText(c.text, x + textureSize / 2 - w / 2, y + textureSize / 2 + R/4*scale,
                '#'+(this.settings.captionColor || 0xffffff).toString(16))
        })

        texture.fillStyle = '0x5070f0'
        texture.setGlobalAlpha(0.2)
        for (let i=0; i<20; i++) {
            texture.fillRect(100, 100 + 100*i, 1897, 2)
        }
        texture.setGlobalAlpha(0.1)
        for (let i=0; i<20; i++) {
            texture.fillRect(100 + 100*i, 100,2, 1897)
        }
        //texture.drawText("Bonjour", 110, 1980, '#eeffff')
        texture.setGlobalAlpha(1.0)


        // const size = 2048;
        // const stops = [0.75,0.6,0.4,0.25]
        // const colors = ['#1B1D1E','#3D4143','#72797D', '#b0babf'];
        //
        // const gradient = texture.createLinearGradient(0,0,0, size);
        // let i = stops.length;
        // while(i--){ gradient.addColorStop(stops[i], colors[i]); }
        // texture.fillStyle = gradient;
        // texture.fillRect(0,0,16, size);

    }

    createLights(scene: THREE.Scene) {
        const light = new THREE.SpotLight(this.settings.lightColor1 || 0xccccff, 5.5, 20, 25.5)

        light.position.set(5, 15, -5);
        light.target.position.set(0, -2, -2);
        light.castShadow = true;
        scene.add(light);

        const light2 = new THREE.DirectionalLight(this.settings.lightColor2 || 0xffffff, 5.5);
        light2.position.set(-7, 25, 13);
        light2.target.position.set( 0, 0, 0 );
        light2.castShadow = true;
        const d = 8;
        light2.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  0.5, 55);
        light2.shadow.radius = 10;
        light2.shadow.bias = -0.002;
        (light2.shadow as any).blurSamples = 16;
        light2.shadow.mapSize.width = light.shadow.mapSize.height = 1024;

        scene.add(light2);

        // let light3 = new THREE.PointLight(this.settings.lightColor1 || 0xbbbbff, 0.3);
        // light3.position.set(10, -10, 5);
        //const light3 = new THREE.HemisphereLight(0xffffff, 0x000000, 1.0);
        //light3.castShadow = true;
        //scene.add(light3);
        //
        // const light4 = new THREE.AmbientLight(this.settings.lightColor3 || 0xffffff, 0.3);
        // light4.position.y = 10;
        // scene.add(light4);
    }

    createElementMaterial() {
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.3;
        // bMaterial.transparent = true;
        // bMaterial.opacity = 0.3;
        bMaterial.metalness = 0.1;
        bMaterial.flatShading = false;
        bMaterial.color.set(this.colorMain);
        return bMaterial;
    }

    removeObject(el: Element3d) {
        if (el.mesh) {
            this.scene.remove(el.mesh);
            this.connectors?.remove(el);
            const c = el.mesh.userData.caption
            if (c) {
                this.captions.splice(this.captions.indexOf(c),1)
                this.caps.updateFn();
            }
            el.mesh = null;
        }
    }

    meshCreator(type: string): (height:number, size:number) => THREE.Mesh {
        switch (type) {
            case 'plane': {
                return (height, size) => {
                    let bMaterial = this.createElementMaterial();
                    bMaterial.transparent = true;
                    bMaterial.opacity = 0.75;
                    bMaterial.flatShading = true;
                    bMaterial.side = THREE.DoubleSide;
                    bMaterial.color.setRGB(255,255,255)
                    const result = new THREE.Mesh(
                        new THREE.PlaneGeometry(size, size, 2, 2),
                        bMaterial
                    );
                    result.rotateX(Math.PI/2)
                    return result;
                }
            }
            case 'cylinder': {
                return (height, size) => {
                    let bMaterial = this.createElementMaterial();
                    return new THREE.Mesh(
                        new THREE.CylinderGeometry(size / 2, size / 2 * 1.05, height, 32),
                        bMaterial
                    );
                }
            }
            case 'cylinder-shape': {
                return (height, size) => {
                    let bMaterial = this.createElementMaterial();
                    const width = size/2 || 1.0;
                    const r = width;

                    const shape = new THREE.Shape();
                    shape.moveTo(r, 0);
                    shape.absarc(0,0, width, 0, Math.PI/2, false);
                    shape.absarc(0,0, width, Math.PI/2, Math.PI, false);
                    shape.absarc(0,0, width, Math.PI, Math.PI*3/2, false);
                    shape.absarc(0,0, width, Math.PI*3/2, Math.PI*1.99, false);
                    shape.closePath();

                    const extrudeSettings = {
                        steps: 1,
                        depth: R/4,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.07,
                        bevelOffset: 0,
                        bevelSegments: 5
                    };

                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    geometry.rotateX(Math.PI/2)
                    geometry.translate(0,0.07,0)
                    return new THREE.Mesh(geometry, bMaterial);
                };
            }
            case 'rbox-shape': {
                return (height, size) => {
                    let bMaterial = this.createElementMaterial();
                    const width = size;
                    const length = R * 0.975;

                    const shape = new THREE.Shape();
                    shape.moveTo(-length/2, -width/2);
                    shape.lineTo(-length/2, width/2);
                    shape.lineTo(length/2, width/2);
                    shape.lineTo(length/2, -width/2);
                    shape.lineTo(-length/2, -width/2);

                    const extrudeSettings = {
                        steps: 2,
                        depth: R/2,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.05,
                        bevelOffset: 0,
                        bevelSegments: 5
                    };

                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    geometry.rotateX(Math.PI/2)
                    geometry.translate(0,R/4,0)
                    const mesh = new THREE.Mesh(geometry, bMaterial);
                    mesh.castShadow = true;
                    return mesh;
                }

            }
            case 'rbox': {
                return (height, size) => {
                    const bMaterial = this.createElementMaterial();
                    const bGeometry = new THREEx.RoundedBoxGeometry(size, height, size,  5, .05);
                    return new THREE.Mesh(bGeometry, bMaterial);
                }

            }
            default:
            case 'box': {
                return (height, size) => {
                    let bMaterial = this.createElementMaterial();
                    return new THREE.Mesh(new THREE.BoxGeometry(R*0.9, R / 2, size), bMaterial);
                }
            }
        }
    }

    addCaption(el: THREE.Mesh, size: number, caption: string) {
        const c = {
            x: el.position.x,
            y: el.position.z + size / 2.0,
            text: caption
        }
        this.captions.push(c);
        el.userData.caption = c;
        this.caps.updateFn();
        return c;
    }

    renderMesh(el: Element3d, height: number, size: number = R, gen: (height:number, size:number) => THREE.Mesh) {
        const scene = this.scene;

        if (el.mesh !== null) {
            el.mesh.position.copy(el.getPosition())
            // const m = gen(height, size);
            // el.mesh.geometry = m.geometry;
            this.connectors?.update(el);
            el.mesh.userData.caption.x = el.mesh.position.x
            el.mesh.userData.caption.y = el.mesh.position.z + size / 2.0
            el.mesh.userData.caption.text = el.getCaption()
            this.caps.updateFn();
            return;
        }

        const mesh = gen(height, size);
        const scale = el.node.getScale();
        mesh.scale.set(1/scale, 1/scale, 1/scale);
        mesh.geometry.translate(0,height/2,0)
        mesh.name = "el-" + el.node.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //todo this.tween(el, ...)
        mesh.position.copy(el.getPosition());
        mesh.userData.caption = this.addCaption(mesh, size/scale, el.getCaption())
        scene.add(mesh);
        el.mesh = mesh;
        mesh.userData.el = el;
    }

    connect(el1: Element3d, el2: Element3d) {
        this.connectors?.connect(el1,el2);
    }

    destroy() {
        super.destroy();
        this.connectors?.clear();
    }

    // --- events ---

    onCanvasClick(event: MouseEvent) {
        event.preventDefault();
        //display info below
        if (this.selectedObject) {
            const el3d = this.selectedObject.userData.el as Element3d;
            const ev = event as VxMouseEvent;
            ev.vxNode = el3d.node;
            ev.vxPosition = el3d.mesh?.position.clone();
            const clickEvent = {type: 'click', originalEvent: ev };
            // @ts-ignore //TODO fix types
            el3d.mesh?.dispatchEvent(clickEvent);
        }
    }

    onShowAnnotation(mesh: THREE.Mesh) {
        if (!mesh) return;

        const vector = this.toScreenPosition(mesh, this.camera);
        this.subscribers.forEach(fn => fn(mesh.name, vector));
    }

    sendCameraTo(camera: string) {
        switch (camera) {
            case "scene": {
                //this.cameraMotion.set(0.25, 0.0, 0.25);
                this.retargetCamera(new THREE.Vector3(0.0, 0.0, 1.5), new THREE.Vector3(0.0, 13.0, 8.0))
            } break;
            default: {
                const el: THREE.Object3D | undefined = this.scene.getObjectByName('el-'+camera);
                if (el) {
                    this.cameraMotion.set(0.0, 0.0, 0.0);
                    this.retargetCamera(el.position,
                        new THREE.Vector3(el.position.x, el.position.y + 4.0, el.position.z + 4.2))
                }
            }
        }
    }
}
