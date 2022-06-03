import * as THREE from 'three';
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//
// Fish Tank
// Contains the scene, camera, lights, and renderer
//
export class World {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public box: THREE.LineSegments;
    public boundary: THREE.Box3;

    private renderer: THREE.WebGLRenderer;
    private cameraControls: OrbitControls;

    constructor(x: number, y: number, z: number) {
        // Initalize Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = this.initCamera();

        // Light
        this.scene.add(this.initLightDir());
        this.scene.add(this.initLightAmb());

        // Fog
        this.initFog();

        // Background Color
        this.scene.background = new THREE.Color(0xff0000);

        // Boundary
        this.box = this.initBoundaryBox(x, y, z);
        this.boundary = new THREE.Box3().setFromObject(this.box);
        this.scene.add(this.box); // Render

        // Renderer init
        this.renderer = this.initRenderer();
        document.body.appendChild(this.renderer.domElement);

        // Camera controls
        this.cameraControls = this.initCameraControls();

        // Resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    //
    // Initialize the Scene camera
    //
    private initCamera(): THREE.PerspectiveCamera {
        const c = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        c.position.set(0, 30, 105);
        c.lookAt(this.scene.position);
        return c;
    }

    //
    // Initialize Scene Light
    //
    private initLightDir(): any {
        const light = new THREE.DirectionalLight('white', 1);
        light.position.set(30, 30, 30);
        return light;
    }

    private initLightAmb(): any {
        const light = new THREE.AmbientLight('white', 0.5);
        return light;
    }
    //
    // Initialize Scene Fog
    //
    private initFog(): void {
        const near = 150;
        const far = 280;
        // const color = 0x87ace8;  // blue
        const color = 0x000000;  // blue
        this.scene.background = new THREE.Color(color);
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    //
    // Initialize Boundary
    //
    private initBoundaryBox(x: number, y: number, z: number): THREE.LineSegments {
        const box = new THREE.BoxGeometry(x, y, z); 
        const geo = new THREE.EdgesGeometry( box ); // or WireframeGeometry( geometry )
        const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
        return new THREE.LineSegments( geo, mat );
    }

    //
    // Initialize Renderer
    //
    private initRenderer(): THREE.WebGLRenderer{
        const r = new THREE.WebGLRenderer({antialias: true});
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        r.setPixelRatio(window.devicePixelRatio);
        r.setSize(window.innerWidth, window.innerHeight);
        return r;
    }

    //
    // Initialize Camera Controls
    //
    private initCameraControls(): OrbitControls {
        // const cc = new TrackballControls( this.camera, this.renderer.domElement);
        const cc = new OrbitControls( this.camera, this.renderer.domElement);
        cc.target.set( 0, 0, 0 );
        cc.autoRotate = true;

        // cc.rotateSpeed = 1.0;
        // cc.zoomSpeed = 1.2;
        // cc.panSpeed = 0.8;

        return cc;
    }

    //
    // Update Camera Controls and Render
    //
    public update(): void {
        this.cameraControls.update();
        this.renderer.render( this.scene, this.camera );
    }

    //
    // Update screen and camera to new size
    //
    public onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        // this.cameraControls.handleResize(); // Camera Trackball

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}

//
// Scene floor
// Adds sand colored plane to scene
//
export function initFloor(boundary: THREE.Box3) {
    const size = boundary.max;

    const geo = new THREE.PlaneBufferGeometry(2000, 2000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xebe4a0, side: THREE.DoubleSide });
    const p  = new THREE.Mesh(geo, mat);
    p.rotateX(- Math.PI/2);
    p.position.y = -size.y;

    return p;
}