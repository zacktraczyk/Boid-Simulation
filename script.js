// REQUIRES: player.js io.js
const c = document.getElementById('canvas')
const ctx = c.getContext('2d')

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

let Boids, target
let I

function Init() {
    let { w, h } = resizeWindow()

    target = new Target(w/2, h/2)

    Boids = new BoidController(1000) // Number of Boids
    Boids.spawn(w, h)

    // Setup Keyboard Input
    I = new IO()
    I.addKeyListeners();

    loop()
}

function update() {
    target.move(w, h, I.keyState)
    Boids.move(w, h)
}

function draw(w, h) {
    ctx.clearRect(0, h, w, h)
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, w, h)

    target.draw()
    Boids.draw(w, h)
}

function loop() {
    let { w, h } = resizeWindow()

    update()
    draw(w, h)

    requestAnimationFrame(loop)
}

function resizeWindow() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    w = window.innerWidth
    h = window.innerHeight

    return { w, h }
}

class Target {
    constructor(x, y) {
        this.x = x
        this.y = y

        this.w = 20

        this.color = "black"
    }

    randomLocation(w, h) {
        if (w == null || h == null) {
            w = 500
            h = 500
        }

        let rand = Math.random()
        this.x = rand*w
        rand = Math.random()
        this.y = rand*h

    }

    move(w, h, dir) {
        if (dir.right) this.x += 15
        if (dir.left) this.x -= 15
        if (dir.up) this.y -= 15
        if (dir.down) this.y += 15

    }

    draw() {
        ctx.color = this.color
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.w, 0, 2 * Math.PI)
        ctx.fill()
        // ctx.stroke()
    }
}

class BoidController {

    constructor(maxInst){
        this.boids = new Array()
        this.maxInst = maxInst
    }

    spawn(w, h) {
        for (let i = 0; i < this.maxInst; i++) { 
            let b = new Boid(10, 10, 30, 30)
            b.randomLocation(w, h)
            b.target = target
            this.boids.push(b)
        }
    }

    draw(w, h) {
        this.boids.forEach(b => b.draw(w, h))
        // this.instances.forEach(b => b.targetDebug()) // temp
    }

    move(w, h) {
        this.boids.forEach(b => b.move(w, h, this.boids))
    }

    // move(w, h){
    //     for (let i = 0; i < this.boids.length; i++) { // each Boid
    //         let b = this.boids[i]
    //         b.target.x = 0 
    //         b.target.y = 0 
    //         let infield = 0
            
    //                 let avoidx = b.x - o.x
    //                 let avoidy = b.y - o.y
    //         // Avoid
    //         for (let j = 0; j < this.instances.length; j++) { // each Boid
    //             if (j == i) continue // not itself
    //             let o = this.instances[j]

    //             let xdiff = b.x - o.x
    //             let ydiff = b.y - o.y
    //             let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

    //             if (distance < b.field) {
    //                 b.target.x += o.x
    //                 b.target.y += o.y
    //                 infield++;


    //                 // Move in same direction
    //                 let subx = o.xdir - b.xdir
    //                 let suby = o.ydir - b.ydir
    //                 b.xdir += subx*matchingFactor
    //                 b.ydir += suby*matchingFactor
    //                 b.normalizeDir()

    //                 // Calculate angle
    //                 let d = b.xdir*(xdiff/distance) + b.ydir*(ydiff/distance)
    //                 let angle = Math.acos(d)
    //                 if (angle < b.peripheral) continue // skip bc behind

    //                 // Avoid

    //                 b.xdir -= avoidxdir*matchingFactor
    //                 b.ydir -= avoidydir*matchingFactor
    //                 b.normalizeDir()

    //                 o.avoidDebug(w, h, avoidxdir, avoidydir)
    //             }
    //         }

    //         if (infield > 0) b.target.x /= infield
    //         if (infield > 0) b.target.y /= infield
    //         b.move(w, h)

    //     }

    // }
}

class Boid {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w

        this.angle = 0 // radians

        this.dy = 1
        this.dx = 0

        this.maxSpeed = 15
        this.field = 200

        this.minSeperation = 40

        this.peripheral = 1.6 //angle

        this.centeringFactor = 0.005
        this.avoidFactor = 0.05
        this.matchFactor = 0.05

        this.target = { x:0, y:0, w:0 }
        this.color = '#ffd6cc'
    }

    randomLocation(w, h) {
        if (w == null || h == null) {
            w = 500
            h = 500
        }

        let rand = Math.random()
        this.x = rand*w
        rand = Math.random()
        this.y = rand*h

    }

    getColor(w, h) {
        return `rgb(${(this.x/w)*255}, ${(this.y/h)*255}, ${(this.x/(w*2) + this.y/(h*2))*255})`
    }

    draw(w, h) {
        const mag = Math.sqrt(this.dx*this.dx + this.dy*this.dy)
        const xdir = this.dx/mag
        const ydir = this.dy/mag

        ctx.fillStyle = this.getColor(w, h)
        ctx.beginPath()
        ctx.moveTo(this.x + this.w*xdir, this.y + this.w*ydir)
        ctx.lineTo(this.x - this.w/4*ydir, this.y + this.w/4*xdir)
        ctx.lineTo(this.x + this.w/4*ydir, this.y - this.w/4*xdir)
        ctx.fill();

        // this.targetDebug(xdir, ydir)
        // ctx.color = "black"
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.field, 0, 2 * Math.PI);
        // ctx.stroke();
    }

    avoidTarget() {
        let d = this.distance(this.target)
        if (d < this.target.w*2) {
            this.dx -= (this.target.x - this.x)
            this.dy -= (this.target.y - this.y)
        }
    }

    distance(otherBoid) {
        let diffx = this.x - otherBoid.x
        let diffy = this.y - otherBoid.y

        return Math.sqrt(diffx*diffx + diffy*diffy)
    }

    matchVelocity(boids) {
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

        if (neighbors) {
            avgdx /= neighbors;
            avgdy /= neighbors;

            this.dx += (avgdx - this.dx)*this.matchFactor
            this.dy += (avgdy - this.dy)*this.matchFactor
        }
    }

    moveCenter(boids) {
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

    avoidOthers(boids) {
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

    move(w, h, boids) {
        this.matchVelocity(boids)
        this.avoidOthers(boids)
        this.avoidTarget()
        this.moveCenter(boids)
        this.limitSpeed(boids)
        this.pushOnScreen(w, h)
        // this.wrapScreen(w, h)

        this.x += this.dx
        this.y += this.dy
    }

    limitSpeed() {
        const speed = Math.sqrt(this.dx*this.dx + this.dy*this.dy)

        if (speed > this.maxSpeed) {
            this.dx = (this.dx / speed) * this.maxSpeed;
            this.dy = (this.dy / speed) * this.maxSpeed;
        }
    }

    wrapScreen(w, h) {
        if (this.x > w + 2) this.x = 0
        else if (this.x < -2) this.x = w
        if (this.y > h + 2) this.y = 0
        else if (this.y < -2) this.y = h
    }

    pushOnScreen(w, h) {
        const margin = 400
        const turnFactor = 2 

        if (this.x < margin) this.dx += turnFactor
        if (this.x > w - margin) this.dx -= turnFactor
        if (this.y < margin) this.dy += turnFactor
        if (this.y > h - margin) this.dy -= turnFactor
    }

    lockOnScreen(w, h) {
        this.x = clamp(this.x, this.w/2 + 5, w - this.w/2 - 5)
        this.y = clamp(this.y, this.h/2 + 5, h - this.h/2 - 5)
    }

    targetDebug(xdir, ydir) {
        // TARGET LINE
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + xdir*this.field, this.y + ydir*this.field)
        ctx.stroke()
    }

    avoidDebug(w, h) {
        // TARGET LINE
        // ctx.color = 'black'
        // let angle = Math.acos(this.xdir*1)
        // let xdir = Math.cos(this.peripheral + angle)
        // let ydir = Math.sin(this.peripheral + angle)
        // ctx.beginPath()
        // ctx.moveTo(this.x, this.y)
        // ctx.lineTo(this.x + xdir*this.field, this.y + ydir*this.field)
        // ctx.stroke()
    }

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

class IO {

    constructor() {
        this.xmouse = 0
        this.ymouse = 0
        this.mouseDown = false

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


    addKeyListeners() {
        document.addEventListener("keydown", this.keyDownHandler, false);
        document.addEventListener("keyup", this.keyUpHandler, false);
    }

    keyDownHandler(e) {
        let key = I.keyMap[e.keyCode] // THIS IS HORRENDOUS
        I.keyState[key] = true // ALSO THIS (I reference)
        // if (e.keyCode == 77 && monce) muteSound(); //Mute
        // else if (e.keyCode == 88 && cool === 0 && power > 0) attackx = true; //Special Regenerate
    }

    keyUpHandler(e) {
        let key = I.keyMap[e.keyCode] // THIS IS HORRENDOUS AS AWELL
        I.keyState[key] = false // GOD HELP ME
    }

    mousePosition(event) {
        I.xmouse = event.x - c.offsetLeft // ALSO BAD
        I.ymouse = event.y - c.offsetTop // REAL BAD
        I.mouseDown = true

    }

    addMouseListener() {
        document.addEventListener("click", this.mousePosition, false);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    Init()
})

