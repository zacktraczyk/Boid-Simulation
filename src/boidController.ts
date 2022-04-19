import * as THREE from 'three';
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
    private _debugBoid: any;

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
            maxSpeed: 0.2,
            maxSpeedY: 0.05,

            field: 4,
            minSeperation: 4.3,

            centeringFactor: 0.005, // scalar of force to push to center
            avoidFactor: 0.5,       // scalar of force to avoid
            matchFactor: 0.5,       // scalar of force to match directions

            margin: 9,              // distance from wall to start applying
            turnFactor: 0.1,        // scalar of force to turn away
        } 

        // Flock Properties (for gui)
        this.debug = false;
        this._debugBoid = null; // 0th Boid in this.boids
    }


    //
    // Spawns all Boid Instances at random locations
    // Pre: this.scene and this.boundary is defined
    //
    public spawn(): void {
        if (this.scene === undefined)
            throw 'ERROR: BoidController spawn(w, h): this.scene is undefined'
        if (this.boundary === undefined)
            throw 'ERROR: BoidController spawn(w, h): this.boundary is undefined'

        for (let i = 0; i < this.maxInst; i++) { 
            let b = new Boid(0, 0, 0, this.mesh.clone());
            this.boids.push(b)
            this.scene.add(b.mesh);
        }

        this.randomLocation();

        // DEBUG
        this._debugBoid = this.boids[0];
        this._debugBoid.dirDebug();
        this._debugBoid.fieldDebug();
        this.scene.add(this._debugBoid.dirArrow);
        this.scene.add(this._debugBoid.fieldSphere);
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
    // Pre: this.boundary is defined
    //
    public update(): void {
        if (this.boundary === undefined)
            throw 'ERROR: BoidController spawn(w, h): this.boundary is undefined'

        this.boids.forEach(b => {
            b.update(this.boundary, this.boids);
            this.updateProperties(b);
        });

        // Update Color
        this.material.color.setHex(this.color);

        if (this.debug) {
            this._debugBoid.debug();

            // Sphere
            this._debugBoid.fieldDebug();
            this._debugBoid.fieldSphere.visible = true;

            // Arrow
            this._debugBoid.dirArrow.visible = true;
            this._debugBoid.dirDebug(this.boundary);
        } else {
            let debugID = document.getElementById("debug");
            if (debugID)
                debugID.innerHTML= "";
            this._debugBoid.fieldSphere.visible = false;
            this._debugBoid.dirArrow.visible = false;
        }
    }

    //
    // Update properties of a Boid
    // boid: the Boid to update
    //
    private updateProperties(boid: Boid): void {
        boid.attributes = this.attributes;
    }

    //
    // Makes a GUI to adjust Boid parameters
    // gui: a Dat.Gui GUI
    //
    public makeGui(gui: dat.GUI): void {
        const boidFolder = gui.addFolder(`${this.name}`);
        boidFolder.add(this, "randomLocation");
        boidFolder.add(this, "debug");

        boidFolder.addColor(this, "color");
        boidFolder.add(this.attributes, "maxSpeed", 0, 1);
        boidFolder.add(this.attributes, "maxSpeedY", 0, 1);
        boidFolder.add(this.attributes, "field", 0.0001, 10);

        const separationFolder = boidFolder.addFolder('Boid Separation');
        const alignmentFolder = boidFolder.addFolder('Boid Adhesion');
        const cohesionFolder = boidFolder.addFolder('Boid Cohesion');
        separationFolder.add(this.attributes, "minSeperation", 0, 10);
        separationFolder.add(this.attributes, "avoidFactor", 0, 10);
        alignmentFolder.add(this.attributes, "matchFactor", 0, 10);
        cohesionFolder.add(this.attributes, "centeringFactor", 0, 0.1);
    }
}