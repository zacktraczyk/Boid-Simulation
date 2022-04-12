import * as THREE from 'three';
import { GUI } from 'gui';
import { World } from 'world';
// import { loadMesh } from 'loadMesh';
import { BoidController } from 'boidController';

// Shader
import Frag from 'frag';
import Vert from 'vert';

// Shader Attributes
let uniforms = {
    boxColor: {
        value: new THREE.Vector3(0, 0, 1)
    }
}

let ocean;          // World container
let fishMesh;
// let boids1, boids2; // Swarms
let boids;

// Options
const maxBoids = 800; // Change Boid Instances
const debug = { boundingBox: true };

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
    ocean = new World(60, 60, 60);

    // Tank
    // ocean.scene.add(initFloor());
    // initTank();

    // Load Fish Mesh
    const geometry = new THREE.BoxGeometry(0.7, 3, 0.7);    // Boid Geometry
    const material = new THREE.MeshStandardMaterial();          // Boid Material
    fishMesh = new THREE.Mesh( geometry, material );

    // Initalize Boids
    boids = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xeba0ce, maxBoids/2);
    boids.name = "Fishes 1";
    boids.spawn();

    // GUI
    const gui = new GUI()
    gui.add(debug, "boundingBox");
    boids.makeGui(gui);
    gui.hide();
}

//
// Animation loop, update objects, render, and loop
//
function Animate() {
    // Update Boids
    boids.update();

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
    const boundingBox = new THREE.Box3().setFromObject(ocean.boundary);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const geo = new THREE.PlaneBufferGeometry(size.x, size.z, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xebe4a0, side: THREE.DoubleSide });
    const p  = new THREE.Mesh(geo, mat);
    p.rotateX(- Math.PI/2);
    p.position.y = -19;

    return p;
}

//
// Initialize Tank
//
function initTank() {
    const boundingBox = new THREE.Box3().setFromObject(ocean.boundary);
    const origin = boundingBox.min;
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const mat = new THREE.MeshStandardMaterial( {color: 0x282A38 } );
    let geo = new THREE.BoxGeometry(size.x, 5, 2);

    const baseX = new THREE.Mesh( geo, mat );

    // Front
    const front = baseX.clone();
    front.position.set(origin.x + size.x/2, origin.y + 2, -origin.z);
    ocean.scene.add(front);

    // Back
    const back = baseX.clone();
    back.position.set(origin.x + size.x/2, origin.y + 2, +origin.z);
    ocean.scene.add(back);

    // Left
    geo = new THREE.BoxGeometry(2, 5, size.z + 2);
    const baseZ = new THREE.Mesh( geo, mat );
    const left = baseZ.clone();
    left.position.set(origin.x + size.x + 1, origin.y + 2, 0);
    ocean.scene.add(left);

    // Right
    const right = baseZ.clone();
    right.position.set(origin.x - 1, origin.y + 2, 0);
    ocean.scene.add(right);

    // Bottom
    geo = new THREE.BoxGeometry(size.x + 4, 2, size.z + 2);
    const bottom = new THREE.Mesh( geo, mat );
    bottom.position.set(origin.x + size.x/2, origin.y - 1.5, origin.z + size.z/2);
    ocean.scene.add(bottom);

    geo = new THREE.BoxGeometry(size.x + 4, 1, size.z + 2);
    const topp = new THREE.Mesh( geo, mat );
    topp.position.set(origin.x + size.x/2, origin.y + size.y, origin.z + size.z/2);
    ocean.scene.add(topp);
}

//
// Initialize FishMesh to scene
//
async function initFishMesh() {
    const { fishMesh } = await loadMesh('../models/seahorse.glb');
    fishMesh.scale.set(0.4, 0.4, 0.4);

    return fishMesh;
}

window.addEventListener('DOMContentLoaded', async () => {
    await Init();
    Animate();
});
