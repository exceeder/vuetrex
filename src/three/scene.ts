import * as THREE from "three";
import LifeCycle from "./lifecycle";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";

interface MousePosition {
    x: number
    y: number
}

export default class Scene extends LifeCycle {

    private domParent: HTMLElement

    public readonly width: number
    public readonly height: number
    private readonly cameraTarget: THREE.Vector3
    private readonly mouse: MousePosition

    readonly camera: THREE.PerspectiveCamera
    readonly scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    selectedObject: (THREE.Mesh | null) = null

    private composer: EffectComposer;
    private renderPass: RenderPass;

    public readonly colorMain = new THREE.Color(0x555555);
    public readonly colorHighlight = new THREE.Color(0x333333);



    /**
     * Constructs Canvas3D under provided DOM parent with Camera and Renderer
     * @param {Element} domParent
     */
    constructor(domParent: HTMLElement) {
        super();
        this.domParent = domParent;
        this.width = domParent.offsetWidth || 1;
        this.height = domParent.offsetHeight || 1;
        this.renderer = this.createRenderer(
            this.width,
            this.height,
            window.devicePixelRatio
        );
        this.domParent.appendChild(this.renderer.domElement);
        //camera
        this.camera = this.createCamera();
        this.cameraTarget = new THREE.Vector3(0.0, 0.0, 1.5);
        this.camera.lookAt(this.cameraTarget);
        //scene
        this.scene = this.createScene();

        //composer for mirror and other effects
        this.composer = new EffectComposer(this.renderer)
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(this.renderPass)

        //events
        this.mouse = { x: 0, y: 0 };
        this.bindEvents(domParent);
    }

    bindEvents(domParent: HTMLElement) {
        window.addEventListener("resize", () => this.onWindowResize(), false);
        domParent.addEventListener("mousemove", e =>
            this.onCanvasMouseMove(e)
        );
        domParent.addEventListener("mousedown", e => this.onCanvasClick(e));
    }

    start() {
        this.animate();
    }

    stop() {
        this.stopAnimation();
    }

    //--- overridable ---

    createRenderer(width:number, height:number, devicePixelRatio:number) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: "highp",
            logarithmicDepthBuffer: false
        });
        renderer.setSize(width, height);
        //renderer.physicallyCorrectLights = true;
        renderer.sortObjects = false;
        renderer.setClearColor(0xa0a0a0, 0.5);
        renderer.setPixelRatio(devicePixelRatio || 1);
        return renderer;
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            45,
            this.width / this.height,
            2,
            32
        );
        camera.position.x = 0;
        camera.position.y = 10;
        camera.position.z = -5;
        return camera;
    }

    toScreenPosition(obj:THREE.Object3D, camera:THREE.Camera) {
        const vector = new THREE.Vector3();

        // TODO: need to update this when resize window
        const canvas = this.renderer.domElement;
        const widthHalf = 0.5 * canvas.offsetWidth;
        const heightHalf = 0.5 * canvas.offsetHeight;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = vector.x * widthHalf + widthHalf + canvas.offsetLeft;
        vector.y = -(vector.y * heightHalf) + heightHalf + canvas.offsetTop;

        return {
            x: vector.x,
            y: vector.y
        };
    }

    createScene() {
        return new THREE.Scene();
    }

    //--- overrides ---
    render() {
        //this.renderer.render(this.scene, this.camera);
        this.composer.render();
    }

    //--- events ---
    onCanvasMouseMove(event: MouseEvent) {
        // the following line would stop any other event handler from firing
        // (such as the mouse's TrackballControls)
        // event.preventDefault();

        this.mouse.x = (event.offsetX / this.domParent.offsetWidth) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.domParent.offsetHeight) * 2 + 1;
    }

    onCanvasClick(event: MouseEvent) {
        //todo
    }


    //--- animations ---

    animateMouse() {
        return (timer: number, tick:number) => {
            const mouse = this.mouse;
            if (mouse.x === 0 && mouse.y === 0) return;
            let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(this.camera);
            const ray = new THREE.Raycaster(
                this.camera.position,
                vector.sub(this.camera.position).normalize()
            );

            // create an array containing all objects in the scene with which the ray intersects
            const intersects = ray.intersectObjects(this.scene.children, true);
            let found: (undefined | THREE.Intersection);
            if (intersects.length > 1) {
                found = intersects.find(
                    x => x.object && x.object.name.startsWith("el-")
                );
                const labelObject = <THREE.Mesh> (found && found.object);
                if (labelObject && labelObject !== this.selectedObject) {
                    if (this.selectedObject) {
                        const m = <THREE.MeshBasicMaterial>this.selectedObject.material;
                        m.color.set(this.colorMain);
                    }
                    this.selectedObject = labelObject;
                    const m = <THREE.MeshBasicMaterial>labelObject.material;
                    m.color.setRGB(0.3, 0.5, 0.7);
                }
            }
            if (!found && this.selectedObject) {
                (<THREE.MeshBasicMaterial>this.selectedObject.material).color.set(this.colorMain);
                this.selectedObject = null;
            }
        };
    }

    animateCamera() {
        return (timer:number, tick:number) => {
            this.camera.position.x =
                this.cameraTarget.x +
                3 * Math.cos(Math.PI / 2 + Math.sin(timer * 0.0001));
            this.camera.position.z =
                this.cameraTarget.z +
                9 +
                2 * Math.sin(Math.PI / 2 + Math.sin(timer * 0.0001));
            this.camera.position.y = 9 + 0.5 * Math.sin(timer * 0.0001); // + timer*0.0001;
            this.camera.lookAt(this.cameraTarget);
        };
    }

    onWindowResize() {
        let width = this.domParent.clientWidth || 1;
        let height = this.domParent.offsetHeight || 1;
        const camera = this.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //parallax
        camera.position.x = -window.pageYOffset / 500;
        camera.position.y = 11 + window.pageYOffset / 1000;

        //camera.lookAt(new THREE.Vector3());
        //this.renderer.setSize(width, height);
        this.composer.setSize( width, height );
    }
}
