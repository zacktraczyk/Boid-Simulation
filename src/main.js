import * as THREE from 'three';
import { World } from 'world';
import { loadFishMesh } from 'loadFish';
import { BoidController } from 'boidController';
import { GUI } from 'gui';

let ocean;          // World container
let fishMesh;       // Loaded Fish Mesh
let boids1, boids2; // Swarms

// Options
const maxBoids = 800; // Change Boid Instances
const debug = { boundingBox: false };

//
// Initialize:
//  World
//    Scene
//    Camera
//    Light
//    Fog
//    Boundary
//    Renderer
//    Camera Controls
//  Ocean Floor
//  Load Model
//  Boid Controllers (2)
//    Boids
//      Boid Debug
//  GUI
//
async function Init() {

    // Create World
    ocean = new World(8, 4, 5);

    // Floor
    ocean.scene.add(initFloor());

    // Load Fish Mesh
    fishMesh = await initFishMesh();

    // Initalize Boids
    boids1 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xeba0ce, maxBoids/2);
    boids1.name = "Fishes 1";
    boids1.spawn();

    fishMesh.scale.set(0.002, 0.002, 0.002);
    boids2 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xa0ebbb, maxBoids/2);
    boids2.name = "Fishes 2";
    boids2.spawn();

    // GUI
    const gui = new GUI()
    gui.add(debug, "boundingBox");
    boids1.makeGui(gui);
    boids2.makeGui(gui);
}

//
// Animation loop, update objects, render, and loop
//
function Animate() {
    boids1.update();
    boids2.update();

    // Boundary
    if (debug.boundingBox) ocean.boundary.visible = true;
    else ocean.boundary.visible = false;

    // Render and Loop
    ocean.update(); // Render Scene
    requestAnimationFrame( Animate );
}

// Helper Functions ------------------------------------

//
// Initialize Ocean Floor
//
function initFloor() {
    const geo = new THREE.PlaneBufferGeometry(200, 200, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xebe4a0, side: THREE.DoubleSide });
    const p  = new THREE.Mesh(geo, mat);
    p.rotateX(- Math.PI/2);
    p.position.y = -2;

    return p;
}

//
// Initialize FishMesh to scene
//
async function initFishMesh() {
    const { fishMesh } = await loadFishMesh();
    fishMesh.scale.set(0.001, 0.001, 0.001);
    fishMesh.rotateX( Math.PI/2);
    return fishMesh;
}

window.addEventListener('DOMContentLoaded', async () => {
    await Init();
    Animate();
});
