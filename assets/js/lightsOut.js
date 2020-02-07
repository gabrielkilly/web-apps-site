const keyControls = {
    ArrowUp: "UP",
    KeyW: "UP",
    ArrowDown: "DOWN",
    KeyS: "DOWN",
    ArrowLeft: "LEFT",
    KeyA: "LEFT",
    ArrowRight: "RIGHT",
    KeyD: "RIGHT",
    Space: "LIGHT",
    Enter: "START",
    Escape: "PAUSE"
};
const keyStates = {};
Object.keys(keyControls).forEach((k) => {
    keyStates[keyControls[k]] = false;
});
window.onkeyup = function(e) { keyStates[keyControls[e.code]] = false; }
window.onkeydown = function(e) { keyStates[keyControls[e.code]] = true; }

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.components = {}
        Object.assign(this.components, {
            player: new Player(this.ctx, 18, 18, {x: this.canvas.width/2, y: this.canvas.height/2}, 'orange', 1, 4),
            enemies: [new Enemy(this.ctx, 28, 28, {x: 10, y: 10}, 'black', 1, 2, this.components)],
            timer: {
                startTime: 60,
                color: "white"
            }
        });
        this.states = {
            INTRO: 0,
            IN_PROCESS: 1,
            END: 2
        }
        this.currState = this.states.IN_PROCESS;
    }
    start() {
        setInterval(() => this.render(), 20);
    }
    render() {
        const {canvas, ctx, states, currState, components} = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //console.log(keyStates);
        if(currState == states.INTRO) {

        } 
        else if(currState == states.IN_PROCESS) {
            const { player, enemies } = components;
            Component.renderComponents([player, ...enemies]);
        }
        else if(currState == states.END) {

        }
    }
}

class Component {
    constructor(ctx, width, height, location, color) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.location = location;
        this.color = color; 
    }
    static render(component) {
        component.render();
    } 
    static renderComponents(components) {
        components.forEach(c => this.render(c));
    }  
}

class Character extends Component {
    constructor(ctx, width, height, location, color, health, speed) {
        super(ctx, width, height, location, color);
        this.health = health;
        this.speed = speed;
    }
    render() {
        this.update();
        this.show();
    }
}

class Player extends Character {
    constructor(ctx, width, height, location, color, health, speed) {
        super(ctx, width, height, location, color, health, speed);
    }
    show() {
        const {ctx, width, location, color} = this;
        ctx.beginPath();
        ctx.arc(location.x, location.y, width, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }
    update() {
        this.normalMovement();
    }
    normalMovement() {
        const {location, speed} = this;
        if(keyStates.UP) {
            location.y -= speed;
        }
        if(keyStates.DOWN) {
            location.y += speed;
        }
        if(keyStates.LEFT) {
            location.x -= speed;
        }
        if(keyStates.RIGHT) {
            location.x += speed;
        }
    }
}

class Enemy extends Character {
    constructor(ctx, width, height, location, color, health, speed, components) {
        super(ctx, width, height, location, color, health, speed);
        this.components = components;
    }
    show() {
        const {ctx, width, height, location, color} = this;
        ctx.beginPath();
        ctx.rect(location.x, location.y, width, height);
        ctx.fillStyle = color;
        ctx.fill();
    }
    update() {
        this.normalMovement();
    }
    normalMovement() {
       const {speed, height, width, location} = this;
       const {player} = this.components;
       const locX = location.x + (width/2);
       const locY = location.y + (height/2)
       if(player.location.x < locX) {
           location.x -= speed;
       }
       if(player.location.x > locX) {
           location.x += speed;
       }
       if(player.location.y < locY) {
            location.y -= speed;
        }
       if(player.location.y > locY) {
            location.y += speed;
       }
    }
}

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;
document.querySelector('#canvasContainer').append(canvas);
const game = new Game(canvas);
game.start();
//Player object creation

//Enemy player objects

//Timer object creation

//
