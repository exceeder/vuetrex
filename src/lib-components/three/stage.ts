import * as THREE from "three";
import * as THREEx from "@/lib-components/three/three.imports";
import Scene from "@/lib-components/three/scene";
import Element3d from "@/lib-components/three/element3d";

const R = 1.3; //box radius
const D = 1.5; //box distance

/**
 * Stage keeps top-level structures to draw the tree of runtime nodes.
 * It replaces browser's drawing of DOM elements.
 */
export default class VuetrexStage extends Scene {
    public root: Element3d | null = null;
    private subscribers: Function[];
    private caps: { repeats: number; size: number; planeSize: number; updateFn: () => void; texture: THREEx.DynamicTexture | null } = {
        planeSize: 512,
        size: 2048,
        repeats: 17,
        texture: null,
        updateFn: () => {}
    }
    private captions: Array<{x:number, y:number, text:string}> = []

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

    getById(id: string) {
        return this.scene.getObjectByName('el-'+id);
    }

    onHighlight(fn: Function) {
        this.subscribers.push(fn);
    }

    createGroundMirror(scene: THREE.Scene) {
        const geometry = new THREE.PlaneBufferGeometry(100, 100);
        const groundMirror = new THREEx.Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: this.width * window.devicePixelRatio,
            textureHeight: this.height * window.devicePixelRatio,
            color: new THREE.Color(0x333333)
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
        texture.texture.repeat.set(caps.repeats, caps.repeats)
        texture.texture.offset.set(-textureOffset, -textureOffset)

        const planeSize = 512;
        this.repaintTitles(planeSize)
        caps.updateFn = () => this.repaintTitles(planeSize)

        let material = new THREE.MeshBasicMaterial({opacity: 1.0, transparent: true, map: texture.texture});
        let plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), material);
        plane.rotation.x = -Math.PI / 2.0;
        plane.position.y = -0.349;
        scene.add(plane);
    }

    repaintTitles(mirrorSize: number) {
        const caps = this.caps;
        const textureSize = caps.size;
        const textureRepeats = caps.repeats;
        const texture = caps.texture!
        texture.clear(undefined)
        texture.clear('#3f3f3fc0')

        texture.context.font = "bold "+Math.floor(textureSize/128)+"px Helvetica"
        const scale = textureSize / mirrorSize * textureRepeats;
        this.captions.forEach(c => {
            const w = texture.context.measureText(c.text).width

            const x = c.x * scale
            const y = c.y * scale
            texture.drawText(c.text, x + textureSize / 2 - w/2.0, y + textureSize / 2 + R/4*scale, '#eeffff')
        })

    }

    createLights(scene: THREE.Scene) {
        let light = new THREE.PointLight(0xbbbbff, 0.8);
        light.position.set(-10, 20, 50);
        light.castShadow = false;
        scene.add(light);

        let light2 = new THREE.SpotLight(0xffffff, 0.7);
        light2.position.set(-20, 20, 15);
        scene.add(light2);

        let light3 = new THREE.PointLight(0xeebbff, 0.2);
        light3.position.set(10, 30, -10);
        scene.add(light3);

        let light4 = new THREE.AmbientLight(0xffffff, 0.3);
        light4.position.y = 10;
        scene.add(light4);
    }

    createElementMaterial() {
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.3;
        bMaterial.metalness = 0.1;
        bMaterial.flatShading = false;
        bMaterial.color.set(this.colorMain);
        return bMaterial;
    }

    removeObject(el: Element3d) {
        if (el.mesh) {
            this.scene.remove(el.mesh);
            const c = (el.mesh as any).caption
            if (c) {
                this.captions.splice(this.captions.indexOf(c),1)
                this.caps.updateFn();
            }
            el.mesh = null;
        }
    }

    positionLayoutElement(el: Element3d) : THREE.Vector3 {
        const node = el.node;
        const scale = node.getScale();

        const colIdx = node.getIdx();
        const rowIdx = node.getRow()?.getIdx() || 0;
        const cols = node.getRow()?.renderSize() || 1;
        const rows = node.getLayer()?.renderSize() || 1;
        const layerPos = node.getLayer()?.element?.pos;
        const offX =  layerPos?.x || 0.0;
        const offZ = layerPos?.z || 0.0;

        //in WebGL, positive X to the right, Y to the top, Z to the back
        return new THREE.Vector3(
         (-rows * (R + D)) / 2 / scale + (R + D) * rowIdx / scale + (R + D) / 2 / scale + offX,
            0.0,
         (-cols * (R + D)) / 2 / scale + (R + D) * colIdx / scale + (R + D) / 2 / scale + offZ);
    }

    meshCreator(type: string): (size:number) => THREE.Mesh {
        let bMaterial = this.createElementMaterial();
        switch (type) {
            case 'cylinder': {
                return size => {
                    return new THREE.Mesh(
                        new THREE.CylinderGeometry(size / 2, size / 2 * 1.05, R / 2, 32),
                        bMaterial
                    );
                }
            }
            case 'cylinder-shape': {
                return size => {
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
                        bevelThickness: 0.07,
                        bevelSize: 0.07,
                        bevelOffset: 0,
                        bevelSegments: 5
                    };

                    const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
                    geometry.rotateX(Math.PI/2)
                    geometry.translate(0,0.07,0)
                    return new THREE.Mesh(geometry, bMaterial);
                };
            }
            case 'rbox-shape': {
                return size => {
                    const width = size;
                    const length = R * 0.9;

                    const shape = new THREE.Shape();
                    shape.moveTo(-length/2, -width/2);
                    shape.lineTo(-length/2, width/2);
                    shape.lineTo(length/2, width/2);
                    shape.lineTo(length/2, -width/2);
                    shape.lineTo(-length/2, -width/2);

                    const extrudeSettings = {
                        steps: 1,
                        depth: R/2,
                        bevelEnabled: true,
                        bevelThickness: 0.1,
                        bevelSize: 0.1,
                        bevelOffset: 0,
                        bevelSegments: 3
                    };

                    const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
                    geometry.rotateX(Math.PI/2)
                    geometry.translate(0,R/4,0)
                    return new THREE.Mesh(geometry, bMaterial);
                }

            }
            case 'rbox': {
                return size => {
                    return new THREE.Mesh(new THREEx.RoundedBoxBufferGeometry(R, R / 2, size,  5, .1), bMaterial);
                }

            }
            default:
            case 'box': {
                return size => {
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
        (el as any).caption = c;
        this.caps.updateFn();
    }

    renderMesh(el: Element3d, size: number = R, gen: (size:number) => THREE.Mesh) {

        // console.log("render [",node.name,"] ",
        //     `rows:${rows}`,
        //     `cols:${cols}`,
        //     `rowIdx:${i}`,
        //     `boxIdx:${j}`);

        const scene = this.scene;

        if (el.mesh !== null) {
            el.mesh.position.copy(this.positionLayoutElement(el))
            this.positionLayoutElement(el);
            return;
        }

        const mesh = gen(size);
        const scale = el.node.getScale();
        mesh.scale.set(1/scale, 1/scale, 1/scale);
        mesh.geometry.translate(0,0.5-scale/2,0)
        mesh.name = "el-" + el.node.name;
        mesh.castShadow = true;
        mesh.position.copy(this.positionLayoutElement(el));
        this.addCaption(mesh, size/scale, el.node.name)
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
