import * as THREE from 'three';
//
// A single Boid
//
export class Boid {

    public mesh: THREE.Mesh;

    // Direction
    private axis: THREE.Vector3;
    private vel: THREE.Vector3;

    // Boid Attributes
    public attributes: Attributes;

    // Debug
    private dirArrow: THREE.ArrowHelper;
    private fieldSphere: THREE.Mesh;

    constructor(x: number, y: number, z: number, mesh: THREE.Mesh) {
        // Create Mesh
        this.mesh = mesh;
        this.mesh.position.set(x, y, z);

        // Randomize velocity
        this.axis = new THREE.Vector3(0, 0, 1); // direction to face
        this.vel = new THREE.Vector3().randomDirection();

        // Boid Attribute Defaults
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

        // Debug
        const origin = this.mesh.position;
        const length = 5;
        const hex = 0xff0000;
        this.dirArrow = new THREE.ArrowHelper(this.vel, origin, length, hex);

        const sphereGeometry = new THREE.SphereGeometry(this.attributes.field, 32, 16); 
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3 });
        this.fieldSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    }

    //
    // Draw Boid to canvas
    // boundary: a mesh that contains Boid
    // boids: array of Boid instances
    //
    public update(boundary: THREE.LineSegments, boids: Array<Boid>) {
        if (this.attributes.maxSpeed == 0) return;

        this.sim(boids);
        this.limitSpeed();
        this.limitVelY();
        this.pushOnScreen(boundary);

        // Update positions
        this.mesh.position.add(this.vel);

        // Update direction
        const dir = this.vel.clone();
        dir.setY(0); // lock on y plane
        dir.normalize();
        this.mesh.quaternion.setFromUnitVectors(this.axis, dir);
    }

    // Velocity Updaters ------------------------

    //
    // Performs all Velocity updates in one loop;
    // combination of this.avoidOthers, this.matchVelocity, and this.moveCenter
    //
    private sim(boids: Array<Boid>): void {
        let neighbors = 0;
        let match = new THREE.Vector3();
        let center = new THREE.Vector3();
        for (let otherBoid of boids) {
            if (this.distance(otherBoid) >= this.attributes.field) continue;

            neighbors++;

            // Avoid Others (separation)
            if (otherBoid !== this && this.distance(otherBoid) < this.attributes.minSeperation) {
                let avoid = this.vel.clone().sub(otherBoid.vel)
                this.vel.addScaledVector(avoid, this.attributes.avoidFactor); // apply avoid force
            }

            // Match (alignment)
            match.add(otherBoid.vel)

            // Center (cohesion)
            center.add(otherBoid.mesh.position);
        }

        // Apply Match Force
        match.add(this.vel);
        match.divideScalar(neighbors);
        this.vel.addScaledVector(match, this.attributes.matchFactor);

        // Apply Center Force
        center.divideScalar(neighbors);
        center.sub(this.mesh.position);
        this.vel.addScaledVector(center, this.attributes.centeringFactor);
    }

    // Screen Border Rules ------------------------------

    //
    // Move from one offscreen one side onto the other
    //
    // private wrapScreen(boundary: THREE.LineSegments): void {
    //     const boundingBox = new THREE.Box3().setFromObject(boundary);
    //     const origin = boundingBox.min;
    //     const size = new THREE.Vector3();
    //     boundingBox.getSize(size);

    //     if (this.mesh.position.x > origin.x + size.x) this.mesh.position.x = origin.x;
    //     else if (this.mesh.position.x < origin.x) this.mesh.position.x = origin.x + size.x;

    //     if (this.mesh.position.y > origin.y + size.y) this.mesh.position.y = origin.y;
    //     else if (this.mesh.position.y < origin.y) this.mesh.position.y = origin.y + size.y;

    //     if (this.mesh.position.z > origin.z + size.z) this.mesh.position.z = origin.z;
    //     else if (this.mesh.position.z < origin.z) this.mesh.position.z = origin.z + size.z;
    // }

    //
    // Push away from screen edge if within margin
    //
    private pushOnScreen(boundary: THREE.LineSegments) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        this.attributes.turnFactor = this.attributes.maxSpeed / 15; // Adjust turnFactor with speed

        // x component
        if (this.mesh.position.x < origin.x + this.attributes.margin)
            this.vel.x += this.attributes.turnFactor;
        else if (this.mesh.position.x > origin.x + size.x - this.attributes.margin)
            this.vel.x -= this.attributes.turnFactor;

        // y component
        if (this.mesh.position.y < origin.y + this.attributes.margin)
            this.vel.y += this.attributes.turnFactor;
        else if (this.mesh.position.y > origin.y + size.y - this.attributes.margin)
            this.vel.y -= this.attributes.turnFactor;

        // z component
        if (this.mesh.position.z < origin.z + this.attributes.margin)
            this.vel.z += this.attributes.turnFactor;
        else if (this.mesh.position.z > origin.z + size.z - this.attributes.margin)
            this.vel.z -= this.attributes.turnFactor;
    }

    // Helper Functions --------------------------------

    //
    // Calculate Distance from an object
    // Pre: other is not null
    // other: instance containing properties x and y
    //
    private distance(other: Boid): number {
        if (other == null)
            throw 'ERROR: Boid distance(other): other is undefined'

        return this.mesh.position.distanceTo(other.mesh.position);
    }

    //
    // Randomize X and y position inside a given mesh
    // boundary: a mesh that the Boids will spawn inside
    //
    public randomLocation(boundary: THREE.LineSegments) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const x = origin.x + Math.random() * size.x;
        const y = origin.y + Math.random() * size.y;
        const z = origin.z + Math.random() * size.z;
        this.mesh.position.set(x, y, z);
        this.vel.randomDirection();

        // Update direction
        const axis = new THREE.Vector3(0, 1, 0); // Top of mesh goes forward
        this.mesh.quaternion.setFromUnitVectors(axis, this.vel.clone().normalize());
    }

    // 
    // Bound speed to maxSpeed
    //
    private limitSpeed(): void {
        if (this.attributes.maxSpeed != 0)
            this.vel.clampLength(-this.attributes.maxSpeed, this.attributes.maxSpeed);
    }

    // 
    // Bound y velocity to maxZ
    //
    private limitVelY(): void {
        if (this.vel.y > 0)
            this.vel.y = this.vel.y > this.attributes.maxSpeedY ? this.attributes.maxSpeedY : this.vel.y;
        else
            this.vel.y = this.vel.y < -this.attributes.maxSpeedY ? -this.attributes.maxSpeedY : this.vel.y;
    }

    // Debug Functions --------------------------------

    // 
    // Draw Direction vector
    //
    public dirDebug() {
        const dir = this.vel.clone().normalize();
        this.dirArrow.position.copy(this.mesh.position); // = this.mesh.position.x;
        this.dirArrow.setDirection(dir);
    }

    public fieldDebug() {
        this.fieldSphere.position.copy(this.mesh.position);
        this.fieldSphere.scale.set(this.attributes.field, this.attributes.field, this.attributes.field);
    }

    // 
    // Draw properties of Boid to canvas
    // w: screen width
    // h: screen height
    //
    public debug(): void {
        const debug = document.getElementById("debug");
        if (debug)
            debug.innerHTML =
                `<h3 style="text-align:center;text-decoration:underline">DEBUG</h3>
<p>Velocity: \<${this.vel.x.toFixed(3)}, ${this.vel.y.toFixed(3)}, ${this.vel.z.toFixed(3)}\></p>
<p>Speed: ${this.vel.length().toFixed(3)}</p>
<p>Position: \<${this.mesh.position.x.toFixed(3)}, ${this.mesh.position.y.toFixed(3)}, ${this.mesh.position.z.toFixed(3)}\></p>
`;
    }
}