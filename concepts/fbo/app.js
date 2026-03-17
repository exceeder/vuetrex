import * as THREE from 'https://cdn.skypack.dev/three';

// inspired a lot by http://barradeau.com/blog/?p=621
// see also https://www.youtube.com/watch?v=MnKKetZZi8g

window.onerror = function (msg, url, line) {

    const target = document.getElementById("error");
    target.textContent = "Message : " + msg + "\n" +
        "url : " + url + "\n" +
        "Line number : " + line;
}

const context3d = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100),
    shaderObjects: [],
    shaderObjectsDict: {},
    renderer: {},
    mouse: {x: 0, y: 0, z: 0, w: 0, wheel: 5.0}
};

const WIDTH = 256;

function init(context3d) {
    context3d.scene.backgdound = new THREE.Color(0xa0a0a0);
    context3d.camera.position.set(0,0,5);
    const webgl = new THREE.WebGLRenderer();

    const scale = 1.0;
    webgl.setSize(window.innerWidth * scale - 45, window.innerHeight * scale - 120);
    webgl.setClearColor(0x222222, 1);
    document.body.appendChild(webgl.domElement);
    window.addEventListener('resize', () => {
        context3d.camera.aspect = window.innerWidth / window.innerHeight;
        context3d.camera.updateProjectionMatrix();
        context3d.renderer.setSize(window.innerWidth * scale - 45, window.innerHeight * scale - 120);
    }, false);

    webgl.domElement.addEventListener('mousemove', function (e) {
        context3d.mouse.x = e.clientX - window.innerWidth/2;
        context3d.mouse.y = e.clientY - window.innerHeight/2;
    }, false);
    webgl.domElement.addEventListener('mousedown', function (e) {
        context3d.mouse.z = e.clientX - window.innerWidth/2;
        context3d.mouse.w = e.clientY - window.innerHeight/2
    }, false);
    webgl.domElement.addEventListener('mouseup', function (e) {
        context3d.mouse.z = 0;
        context3d.mouse.w = 0;
    }, false);

    webgl.domElement.addEventListener('wheel',function(event){

        if (event.wheelDelta) {
            context3d.mouse.wheel -= event.wheelDelta / 2000.0;
            console.log(context3d.mouse.wheel, event.wheelDelta)
        }
        //event.preventDefault();
        event.stopPropagation();
    }, false);

    context3d.renderer = webgl;
}

function animate(context3d) {
    let counter = 0;

    function render() {
        context3d.shaderObjects.forEach(function (item) {
            item.update(counter++);
        });
        if (context3d.mouse.z !== 0) {
            context3d.camera.position.x = -context3d.mouse.x / 500.0;
            context3d.camera.position.y = (-150 + context3d.mouse.y) / 500.0;
            context3d.camera.lookAt(0., 0., 0.)
        }
        context3d.camera.position.z = context3d.mouse.wheel;
        requestAnimationFrame(render);
        context3d.renderer.render(context3d.scene, context3d.camera);
    }

    render();
}

class ShaderObject {
    constructor(name, x, y, z, col, rx, ry) {
        this.name = name;
        this.rx = rx;
        this.ry = ry;
        this.vel = [0, 0, 0]

        const urls = ["./shaders/vertex.glsl", "./shaders/fragment.glsl"]
        Promise.all(urls.map(url =>
            fetch(url).then(resp => resp.text())
        )).then(shaders => {
            //parameters, passed to the fragment shader
            let uniforms = {
                time: {
                    type: "f",
                    value: 1.0
                },
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2(1,1)
                },
                mouse: {
                    type: "v4",
                    value: new THREE.Vector4()
                }
            };

            this.material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                extensions: {
                    derivatives: "extension GL_OES_standard_derivatives: enable",
                    shaderTextureLOD: true
                },
                side: THREE.FrontSide,
                //side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                //blending: THREE.NormalBlending,
                depthWrite: false,
                vertexShader: shaders[0],
                fragmentShader: shaders[1],
                transparent: true
            });

            //this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(WIDTH*WIDTH*3);
            const reference = new Float32Array(WIDTH*WIDTH*2);
            for (let i = 0; i < WIDTH*WIDTH; i++) {
                const x = ((i % WIDTH)/WIDTH - 0.5)*2.5 + Math.random()*0.01;
                const z = ((i / WIDTH)/WIDTH - 0.5)*2.5 + Math.random()*0.01;
                const y = 0.25 * Math.sin((x+z)*3)*Math.cos(z*x*7);
                const xx = (i%WIDTH)/WIDTH;
                const yy = (i/WIDTH)%WIDTH;
                positions.set( [x,y,z], i*3);
                reference.set( [xx,yy], i*2);
            }
            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions,3))
            this.geometry.setAttribute('reference', new THREE.BufferAttribute(reference,2))


            this.obj = new THREE.Points(this.geometry, this.material);
            this.obj.renderOrder = 999;
            this.obj.startTime = Date.now();
            this.obj.uniforms = uniforms;
            this.obj.name = name;
            this.obj.position.set(x,y,z);
            context3d.scene.add(this.obj);
        })
    }

    updateParticles(t) {
        const positions = this.geometry.getAttribute('position');
        const count = 1000;
        const offset = Math.floor(Math.random()*(WIDTH*WIDTH-count));
        for (let idx = 0; idx < count; idx++) {
            const i = (offset+idx) % (WIDTH*WIDTH);
            const x = ((i % WIDTH)/WIDTH - 0.5)*2.5 + Math.sin(t)/10;
            const z = ((i / WIDTH)/WIDTH - 0.5)*2.5 + Math.cos(t)/10;
            const y = positions.getY(i)
            positions.set( [x,y,z], i*3);
        }
        positions.updateRange.offset = offset*3
        positions.updateRange.count = count*3
        positions.needsUpdate = true;
    }

    update() {
        if (this.obj) {
            const t = (Date.now() - this.obj.startTime) / 1000;

            this.updateParticles(t);

            this.obj.uniforms.time.value = t;
            this.obj.rotation.y = Math.sin(t/50);
            this.obj.uniforms.mouse.value.set(
                context3d.mouse.x / 1000.0, context3d.mouse.y / 1000.0,
                context3d.mouse.z / 1000.0, context3d.mouse.w / 1000.0);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init(context3d);

    context3d.shaderObjectsDict.plane1 = context3d.shaderObjects.push(
        new ShaderObject("plane1", 0, -0.3, 3.33, 0x00a9ff, 0.0, 0.0)
    );

    animate(context3d);
});

