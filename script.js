// REQUIRES: player.js io.js
const c = document.getElementById('canvas')
const ctx = c.getContext('2d')

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let Boids, target
let I

function Init() {
    let { w, h } = resizeWindow()

    target = new Target(10, 100)
    target.randomLocation(w, h)

    Boids = new BoidController(100)
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
    }

    draw() {
        this.instances.forEach(b => b.draw())
    }

    move(w, h){
        for (let i = 0; i < this.instances.length; i++) { 
            this.instances[i].move(w, h)
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

        this.xdir = 1
        this.ydir = 1

        this.xvel = 1
        this.yvel = 1
        this.accel = 0.4

        this.target = { x: 0, y: 0}

        this.color = '#ffd6cc'
        this.randomLocation(w, h);
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
    }

    move(w, h) {
        let xdiff = this.target.x - this.x
        let ydiff = this.target.y - this.y
        let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

        let targetxdir = xdiff/distance
        let targetydir = ydiff/distance

        this.xvel += this.accel*targetxdir
        this.yvel += this.accel*targetydir

        this.calculateDir();

        this.x += this.xvel
        this.y += this.yvel

        this.keepOnScreen(w, h)
    }

    calculateDir() {
        let mag = Math.sqrt(this.xvel*this.xvel + this.yvel*this.yvel)
        if (mag > 0) {
            this.xdir = this.xvel/mag
            this.ydir = this.yvel/mag
        }
    }

    keepOnScreen(w, h) {
        this.x = clamp(this.x, this.w/2 + 5, w - this.w/2 - 5)
        this.y = clamp(this.y, this.h/2 + 5, h - this.h/2 - 5)
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

        // TARGET LINE
        let xdiff = this.target.x - this.x
        let ydiff = this.target.y - this.y
        let distance = Math.sqrt(xdiff*xdiff + ydiff*ydiff)

        let targetxdir = xdiff/distance
        let targetydir = ydiff/distance
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + targetxdir*20, this.y + targetydir*20)
        ctx.stroke()
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

