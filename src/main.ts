import * as THREE from 'three';
import * as dat from 'dat.gui';

import { World } from './world';
import { BoidController } from './boidController';
import { loadMesh } from './loadMesh';
// import { initTank } from 'tank';

import './style.css';

// Globals
let ocean: World;           // scene, camera, renderer, etc.
let fishMesh: THREE.Mesh;   // imported fish mesh
let boids1: BoidController; // swarm 1 controller
let boids2: BoidController; // swarm 2 controller

// Options
const maxBoids = 200; // Change Boid Instances
const fishModel = '../models/seahorse.glb';
const debug = { boundingBox: true };

async function Init() {
    // Create World
    ocean = new World(80, 40, 50);

    // Floor
    ocean.scene.add(initFloor());

    // Tank
    // initTank(ocean, ocean.boundary);

    // Load Fish Mesh
    fishMesh = await initFishMesh();

    // Initalize Boids
    boids1 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xeba0ce, maxBoids/2);
    boids1.name = "Fishes 1";
    boids1.spawn();

    fishMesh.scale.set(0.04, 0.04, 0.04);
    boids2 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xa0ebbb, maxBoids/2);
    boids2.name = "Fishes 2";
    boids2.spawn();

    // GUI
    const gui = new dat.GUI()
    gui.add(debug, "boundingBox");
    boids1.makeGui(gui);
    // boids2.makeGui(gui);
    gui.hide();
}

//
// Animation loop, update objects, render, and loop
//
function Animate() {
    // Update Boids
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
// Initialize FishMesh to scene
//
async function initFishMesh() {
    const { fishMesh } = await loadMesh(fishModel);
    fishMesh.scale.set(0.4, 0.4, 0.4);

    return fishMesh;
}

window.addEventListener('DOMContentLoaded', async () => {
    await Init();
    Animate();
});
