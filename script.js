// REQUIRES: player.js io.js
const c = document.getElementById('canvas')
const ctx = c.getContext('2d')

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let b1, I;

function Init() {
    let { w, h } = resizeWindow()

    b1 = new Boid(10, 10, 30, 30)
    b1.randomLocation(w, h)
    I = new IO()

    loop()
}

function loop() {
    let { w, h } = resizeWindow()
    ctx.clearRect(0, h, w, h)

    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, w, h)

    I.addKeyListeners();

    b1.draw()
    b1.move(w, h, I.keyState)
    b1.debug(w, h)

    requestAnimationFrame(loop)
}

function resizeWindow() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    w = window.innerWidth
    h = window.innerHeight

    return { w, h }
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
        this.accel = 0.1
        this.maxSpeed = 4

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
        if (rand < 0.5) { // side
            this.x = rand < 0.5 ? -this.w - 5 : w + 5
            rand = Math.random()
            this.y = rand*(h+10) - 5
        } else { // top/bottom
            this.x = rand*(w+10) - 5
            rand = Math.random()
            this.y = rand < 0.5 ? -this.h - 5 : h + 5
        }

    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.x + this.w*this.xdir, this.y + this.w*this.ydir)
        ctx.lineTo(this.x - this.w/4*this.ydir, this.y + this.w/4*this.xdir)
        ctx.lineTo(this.x + this.w/4*this.ydir, this.y - this.w/4*this.xdir)
        ctx.fill();
    }

    move(w, h, dir) {
        // Increase speed if keydown
        // if (dir.right) this.angle += this.turnSpeed
        // if (dir.left)  this.angle -= this.turnSpeed

        // if (dir.down)  this.angle += this.turnSpeed
        // if (dir.up)    this.angle -= this.turnSpeed

        // let targetx = w/2
        // let targety = h/2
        // let xcomp = targetx - this.x
        // let ycomp = targety - this.y
        // let mag = Math.sqrt(xcomp*xcomp + ycomp*ycomp)
        // this.xdir = xcomp/mag
        // this.ydir = ycomp/mag

        // this.angle = Math.atan(ycomp/xcomp)
        this.target.x = w/2
        this.target.y = h/2
        let xcomp = this.target.x - this.x
        let ycomp = this.target.y - this.y
        let distance = Math.sqrt(xcomp*xcomp + ycomp*ycomp)

        let targetxdir = xcomp/distance
        let targetydir = ycomp/distance

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

        // this.x = clamp(this.x, this.w/2 + 5, w - this.w/2 - 5)
        // this.y = clamp(this.y, this.h/2 + 5, h - this.h/2 - 5)
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
        y += 20
        this.target.x = w/2
        this.target.y = h/2
        let xcomp = this.target.x - this.x
        let ycomp = this.target.y - this.y
        let distance = Math.sqrt(xcomp*xcomp + ycomp*ycomp)

        let targetxdir = xcomp/distance
        let targetydir = ycomp/distance

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + targetxdir*20, this.y + targetydir*20);
        ctx.stroke();

        ctx.fillText("targetxdir, targetydir: " + targetxdir.toFixed(2) + " " + targetydir.toFixed(2), x, y)
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

