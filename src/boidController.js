import * as THREE from 'three';
import { Boid} from 'boid';

//
// Controls a group of Boids
//
export class BoidController {

    constructor(scene, boundary, mesh, color, maxInst = 10){
        this._scene = scene;
        this._boundary = boundary;

        this.name = "Boid Flock"
        this.boids = new Array();
        this.maxInst = maxInst;
        this.color = color;
        this.material = new THREE.MeshBasicMaterial({ color: color });
        mesh.material = this.material;
        this.mesh = mesh;

        this.debug = false;
        this._debugBoid = null;

        // Boid Properties (for gui)
        this.maxSpeed = 0.02;
        this.maxSpeedY = 0.005;
        this.field = 0.4;
        this.minSeperation = 0.13;

        this.centeringFactor = 0.0005 // scalar of force to push to center
        this.avoidFactor = 0.05;      // scalar of force to avoid
        this.matchFactor = 0.05;      // scalar of force to match directions
    }

    //
    // Spawns all Boid Instances at random locations
    // Pre: this._scene and this._boundary is defined
    //
    spawn() {
        if (this._scene === undefined)
            throw 'ERROR: BoidController spawn(w, h): this._scene is undefined'
        if (this._boundary === undefined)
            throw 'ERROR: BoidController spawn(w, h): this._boundary is undefined'

        for (let i = 0; i < this.maxInst; i++) { 
            let b = new Boid(0, 0, 0, this.mesh.clone(), this.material);
            this.boids.push(b)
            this._scene.add(b.mesh);
        }

        this.randomLocation();

        // DEBUG
        this._debugBoid = this.boids[0];
        this._debugBoid.dirDebug();
        this._debugBoid.fieldDebug();
        this._scene.add(this._debugBoid.dirArrow);
        this._scene.add(this._debugBoid.fieldSphere);
    }

    //
    // Move Boids to random locations
    //
    randomLocation() {
        this.boids.forEach((b) => {
            b.randomLocation(this._boundary);
        });
    }

    //
    // Calls Move for each Boid Instance
    // Pre: this._boundary is defined
    //
    update() {
        if (this._boundary === undefined)
            throw 'ERROR: BoidController spawn(w, h): this._boundary is undefined'

        this.boids.forEach(b => {
            b.update(this._boundary, this.boids);
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
            this._debugBoid.dirDebug(this._boundary);
        } else {
            document.getElementById("debug").innerHTML = "";
            this._debugBoid.fieldSphere.visible = false;
            this._debugBoid.dirArrow.visible = false;
        }
    }

    //
    // Update properties of a Boid
    // boid: the Boid to update
    //
    updateProperties(boid) {
        boid.maxSpeed = this.maxSpeed;
        boid.maxSpeedY = this.maxSpeedY;

        boid.field = this.field;
        boid.minSeperation = this.minSeperation;

        boid.centeringFactor = this.centeringFactor;
        boid.avoidFactor = this.avoidFactor;
        boid.matchFactor = this.matchFactor;
    }

    //
    // Makes a GUI to adjust Boid parameters
    // gui: a Dat.Gui GUI
    //
    makeGui(gui) {
        const boidFolder = gui.addFolder(`${this.name}`);
        boidFolder.add(this, "randomLocation");
        boidFolder.add(this, "debug");

        boidFolder.addColor(this, "color");
        boidFolder.add(this, "maxSpeed", 0, 0.1);
        boidFolder.add(this, "maxSpeedY", 0, 0.1);
        boidFolder.add(this, "field", 0.00001, 3);

        const separationFolder = boidFolder.addFolder('Boid Separation');
        const alignmentFolder = boidFolder.addFolder('Boid Adhesion');
        const cohesionFolder = boidFolder.addFolder('Boid Cohesion');
        separationFolder.add(this, "minSeperation", 0, 1);
        separationFolder.add(this, "avoidFactor", 0, 1);
        alignmentFolder.add(this, "matchFactor", 0, 1);
        cohesionFolder.add(this, "centeringFactor", 0, 0.01);
    }

}
