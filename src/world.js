import * as THREE from 'three';
import { TrackballControls } from 'trackballControls';

//
// Fish Tank
// Contains the scene, camera, lights, and renderer
//
export class World {

    constructor(x, y, z) {
        // Initalize Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = this.initCamera();

        // Light
        this.scene.add(this.initLight());

        // Fog
        // this.initFog();

        // Background Color
        // this.scene.background = new THREE.Color(0xffffff);

        // Boundary
        this.boundary = this.initBoundary(x, y, z);
        this.scene.add(this.boundary); // Render

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
    // Return: camera
    //
    initCamera() {
        const c = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        c.position.set(0, 10, 35);
        c.lookAt(this.scene.position);
        return c;
    }

    //
    // Initialize Scene Light
    // Return: light
    //
    initLight() {
        const light = new THREE.DirectionalLight('white', 30);
        light.position.set(30, 30, 30);
        return light;
    }

    //
    // Initialize Scene Fog
    //
    initFog() {
        const near = 0;
        const far = 170;
        const color = 0x87ace8;  // black
        this.scene.background = new THREE.Color(color)
        this.scene.fog = new THREE.Fog(color, near, far);
    }


    //
    // Initialize Boundary
    // Return: boundary Mesh
    //
    initBoundary(x, y, z) {
        const box = new THREE.BoxGeometry(x, y, z); 
        const geo = new THREE.EdgesGeometry( box ); // or WireframeGeometry( geometry )
        const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
        return new THREE.LineSegments( geo, mat );
    }

    //
    // Initialize Renderer
    // Return: renderer
    //
    initRenderer() {
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
    initCameraControls() {
        const cc = new TrackballControls( this.camera, this.renderer.domElement);
        cc.target.set( 0, 0, 0 );

        cc.rotateSpeed = 1.0;
        cc.zoomSpeed = 1.2;
        cc.panSpeed = 0.8;

        return cc;
    }

    //
    // Update Camera Controls and Render
    //
    update() {
        this.cameraControls.update();
        this.renderer.render( this.scene, this.camera );
    }

    //
    // Update screen and camera to new size
    //
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.cameraControls.handleResize(); // Camera Trackball

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}
