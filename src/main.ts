import * as THREE from 'three';
import * as dat from 'dat.gui';

import { World, initFloor } from './world';
import { BoidController } from './boidController';
// import { loadMesh } from './loadMesh';

import './style.css';

// Globals
let ocean: World;           // scene, camera, renderer, etc.
let fishMesh: THREE.Mesh;   // imported fish mesh
let boids1: BoidController; // swarm 1 controller
let boids2: BoidController; // swarm 2 controller

// Options
const maxBoids = 500; // Change Boid Instances
// const fishModel = '../models/seahorse.glb';
const debug = { boundingBox: false };

async function Init() {
    // Create World
    ocean = new World(100, 60, 70);

    // Floor
    ocean.scene.add(initFloor(ocean.boundary));

    // Load Fish Mesh
    // fishMesh = await loadMesh(fishModel, 0.4);
    fishMesh = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 4), new THREE.MeshBasicMaterial)

    // Initalize Boids
    boids1 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xeba0ce, maxBoids);
    boids1.name = "Fishes 1";

    fishMesh.scale.set(0.4, 0.4, 0.4);
    boids2 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xa0ebbb, maxBoids/2);
    boids2.name = "Fishes 2";

    // GUI
    const gui = new dat.GUI()
    gui.add(debug, "boundingBox");
    boids1.makeGui(gui);
    boids2.makeGui(gui);
}

function Animate() {
    // Update Boids
    boids1.update();
    boids2.update();

    // Debug Boundary
    if (debug.boundingBox) ocean.boundary.visible = true;
    else ocean.boundary.visible = false;

    ocean.update(); // render scene
    requestAnimationFrame( Animate ); // loop
}

window.addEventListener('DOMContentLoaded', async () => {
    await Init();
    Animate();
});