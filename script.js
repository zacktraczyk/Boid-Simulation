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
    Boids.spawn(w, h, target)

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
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, w, h)

    target.draw()
    Boids.draw()
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
        if (dir.right) this.x += 5
        if (dir.left) this.x -= 5
        if (dir.up) this.y -= 5
        if (dir.down) this.y += 5

    }

    draw() {
        ctx.color = this.color
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

class BoidController {

    constructor(maxInst){
        this.instances = new Array()
        this.maxInst = maxInst
    }

    spawn(w, h, t) {
        for (let i = 0; i < this.maxInst; i++) { 
            let b = new Boid(10, 10, 30, 30)
            b.randomLocation(w, h)
            b.target = t
            this.instances.push(b)
        }

        // let b = new Boid(w/4, h/2, 30, 30)
        // b.target = t
        // this.instances.push(b)

        // b = new Boid(w*3/4, h/2, 30, 30)
        // b.target = t
        // this.instances.push(b)
    }

    draw() {
        this.instances.forEach(b => b.draw())
        // this.instances.forEach(b => b.targetDebug()) // temp
    }

    move(w, h){
        for (let i = 0; i < this.instances.length; i++) { // each Boid
            let b = this.instances[i]
            
            // Avoid
            for (let j = 0; j < this.instances.length; j++) { // each Boid
                if (j == i) continue // not itself
                let o = this.instances[j]

                let xdiff = b.x - o.x
                let ydiff = b.y - o.y
                let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

                if (distance < b.field) {
                    // Move in same direction
                    let subx = o.xdir - b.xdir
                    let suby = o.ydir - b.ydir
                    b.xdir += subx*.01
                    b.ydir += suby*0.1
                    b.normalizeDir()

                    // Calculate angle
                    let d = b.xdir*(xdiff/distance) + b.ydir*(ydiff/distance)
                    let angle = Math.acos(d)
                    if (angle < b.peripheral) continue // skip bc behind

                    let fieldxtip = b.x + b.xdir*b.field
                    let fieldytip = b.y + b.ydir*b.field

                    let avoidx = o.x - fieldxtip
                    let avoidy = o.y - fieldytip

                    let avoidmag = Math.sqrt(avoidx*avoidx + avoidy*avoidy)
                    let avoidxdir = avoidx/avoidmag
                    let avoidydir = avoidy/avoidmag

                    b.xdir -= avoidxdir*0.1
                    b.ydir -= avoidydir*0.1
                    b.normalizeDir()

                    o.avoidDebug(w, h, avoidxdir, avoidydir)
                }
            }

            b.move(w, h)

        }

    }
}

class Boid {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h // unused

        this.angle = 0 // radians

        this.xdir = Math.random()*2 - 1
        this.ydir = Math.random()*2 - 1
        this.normalizeDir()

        this.speed = 3
        this.field = 100
        this.peripheral = 1.1 //angle

        this.target = { x: 0, y: 0}
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

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.x + this.w*this.xdir, this.y + this.w*this.ydir)
        ctx.lineTo(this.x - this.w/4*this.ydir, this.y + this.w/4*this.xdir)
        ctx.lineTo(this.x + this.w/4*this.ydir, this.y - this.w/4*this.xdir)
        ctx.fill();

        // this.avoidDebug()
        // ctx.color = "black"
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.field, 0, 2 * Math.PI);
        // ctx.stroke();
    }

    moveTarget() {
        let xdiff = this.target.x - this.x
        let ydiff = this.target.y - this.y
        let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

        let targetxdir = xdiff/distance
        let targetydir = ydiff/distance

        this.xdir += targetxdir*0.1
        this.ydir += targetydir*0.1

        this.normalizeDir();
    }

    move(w, h) {
        // this.moveTarget(); // Orbit around center


        this.x += this.xdir*this.speed
        this.y += this.ydir*this.speed
        this.wrapScreen(w, h)
    }

    normalizeDir() {
        let mag = Math.sqrt(this.xdir*this.xdir + this.ydir*this.ydir)
        if (mag > 0) {
            this.xdir /= mag
            this.ydir /= mag
        }
    }

    wrapScreen(w, h) {
        if (this.x > w + 2) this.x = 0
        else if (this.x < -2) this.x = w
        if (this.y > h + 2) this.y = 0
        else if (this.y < -2) this.y = h
    }

    keepOnScreen(w, h) {
        this.x = clamp(this.x, this.w/2 + 5, w - this.w/2 - 5)
        this.y = clamp(this.y, this.h/2 + 5, h - this.h/2 - 5)
    }

    targetDebug(w, h) {
        // TARGET LINE
        let xdiff = this.target.x - this.x
        let ydiff = this.target.y - this.y
        let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

        let targetxdir = xdiff/distance
        let targetydir = ydiff/distance
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + targetxdir*this.field, this.y + targetydir*this.field)
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

