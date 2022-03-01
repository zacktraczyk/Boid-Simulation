import * as THREE from 'three';
import { BoidController } from 'boid';
import { TrackballControls } from 'trackballControls';
import { GUI } from 'gui';

// Options
const maxBoids = 800; // Change Boid Instances

// Global
let camera, scene, renderer;
let controls; // TrackballControls
let boundary;
let boids;

//
// Initialize:
//    Scene
//    Camera
//    Bounding Box
//    Boids
//    Renderer
//    TrackballControls
//    Screen Resize EventHandler
//
function Init() {

    // Initalize Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10);
    camera.position.set(0, 0, 3.5);
    camera.lookAt(scene.position);

    // Fog
    const color = 0x000000;  // black
    const near = 0;
    const far = 8;
    scene.fog = new THREE.Fog(color, near, far);

    // Boundary
    const box = new THREE.BoxGeometry(3, 3, 3); 
    const geo = new THREE.EdgesGeometry( box ); // or WireframeGeometry( geometry )
    const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    boundary = new THREE.LineSegments( geo, mat );
    scene.add(boundary); // Render

    // Initalize Boids
    boids = new BoidController(scene, boundary, maxBoids);
    boids.spawn();

    // Initalize Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Trackball Camera Controls
    controls = new TrackballControls( camera, renderer.domElement);
    controls.target.set( 0, 0, 0 );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

    // GUI
    const gui = new GUI()
    const boidVisual = gui.addFolder('Boid Visual');
    const boidFolder = gui.addFolder('Boid Parameter');

    boidVisual.add(boids, "debug");
    boidVisual.add(boids, "randomLocation");
    boidVisual.open()

    boidFolder.add(boids, "maxSpeed", 0, 0.1);
    boidFolder.add(boids, "field", 0.00001, 3);
    boidFolder.add(boids, "minSeperation", 0, 1);
    boidFolder.add(boids, "centeringFactor", 0, 0.01);
    boidFolder.add(boids, "avoidFactor", 0, 1);
    boidFolder.add(boids, "matchFactor", 0, 1);
    boidFolder.open()

    // Resize
    window.addEventListener('resize', onWindowResize);

    animate(); // Call animation loop
}

//
// Animation loop, update objects, render, and loop
//
function animate() {
    boids.update();
    controls.update(); // Camera Trackball

    // Boundary
    if (boids.debug)
        boundary.visible = true;
    else
        boundary.visible = false;

    // Render and Loop
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.handleResize(); // Camera Trackball

    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('DOMContentLoaded', () => {
    Init()
})
