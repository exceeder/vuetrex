import * as THREE from "three";
import * as THREEx from "@/lib-components/three/three.imports";
import Scene from "@/lib-components/three/scene";
import Element3d from "@/lib-components/three/element3d";
import {VuetrexParticles, ParticleOptions} from "@/lib-components/three/connectors";
import {Vector3} from "three";

const R = 1.3; //box radius
const D = 1.5; //box distance

const options: ParticleOptions = {
    position: new THREE.Vector3(-2.5, 0.2, -0.5),
    positionRandomness: 1.95,
    velocity: new THREE.Vector3(0.1,0,0),
    minMax: new THREE.Vector2(-5.0, 5.0),
    velocityRandomness: 0.001,
    color: 0xa0ffff,
    colorRandomness: 0.1,
    lifetime: 70,
    size: 0.9,
    sizeRandomness: 0.3
};

const spawnerOptions = {
    spawnRate: 50,
    horizontalSpeed: 0.2,
    verticalSpeed: 0.1,
    timeScale: 1.0,
    maxParticles: 5000,
    containerCount: 1
};

/**
 * Stage keeps top-level structures to draw the tree of runtime nodes.
 * It replaces browser's drawing of DOM elements.
 */
export default class VuetrexStage extends Scene {
    public root: Element3d | null = null;
    private subscribers: Function[];
    private particleSystem: VuetrexParticles | null = null
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

        //particles
        this.particleSystem = new VuetrexParticles( {
            maxParticles: spawnerOptions.maxParticles,
            containerCount: spawnerOptions.containerCount
        } );
        scene.add( this.particleSystem );

        this.onAnimate(this.animateCamera());
        this.onAnimate(this.animateMouse());
        this.onAnimate(this.animateParticles());
    }

    getById(id: string): Element3d {
        return (this.scene.getObjectByName('el-'+id) as THREE.Mesh).userData.el;
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
            const c = el.mesh.userData.caption
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
        el.userData.caption = c;
        this.caps.updateFn();
        return c;
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
            //(el as any).caption.text = el.node.name;
            this.positionLayoutElement(el);
            el.mesh.userData.caption.x = el.mesh.position.x
            el.mesh.userData.caption.y = el.mesh.position.z + size / 2.0,
            el.mesh.userData.caption.text = el.node.name + el.node.text
            this.caps.updateFn();
            return;
        }

        const mesh = gen(size);
        const scale = el.node.getScale();
        mesh.scale.set(1/scale, 1/scale, 1/scale);
        mesh.geometry.translate(0,0.5-scale/2,0)
        mesh.name = "el-" + el.node.name;
        mesh.castShadow = true;
        mesh.position.copy(this.positionLayoutElement(el));
        mesh.userData.caption = this.addCaption(mesh, size/scale, el.node.name + el.node.text)
        scene.add(mesh);
        el.mesh = mesh;
        mesh.userData.el = el;
    }

    // --- events ---

    onCanvasClick(event: MouseEvent) {
        event.preventDefault();
        //display info below
        if (this.selectedObject) {
            this.selectedObject.dispatchEvent({type:'click', originalEvent: event})
            //this.onShowAnnotation(this.selectedObject);
        }

    }

    onShowAnnotation(mesh: THREE.Mesh) {
        if (!mesh) return;

        const vector = this.toScreenPosition(mesh, this.camera);
        this.subscribers.forEach(fn => fn(mesh.name, vector));
    }

    hSegments : THREE.Vector3[] = []; //
    vSegments : THREE.Vector3[] = []; //

    connect(el1: Element3d, el2: Element3d) {
        const sx = el1.mesh?.position.x || 0
        const sy = el1.mesh?.position.z || 0
        const tx = el2.mesh?.position.x || 0
        const ty = el2.mesh?.position.z || 0

        const midy = ( sy + ty ) / 2;

        if( Math.abs(sy-ty) < 0.01 ) {
            this.hSegments.push(new THREE.Vector3(sy, sx, tx))
        } else if( Math.abs(sx-tx) < 0.01 ) {
            this.vSegments.push(new THREE.Vector3(sx, sy, ty))
        } else {
            this.vSegments.push(new THREE.Vector3(sx,sy,midy))
            this.hSegments.push(new THREE.Vector3(midy,sx,tx))
            this.vSegments.push(new THREE.Vector3(tx,midy,ty))
        }
        // this.vSegments.forEach(s => {
        //     console.log("v "+s.x+' E ('+options.minMax.x+","+options.minMax.y+')');
        // })
        // this.hSegments.forEach(s => {
        //     console.log("h "+s.x+' E ('+options.minMax.x+","+options.minMax.y+')');
        // })
    }

    animateParticles() {
        return (timer: number, tick: number) => {
            if (!this.particleSystem) return;
            const particles = this.particleSystem;

            for (let x = 0; x < spawnerOptions.spawnRate; x++) {
                const rnd = particles.random()+0.5;
                const rnd2 = particles.random();
                if (rnd < 0.5)
                {
                    //horizontal
                    const seg = Math.floor(rnd * 1024) % this.hSegments.length
                    const v3 = isNaN(seg) ? new Vector3(0, -3. ,3.) : this.hSegments[seg];
                    if (rnd2 > -2.0) { const t = v3.y; v3.y=v3.z; v3.z = t; }
                    options.minMax.set(Math.min(v3.y, v3.z), Math.max(v3.y, v3.z))
                    options.position.set(v3.y + (v3.z-v3.y)*rnd/2, -0.25, v3.x)
                    options.velocity.set((v3.z-v3.y)*rnd/70, 0, 0);
                } else {
                    //vertical
                    const seg = Math.floor(rnd * 1024) % this.vSegments.length
                    const v3 = isNaN(seg) ? new Vector3(0, -.3 ,3.) : this.vSegments[seg];
                    if (rnd2 > -2.) { const t = v3.y; v3.y=v3.z; v3.z = t; }
                    options.position.set(v3.x, -0.25, v3.y + (v3.z-v3.y)*rnd/2)
                    options.velocity.set(0, 0, (v3.z-v3.y)*rnd/70);
                    options.minMax.set(Math.min(v3.y, v3.z), Math.max(v3.y, v3.z))
                }
                // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
                // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
                particles.spawnParticle(options);
            }
            particles.update(tick);
        }
    }
}
