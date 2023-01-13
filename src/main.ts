import * as THREE from "three";
// import * as dat from "dat.gui";
import { World } from "./world";
import { BoidController } from "./boidController";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import {
  LookingGlassWebXRPolyfill,
  LookingGlassConfig as config,
  // @ts-ignore
} from "@lookingglass/webxr";
// import { loadMesh } from './loadMesh';

import "./style.css";

// Globals
let ocean: World; // scene, camera, renderer, etc.
let fishMesh: THREE.Mesh; // imported fish mesh
let boids1: BoidController; // swarm 1 controller

// Options
const maxBoids = 1000; // Change Boid Instances
const debug = { boundingBox: false };

async function Init() {
  // Create World
  ocean = new World(100, 60, 70);

  // Floor
  //   ocean.scene.add(initFloor(ocean.boundary));

  // Load Fish Mesh
  fishMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 4),
    new THREE.MeshBasicMaterial()
  );

  // Initalize Boids
  boids1 = new BoidController(
    ocean.scene,
    ocean.boundary,
    fishMesh.clone(),
    0xeba0ce,
    maxBoids
  );
  boids1.name = "Fishes 1";

  // GUI
  //   const gui = new dat.GUI();
  //   gui.add(debug, "boundingBox");
  //   boids1.makeGui(gui);
  // boids2.makeGui(gui);

  // VR Button
  config.tileHeight = 512;
  config.numViews = 45;
  config.targetY = 0;
  config.targetZ = 0;
  config.targetDiam = 3;
  config.fovy = (40 * Math.PI) / 180;
  new LookingGlassWebXRPolyfill();

  document.body.append(VRButton.createButton(ocean.renderer));

  ocean.renderer.setAnimationLoop(() => {
    Animate();
  });
}

function Animate() {
  // Update Boids
  boids1.update();
  // boids2.update();

  // Debug Boundary
  if (debug.boundingBox) ocean.box.visible = true;
  else ocean.box.visible = false;

  ocean.update(); // render scene
}

window.addEventListener("DOMContentLoaded", async () => {
  await Init();
  Animate();
});
