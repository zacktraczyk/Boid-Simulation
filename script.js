// Initialize -------------------------------- 

const c = document.getElementById('canvas')
const ctx = c.getContext('2d')

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


let Boids, target
const numBoids = 800;

let I // IO

// Create Boids, target, and IO
function Init() {
    let { w, h } = resizeWindow()

    target = new Target(w/2, h/2)

    Boids = new BoidController(numBoids) // Number of Boids
    Boids.spawn(w, h)

    // Setup Keyboard Input
    I = new IO()
    I.addKeyListeners();

    loop() // main loop
}

// Main Animation loop -------------------------------- 

//
// Main Animation loop
//
function loop() {
    let { w, h } = resizeWindow()

    update()
    draw(w, h)

    requestAnimationFrame(loop)
}

// Update instances
function update() {
    target.update(I.keyState)
    Boids.update(w, h)
}

// Draw instanes to canvas
function draw(w, h) {
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, w, h)

    target.draw()
    Boids.draw(w, h)
}

// Resize Window
function resizeWindow() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    w = window.innerWidth
    h = window.innerHeight

    return { w, h }
}

// Scene Objects ---------------------------------------

//
// Target(x, y)
// x: spawn location x
// y: spawn location y
//
// The target is a black dot that can be moved around
// when passed user input. Boids collide with target
// objects.
//
class Target {

    constructor(x, y) {
        this.x = x
        this.y = y

        this.w = 20

        this.color = "black"
    }

    //
    // Move Target in given direction if given input object literal
    // Pre: dir is a valid direction object literal
    // dir: an object literal containing the 4 boolaen directions
    //      ideally (IO.keyState)
    //
    update(dir) {
        if (dir.right) this.x += 15
        if (dir.left) this.x -= 15
        if (dir.up) this.y -= 15
        if (dir.down) this.y += 15

    }

    //
    // Draws Target to canvas
    //
    draw() {
        ctx.color = this.color
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.w, 0, 2 * Math.PI)
        ctx.fill()
    }

    // Helper Functions --------------------------------

    //
    // Randomize X and y position
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    randomLocation(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Target randomLocation(w, h): w or h is undefined'

        this.x = Math.random()*w
        this.y = Math.random()*h
    }

}

//
// BoidController(maxInst)
// maxInst: maiximum number of instances
//
// Controls all Boid instances on the screen, 3 main
// purposes: spawn (create) all instances, draw all 
// instances, and move all instances.
//
class BoidController {

    constructor(maxInst){
        this.boids = new Array()
        this.maxInst = maxInst
    }

    //
    // Spawns all Boid Instances at random locations
    // Pre: w and h are not null
    //
    spawn(w, h) {
        if (w == null || h == null)
            throw 'ERROR: BoidController spawn(w, h): w or h is undefined'

        for (let i = 0; i < this.maxInst; i++) { 
            let b = new Boid(10, 10, 10)
            b.randomLocation(w, h)
            b.target = target // ugly, watch out for this
            this.boids.push(b)
        }
    }

    //
    // Calls Move for each Boid Instance
    // Pre: w and h are not null
    //
    update(w, h) {
        if (w == null || h == null)
            throw 'ERROR: BoidController update(w, h): w or h is undefined'

        this.boids.forEach(b => b.update(w, h, this.boids))
    }

    //
    // Draws all Boid Instanes to the screen
    // Pre: w and h are not null
    //
    draw(w, h) {
        if (w == null || h == null)
            throw 'ERROR: BoidController draw(w, h): w or h is undefined'

        this.boids.forEach(b => b.draw(w, h))
    }
}

//
// Boid(x, y, w, h)
// x: spawn location x
// y: spawn location y
// w: size of boid
//
// A Boid, little arrow guy that flocks like birds.
// Dictated by three rules: coherence, separation,
// alignment.
//
class Boid {

    constructor(x, y, w) {
        this.x = x
        this.y = y
        this.w = w + 5*Math.random() // varry in size

        this.dx = 0 // velocity x component
        this.dy = 1 // velocity y component

        this.maxSpeed = 3 
        this.field = 50
        this.minSeperation = 10

        this.centeringFactor = 0.005 // scalar of force to push to center
        this.avoidFactor = 0.05      // scalar of force to avoid
        this.matchFactor = 0.05      // scalar of force to match directions

        this.target = { x:0, y:0, w:0 }
        this.color = '#ffd6cc'
    }

    //
    // Draw Boid to canvas
    // Pre: w and h and boids are not null
    // w: screen width
    // h: screen height
    // boids: array of Boid instances
    //
    update(w, h, boids) {
        if (w == null || h == null || boids == null)
            throw 'ERROR: Boid update(w, h, boids): w or h or boids is undefined'

        this.avoidOthers(boids) // Seperation
        this.matchVelocity(boids) // Alignment
        this.moveCenter(boids) // Cohesion

        this.avoidTarget()

        this.limitSpeed(boids)
        this.pushOnScreen(w, h)

        // Update positions
        this.x += this.dx
        this.y += this.dy
    }

    //
    // Draw Boid to canvas
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    draw(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid draw(w, h): w or h is undefined'

        const mag = Math.sqrt(this.dx*this.dx + this.dy*this.dy)
        const xdir = this.dx/mag
        const ydir = this.dy/mag

        ctx.fillStyle = this.getColor(w, h)
        ctx.beginPath()
        ctx.moveTo(this.x + this.w*xdir, this.y + this.w*ydir)
        ctx.lineTo(this.x - this.w/4*ydir, this.y + this.w/4*xdir)
        ctx.lineTo(this.x + this.w/4*ydir, this.y - this.w/4*xdir)
        ctx.fill();

        // Debug ---

        // Direction Line Indicator
        // this.targetDebug(xdir, ydir)

        // Field Circle Indicator
        // ctx.color = "black"
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.field, 0, 2 * Math.PI);
        // ctx.stroke();
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
        for (let otherBoid of boids) {
            if (otherBoid !== this) {
                if (this.distance(otherBoid) < this.minSeperation) {
                    moveX += this.x - otherBoid.x
                    moveY += this.y - otherBoid.y
                }
            }
        }

        this.dx += moveX*this.avoidFactor
        this.dy += moveY*this.avoidFactor
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
        let neighbors = 0
        for (let otherBoid of boids) {
            if (this.distance(otherBoid) < this.field) {
                avgdx += otherBoid.dx
                avgdy += otherBoid.dy
                neighbors++
            }
        }

        // Compute averages and update velocity
        if (neighbors) {
            avgdx /= neighbors;
            avgdy /= neighbors;

            this.dx += (avgdx - this.dx)*this.matchFactor
            this.dy += (avgdy - this.dy)*this.matchFactor
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
        let neighbors = 0;

        for (let otherBoid of boids) {
            if (this.distance(otherBoid) < this.field) {
                centerX += otherBoid.x
                centerY += otherBoid.y
                neighbors++
            }
        }

        if (neighbors) {
            centerX /= neighbors
            centerY /= neighbors

            this.dx += (centerX - this.x) * this.centeringFactor;
            this.dy += (centerY - this.y) * this.centeringFactor;
        }
    }

    // 
    // Push Boid away from this.target
    // Pre: target property is not null
    //
    avoidTarget() {
        if (this.target == null)
            throw 'ERROR: Boid avoidTarget(): this.target is undefined'

        let d = this.distance(this.target)
        if (d < this.target.w*2) {
            this.dx -= (this.target.x - this.x)*this.avoidFactor;
            this.dy -= (this.target.y - this.y)*this.avoidFactor;
        }
    }

    // Screen Border Rules ------------------------------

    //
    // Move from one offscreen one side onto the other
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    wrapScreen(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid wrapScreen(w, h): w or h is undefined'

        if (this.x > w + 2) this.x = 0
        else if (this.x < -2) this.x = w
        if (this.y > h + 2) this.y = 0
        else if (this.y < -2) this.y = h
    }

    //
    // Push away from screen edge if within margin
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    pushOnScreen(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid pushOnScreen(w, h): w or h is undefined'

        const margin = 50
        const turnFactor = 2 

        if (this.x < margin) this.dx += turnFactor
        if (this.x > w - margin) this.dx -= turnFactor
        if (this.y < margin) this.dy += turnFactor
        if (this.y > h - margin) this.dy -= turnFactor
    }

    //
    // Don't let X and Y exceed screen limits
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    lockOnScreen(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid lockOnScreen(w, h): w or h is undefined'

        this.x = clamp(this.x, this.w/2 + 5, w - this.w/2 - 5)
        this.y = clamp(this.y, this.h/2 + 5, h - this.h/2 - 5)
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

        let diffx = this.x - other.x
        let diffy = this.y - other.y

        return Math.sqrt(diffx*diffx + diffy*diffy)
    }

    // 
    // Return a color based on the position relative to the screen
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    getColor(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid getColor(w, h): w or h is undefined'

        return `rgb(${(this.x/w)*255}, ${(this.y/h)*255}, ${(this.x/(w*2) + this.y/(h*2))*255})`
    }

    //
    // Randomize X and y position
    // Pre: w and h are not null
    // w: screen width
    // h: screen height
    //
    randomLocation(w, h) {
        if (w == null || h == null)
            throw 'ERROR: Boid randomLocation(w, h): w or h is undefined'

        let rand = Math.random()
        this.x = rand*w
        rand = Math.random()
        this.y = rand*h

    }

    // 
    // Bound speed to maxSpeed
    //
    limitSpeed() {
        const speed = Math.sqrt(this.dx*this.dx + this.dy*this.dy)

        if (speed > this.maxSpeed) {
            this.dx = (this.dx / speed) * this.maxSpeed;
            this.dy = (this.dy / speed) * this.maxSpeed;
        }
    }

    // Debug Functions --------------------------------

    // 
    // Draw Direction vector
    // xdir: normalized xcomponent
    // ydir: normalized ycomponent
    //
    targetDebug(xdir, ydir) {
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + xdir*this.field, this.y + ydir*this.field)
        ctx.stroke()
    }

    // 
    // Draw properties of Boid to canvas
    // w: screen width
    // h: screen height
    //
    debug(w, h) {
        ctx.font = "20px Arial Bold"
        ctx.color = "black"
        
        let x = 40
        let y = h*6/8 + 100

        ctx.fillText("xdir, ydir: " + this.xdir.toFixed(2) + " " + this.ydir.toFixed(2), x, y)
        y += 20
        ctx.fillText("xvel, yvel: " + this.xvel.toFixed(2) + " " + this.yvel.toFixed(2), x, y)
        y += 20
        ctx.fillText("targetx, targety: " + this.target.x.toFixed(2) + " " + this.target.y.toFixed(2), x, y)
    }
}

//
// IO()
//
// Input handler, handles mouse and keyboard events.
//
class IO {

    constructor() {
        this.xmouse = 0
        this.ymouse = 0
        this.mouseDown = false

        // keyState is passed to other functions that
        // rely on key events
        this.keyState = {
            right: false,
            up: false,
            left: false,
            down: false,

            attack: false,
            push: false,

            pause: false,
        }

        this.keyMap = {
            // arrow
            39: 'right',
            38: 'up',
            37: 'left',
            40: 'down',

            // wasd
            68: 'right',
            87: 'up',
            65: 'left',
            83: 'down',

            32: 'attack',
            81: 'push',

            80: 'pause',
        }

    }

    // 
    // Update keyState property to true (down) for given e keycode
    // according to keyMap
    // e: event
    //
    keyDownHandler(e) {
        let key = I.keyMap[e.keyCode]
        I.keyState[key] = true
    }

    // 
    // Update keyState property to false (up) for given e keycode
    // according to keyMap
    // e: event
    //
    keyUpHandler(e) {
        let key = I.keyMap[e.keyCode]
        I.keyState[key] = false
    }

    // 
    // Update Mouse position
    //
    mousePosition(event) {
        I.xmouse = event.x - c.offsetLeft
        I.ymouse = event.y - c.offsetTop
        I.mouseDown = true
    }

    //
    // Add Keyboard Event Listeners
    //
    addKeyListeners() {
        document.addEventListener("keydown", this.keyDownHandler, false);
        document.addEventListener("keyup", this.keyUpHandler, false);
    }

    //
    // Add Mouse Event Listeners
    //
    addMouseListener() {
        document.addEventListener("click", this.mousePosition, false);
    }
}

//
// Initalize when page loaded
//
window.addEventListener('DOMContentLoaded', () => {
    Init()
})
