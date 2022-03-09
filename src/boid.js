import * as THREE from 'three';

//
// A single Boid
//
export class Boid {

    constructor(x, y, z, mesh) {
        // Create Mesh
        this.mesh = mesh;
        this.mesh.position.set(x, y, z);

        // Randomize velocity
        this.axis = new THREE.Vector3(0, 0, 1); // direction to face
        this.vel = new THREE.Vector3().randomDirection();

        this.maxSpeed = 0.2;
        this.maxSpeedY = 0.05;


        this.field = 4;
        this.minSeperation = 4.3;

        this.centeringFactor = 0.005 // scalar of force to push to center
        this.avoidFactor = 0.5;      // scalar of force to avoid
        this.matchFactor = 0.5;      // scalar of force to match directions

        // this.boundary.origin         // boundary rectangle origin (Vector3)
        // this.boundary.size           // boundary rectangel dimensions (Vector3)
        this.margin = 9              // distance from wall to start applying
                                     // turn factor
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
        this.mesh.quaternion.setFromUnitVectors(this.axis, this.vel.clone().normalize());
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

        // Update direction
        const axis = new THREE.Vector3(0, 1, 0); // Top of mesh goes forward
        this.mesh.quaternion.setFromUnitVectors(axis, this.vel.clone().normalize());
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
            const length = 5;
            const hex = 0xff0000;

            this.dirArrow = new THREE.ArrowHelper( dir, origin, length, hex );
        }

        this.dirArrow.position.copy(this.mesh.position); // = this.mesh.position.x;
        this.dirArrow.setDirection(dir);
    }

    fieldDebug() {
        if (typeof this.fieldSphere == 'undefined') {
            const sphereGeometry = new THREE.SphereGeometry(this.field, 32, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3 });
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
        debug.innerHTML = 
`<h3 style="text-align:center;text-decoration:underline">DEBUG</h3>
<p>Velocity: \<${this.vel.x.toFixed(3)}, ${this.vel.y.toFixed(3)}, ${this.vel.z.toFixed(3)}\></p>
<p>Speed: ${this.vel.length().toFixed(3)}</p>
<p>Position: \<${this.mesh.position.x.toFixed(3)}, ${this.mesh.position.y.toFixed(3)}, ${this.mesh.position.z.toFixed(3)}\></p>
`;
    }
}
