import * as THREE from 'three';
import { Vector3 } from 'three';
import { Boid } from './boid';

//
// Controls a group of Boids
//
export class BoidController {
    public name: string;

    private scene: THREE.Scene;
    private boundary: any;

    private boids: Array<Boid>;
    private maxInst: number;

    private color: number;
    private material: THREE.MeshBasicMaterial;
    private mesh: THREE.Mesh;

    // Boid Attributes
    public attributes: Attributes;

    // Debug
    public debug: boolean;
    private debugBoid: any;
    private debugBoid_dir: THREE.ArrowHelper;
    private debugBoid_field: THREE.Mesh;


    constructor(scene: THREE.Scene, boundary: THREE.LineSegments, mesh: THREE.Mesh, color: number, maxInst = 10) {
        this.scene = scene;
        this.boundary = boundary;

        // Flock Data
        this.name = "Boid Flock"
        this.boids = new Array();
        this.maxInst = maxInst;

        // Boid Appeareance
        this.color = color;
        this.material = new THREE.MeshBasicMaterial({ color: color });
        // this.material = new THREE.MeshStandardMaterial({ color: color });
        mesh.material = this.material;
        this.mesh = mesh;

        // Boid Attributes
        this.attributes = {
            maxSpeed: 3,
            maxSpeedY: 0.9,

            field: 3.8,

            minSeperation: 2.5,
            centeringFactor: 1.9,  // scalar of force to push to center
            matchFactor: 2.6,      // scalar of force to match directions

            margin: 9,           // distance from wall to start applying
            turnFactor: 0.1,     // scalar of force to turn away
        }

        this.spawn();

        // Debug

        this.debug = false;

        // Debug Arrow and Field
        const origin = this.mesh.position;
        const length = 8;
        const hex = 0xff0000;
        this.debugBoid_dir = new THREE.ArrowHelper(new Vector3(), origin, length, hex);

        const sphereGeometry = new THREE.SphereGeometry(this.attributes.field, 32, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
        this.debugBoid_field = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Place debug meshes
        if (this.boids.length > 0) {
            this.debugBoid = this.boids[0]; // 0th Boid in this.boids

            this.debugBoid_dirDebug();
            this.debugBoid_fieldDebug();
            this.scene.add(this.debugBoid_dir);
            this.scene.add(this.debugBoid_field);
        }
    }


    //
    // Spawns all Boid Instances at random locations
    //
    public spawn(): void {
        for (let i = 0; i < this.maxInst; i++) {
            let b = new Boid(0, 0, 0, this.mesh.clone());
            this.boids.push(b)
            this.scene.add(b.mesh);
        }

        this.randomLocation();
    }

    //
    // Move Boids to random locations
    //
    public randomLocation(): void {
        this.boids.forEach((b) => {
            b.randomLocation(this.boundary);
        });
    }

    //
    // Calls Move for each Boid Instance
    //
    public update(): void {
        this.boids.forEach(b => {
            b.update(this.boundary, this.boids);
            this.updateProperties(b);
        });

        // Update Color
        this.material.color.setHex(this.color);

        if (this.debug) {
            this.debugBoid.debug();

            // Arrow
            this.debugBoid_dir.visible = true;
            this.debugBoid_dirDebug();

            // Sphere
            this.debugBoid_fieldDebug();
            this.debugBoid_field.visible = true;

        } else {
            let debugID = document.getElementById("debug");
            if (debugID)
                debugID.innerHTML = "";
            this.debugBoid_field.visible = false;
            this.debugBoid_dir.visible = false;
        }
    }

    //
    // Update properties of a Boid
    //
    private updateProperties(boid: Boid): void {
        boid.attributes = this.attributes;
    }

    //
    // Makes a GUI to adjust Boid parameters
    //
    public makeGui(gui: dat.GUI): void {
        const boidFolder = gui.addFolder(`${this.name}`);
        boidFolder.add(this, "randomLocation");
        boidFolder.add(this, "debug");

        boidFolder.addColor(this, "color");
        boidFolder.add(this.attributes, "maxSpeed", 0, 10);
        boidFolder.add(this.attributes, "maxSpeedY", 0, 1);
        boidFolder.add(this.attributes, "field", 0.0001, 10);

        boidFolder.add(this.attributes, "minSeperation", 0, 10);
        boidFolder.add(this.attributes, "matchFactor", 0, 10);
        boidFolder.add(this.attributes, "centeringFactor", 0, 10);
    }

    // 
    // Draw Direction vector
    //
    public debugBoid_dirDebug(): void {
        const dir = this.debugBoid.vel.clone().normalize();
        this.debugBoid_dir.position.copy(this.debugBoid.mesh.position);
        this.debugBoid_dir.setDirection(dir);
    }

    // 
    // Draw Field Sphere
    //
    public debugBoid_fieldDebug(): void {
        this.debugBoid_field.position.copy(this.debugBoid.mesh.position);
        this.debugBoid_field.scale.set(this.debugBoid.attributes.field,
            this.debugBoid.attributes.field, this.attributes.field);
    }

}
