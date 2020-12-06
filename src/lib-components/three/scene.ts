import * as THREE from "three";
import * as THREEx from "@/lib-components/three/three.imports";
import LifeCycle from "@/lib-components/three/lifecycle";

interface MousePosition {
    x: number
    y: number
}

export default class Scene extends LifeCycle {

    private domParent: HTMLElement

    public readonly width: number
    public readonly height: number
    private readonly cameraTarget: THREE.Vector3 = new THREE.Vector3(0.0, 0.0, 1.5);
    private cameraBase: THREE.Vector3 = new THREE.Vector3(0.0, 12.0, 7.0);
    //private cameraBase: THREE.Vector3 = new THREE.Vector3(0.0, 4.0, 1.725);
    private readonly mouse: MousePosition

    readonly camera: THREE.PerspectiveCamera
    readonly scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    selectedObject: (THREE.Mesh | null) = null

    private composer: THREEx.EffectComposer;
    private renderPass: THREEx.RenderPass;

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
        this.camera.lookAt(this.cameraTarget);
        //scene
        this.scene = this.createScene();

        //composer for mirror and other effects
        this.composer = new THREEx.EffectComposer(this.renderer)
        this.renderPass = new THREEx.RenderPass(this.scene, this.camera)
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
        window.addEventListener('wheel', e => this.onMouseWheel(e), false);
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

    onMouseWheel(event: WheelEvent) {
        //event.preventDefault();

        const y = this.cameraBase.y + event.deltaY / 500;
        const z = this.cameraBase.z + event.deltaY / 500;
        if (y>0.3 && z>0.3 && y<14 && z<14) {
            this.cameraBase.y = y;
            this.cameraBase.z = z;
        }
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
            const phi = Math.PI / 2 + Math.sin(timer / 20000);
            this.camera.position.x = this.cameraBase.x +
                this.cameraTarget.x +
                2 * Math.cos(phi);
            this.camera.position.y = this.cameraBase.y
                //+ 0.1 * Math.sin(timer * 0.001); // + timer*0.0001;
            this.camera.position.z = this.cameraBase.z +
                this.cameraTarget.z +
                2 * Math.sin(phi);

            this.camera.lookAt(this.cameraTarget);
        };
    }

    onWindowResize() {
        let width = this.domParent.clientWidth || 1;
        let height = this.domParent.offsetHeight || 1;
        const camera = this.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //TODO parallax support
        //camera.position.x = -window.pageYOffset / 500;
        //camera.position.y = 11 + window.pageYOffset / 1000;

        //camera.lookAt(new THREE.Vector3());
        this.renderer.setSize(width, height);
        this.composer.setSize( width, height );
    }
}
