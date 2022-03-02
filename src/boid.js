import * as THREE from 'three';
const geometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);    // Boid Geometry
const material = new THREE.MeshBasicMaterial();             // Boid Material
// const material = new THREE.MeshStandardMaterial();             // Boid Material

//
// A single Boid
//
export class Boid {

    constructor(x, y, z) {
        // Create Mesh
        this.mesh = new THREE.Mesh( geometry, material);
        this.mesh.position.set(x, y, z);

        // Randomize velocity
        this.vel = new THREE.Vector3().randomDirection();

        this.maxSpeed = 0.02;
        this.maxSpeedY = 0.005;

        this.field = 0.4;
        this.minSeperation = 0.13;

        this.centeringFactor = 0.0005 // scalar of force to push to center
        this.avoidFactor = 0.05;      // scalar of force to avoid
        this.matchFactor = 0.05;      // scalar of force to match directions

        this.margin = 0.35            // distance from wall to start applying
                                      // turn factor
        // this.turnFactor = 0.0012      // force to apply away from wall
        // turn factor changed with speed
    }

    //
    // Draw Boid to canvas
    // boundary: a mesh that contains Boid
    // boids: array of Boid instances
    //
    // update(w, h, boids) {
    update(boundary, boids) {
        if (this.maxSpeed == 0) return;

        this.sim(boids);

        this.limitSpeed();
        this.limitVelY();
        this.pushOnScreen(boundary);

        // Update positions
        this.mesh.position.add(this.vel);

        // Update direction
        const axis = new THREE.Vector3(0, 1, 0); // Top of mesh goes forward
        this.mesh.quaternion.setFromUnitVectors(axis, this.vel.clone().normalize());
    }

    // Velocity Updaters ------------------------

    //
    // Performs all Velocity updates in one loop;
    // combination of this.avoidOthers, this.matchVelocity, and this.moveCenter
    //
    sim(boids) {

        let neighbors = 0;
        let match = new THREE.Vector3();
        let center = new THREE.Vector3();
        for (let otherBoid of boids) {
            if (this.distance(otherBoid) >= this.field) continue;

            neighbors++;

            // Avoid Others (separation)
            if (otherBoid !== this && this.distance(otherBoid) < this.minSeperation) {
                let avoid = this.vel.clone().sub(otherBoid.vel)
                this.vel.addScaledVector(avoid, this.avoidFactor); // apply avoid force
            }

            // Match (alignment)
            match.add(otherBoid.vel)

            // Center (cohesion)
            center.add(otherBoid.mesh.position);
        }

        // Apply Match Force
        match.add(this.vel);
        match.divideScalar(neighbors);
        this.vel.addScaledVector(match, this.matchFactor);

        // Apply Center Force
        center.divideScalar(neighbors);
        center.sub(this.mesh.position);
        this.vel.addScaledVector(center, this.centeringFactor);
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
        this.turnFactor = this.maxSpeed/15; // Adjust turnFactor with speed

        // x component
        if (this.mesh.position.x < origin.x + this.margin)
            this.vel.x += this.turnFactor;
        else if (this.mesh.position.x > origin.x + size.x - this.margin)
            this.vel.x -= this.turnFactor;

        // y component
        if (this.mesh.position.y < origin.y + this.margin)
            this.vel.y += this.turnFactor;
        else if (this.mesh.position.y > origin.y + size.y - this.margin)
            this.vel.y -= this.turnFactor;

        // z component
        if (this.mesh.position.z < origin.z + this.margin)
            this.vel.z += this.turnFactor;
        else if (this.mesh.position.z > origin.z + size.z - this.margin)
            this.vel.z -= this.turnFactor;
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
        this.mesh.position.set(x, y, z);
        this.vel.randomDirection();
    }

    // 
    // Bound speed to maxSpeed
    //
    limitSpeed() {
        if (this.maxSpeed != 0)
            this.vel.clampLength(-this.maxSpeed, this.maxSpeed);
    }

    // 
    // Bound y velocity to maxZ
    //
    limitVelY() {
        if (this.vel.y > 0)
            this.vel.y = this.vel.y > this.maxSpeedY ? this.maxSpeedY : this.vel.y;
        else 
            this.vel.y = this.vel.y < -this.maxSpeedY ? -this.maxSpeedY : this.vel.y;
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

    fieldDebug() {
        if (typeof this.fieldSphere == 'undefined') {
            const sphereGeometry = new THREE.SphereGeometry(this.field, 32, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
            this.fieldSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        }

        this.fieldSphere.position.copy(this.mesh.position);
        this.fieldSphere.scale.set(this.field, this.field, this.field);
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

//
// Controls a group of Boids
//
export class BoidController {

    constructor(scene, boundary,  maxInst = 10){
        this._scene = scene;
        this._boundary = boundary;

        this.boids = new Array()
        this.maxInst = maxInst

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
            let b = new Boid(0, 0, 0, 1);
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
            this._debugBoid.mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            this._debugBoid.dirArrow.visible = false;
        }
    }

    updateProperties(boid) {
        boid.maxSpeed = this.maxSpeed;
        boid.maxSpeedY = this.maxSpeedY;

        boid.field = this.field;
        boid.minSeperation = this.minSeperation;

        boid.centeringFactor = this.centeringFactor;
        boid.avoidFactor = this.avoidFactor;
        boid.matchFactor = this.matchFactor;
    }
}
