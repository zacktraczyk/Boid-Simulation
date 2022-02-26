import * as THREE from 'three';

const geometry = new THREE.ConeGeometry(0.02, 0.08, 3);
const material = new THREE.MeshNormalMaterial();

export class Boid {

    constructor(x, y, z) {
        // Create Mesh
        this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(x, y, z);

        // Randomize velocity
        this.vel = new THREE.Vector3().randomDirection();

        this.maxSpeed = 0.02;
        // this.field = 1;
        this.field = 0.5;
        this.minSeperation = 0.08;

        this.centeringFactor = 0.0005 // scalar of force to push to center
        this.avoidFactor = 0.05;      // scalar of force to avoid
        this.matchFactor = 0.05;      // scalar of force to match directions
    }

    //
    // Draw Boid to canvas
    // boundary: a mesh that contains Boid
    // boids: array of Boid instances
    //
    // update(w, h, boids) {
    update(boundary, boids) {
        this.avoidOthers(boids)   // Seperation
        this.matchVelocity(boids) // Alignment
        this.moveCenter(boids)    // Cohesion

        this.limitSpeed()
        this.pushOnScreen(boundary)

        // Update positions
        this.mesh.position.addScaledVector(this.vel, 1);

        // Update direction
        const axis = new THREE.Vector3(0, 1, 0);
        this.mesh.quaternion.setFromUnitVectors(axis, this.vel.clone().normalize());
    }

    // Velocity Updaters ------------------------

    // 
    // Push for a minimum seperation from other Boids (seperation)
    // pre: boids is not null
    // boids: array of Boid instances
    //
    avoidOthers(boids) {
        if (boids == null)
            throw 'ERROR: Boid avoidOthers(boids): boids is undefined'

        let moveX = 0;
        let moveY = 0;
        let moveZ = 0;
        for (let otherBoid of boids) {
            if (otherBoid !== this) {
                if (this.distance(otherBoid) < this.minSeperation) {
                    moveX += this.vel.x - otherBoid.vel.x
                    moveY += this.vel.y - otherBoid.vel.y
                    moveZ += this.vel.z - otherBoid.vel.z
                }
            }
        }

        this.vel.x += moveX*this.avoidFactor
        this.vel.y += moveY*this.avoidFactor
        this.vel.z += moveZ*this.avoidFactor
    }

    //
    // Move in same direction as other boids (alignment)
    // Pre: boids is not null
    // boids: all boid instances
    //
    matchVelocity(boids) {
        if (boids == null)
            throw 'ERROR: Boid matchVelocity(boids): boids is undefined'

        let avgdx = 0
        let avgdy = 0
        let avgdz = 0
        let neighbors = 0
        for (let otherBoid of boids) {
            if (this.distance(otherBoid) < this.field) {
                avgdx += otherBoid.vel.x
                avgdy += otherBoid.vel.y
                avgdz += otherBoid.vel.z
                neighbors++
            }
        }

        // Compute averages and update velocity
        if (neighbors) {
            avgdx /= neighbors;
            avgdy /= neighbors;
            avgdz /= neighbors;

            this.vel.x += avgdx*this.matchFactor
            this.vel.y += avgdy*this.matchFactor
            this.vel.z += avgdz*this.matchFactor
        }
    }

    //
    // Move towards center of field (cohesion)
    //
    moveCenter(boids) {
        if (boids == null)
            throw 'ERROR: Boid matchVelocity(boids): boids is undefined'

        let centerX = 0
        let centerY = 0
        let centerZ = 0
        let neighbors = 0;

        for (let otherBoid of boids) {
            if (this.distance(otherBoid) < this.field) {
                centerX += otherBoid.mesh.position.x
                centerY += otherBoid.mesh.position.y
                centerZ += otherBoid.mesh.position.z
                neighbors++
            }
        }

        if (neighbors) {
            centerX /= neighbors
            centerY /= neighbors
            centerZ /= neighbors

            console.log(centerX, centerY, centerZ);

            this.vel.x += (centerX - this.mesh.position.x) * this.centeringFactor;
            this.vel.y += (centerY - this.mesh.position.y) * this.centeringFactor;
            this.vel.z += (centerZ - this.mesh.position.z) * this.centeringFactor;
        }
    }

    // Screen Border Rules ------------------------------

    //
    // Move from one offscreen one side onto the other
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    wrapScreen(boundary) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
            boundingBox.getSize(size);

        if (this.mesh.position.x > origin.x + size.x) this.mesh.position.x = origin.x;
        else if (this.mesh.position.x < origin.x) this.mesh.position.x = origin.x + size.x;

        if (this.mesh.position.y > origin.y + size.y) this.mesh.position.y = origin.y;
        else if (this.mesh.position.y < origin.y) this.mesh.position.y = origin.y + size.y;

        if (this.mesh.position.z > origin.z + size.z) this.mesh.position.z = origin.z;
        else if (this.mesh.position.z < origin.z) this.mesh.position.z = origin.z + size.z;
    }

    //
    // Push away from screen edge if within margin
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    pushOnScreen(boundary) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
            boundingBox.getSize(size);

        const margin = 0.3
        const turnFactor = 0.001

        // <++> NOTE: Should be using ThreeJS Methods to do this more simply
        // this.vel.addScaledVector( away from cube, turn factor);
        // x component
        if (this.mesh.position.x < origin.x + margin) this.vel.x += turnFactor;
        else if (this.mesh.position.x > origin.x + size.x - margin) this.vel.x -= turnFactor;

        // y component
        if (this.mesh.position.y < origin.y + margin) this.vel.y += turnFactor;
        else if (this.mesh.position.y > origin.y + size.y - margin) this.vel.y -= turnFactor;

        // z component
        if (this.mesh.position.z < origin.z + margin) this.vel.z += turnFactor;
        else if (this.mesh.position.z > origin.z + size.z - margin) this.vel.z -= turnFactor;


    }

    // Helper Functions --------------------------------

    //
    // Calculate Distance from an object
    // Pre: other is not null
    // other: instance containing properties x and y
    //
    distance(other) {
        if (other == null)
            throw 'ERROR: Boid distance(other): other is undefined'

        return this.mesh.position.distanceTo(other.mesh.position);
    }

    //
    // Randomize X and y position inside a given mesh
    // boundary: a mesh that the Boids will spawn inside
    //
    randomLocation(boundary) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
            boundingBox.getSize(size);

        const x = origin.x + Math.random()*size.x;
        const y = origin.y + Math.random()*size.y;
        const z = origin.z + Math.random()*size.z;
        console.log(x, y, z);
        this.mesh.position.set(x, y, z);
    }

    // 
    // Bound speed to maxSpeed
    //
    limitSpeed() {
        this.vel.clampLength(-this.maxSpeed, this.maxSpeed);
    }

    // Debug Functions --------------------------------

    // 
    // Draw Direction vector
    //
    dirDebug() {
        const dir = this.vel.clone().normalize();
        if (typeof this.dirArrow == 'undefined') {

            const origin = this.mesh.position;
            const length = 0.5;
            const hex = 0xff0000;

            this.dirArrow = new THREE.ArrowHelper( dir, origin, length, hex );
        }

        this.dirArrow.position.copy(this.mesh.position); // = this.mesh.position.x;
        this.dirArrow.setDirection(dir);
    }

    // 
    // Draw properties of Boid to canvas
    // w: screen width
    // h: screen height
    //
    debug() {
        const debug = document.getElementById("debug");
        this.mesh.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        debug.innerHTML = 
`<h3 style="text-align:center;text-decoration:underline">DEBUG</h3>
<p>Velocity: \<${this.vel.x.toFixed(3)}, ${this.vel.y.toFixed(3)}, ${this.vel.z.toFixed(3)}\></p>
<p>Speed: ${this.vel.length().toFixed(3)}</p>
<p>Position: \<${this.mesh.position.x.toFixed(3)}, ${this.mesh.position.y.toFixed(3)}, ${this.mesh.position.z.toFixed(3)}\></p>
`;
    }
}

export class BoidController {
    
    constructor(scene, boundary,  maxInst = 10){
        this._scene = scene;
        this._boundary = boundary;

        this.boids = new Array()
        this.maxInst = maxInst

        this.debug = false;
        this._debugBoid = null;
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
            let b = new Boid(0, 0, 0, 1);
            this._scene.add(b.mesh);
            b.randomLocation(this._boundary);
            this.boids.push(b)

            if (this.debug && this._debugBoid == null) {
                this._debugBoid = b;
                b.dirDebug();
                this._scene.add(b.dirArrow);
            }
        }
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
        });

        if (this.debug) {
            this._debugBoid.debug();
            this._debugBoid.dirDebug(this._boundary);
        }
    }
}
