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
        this.components = {
            player: new Player(this.ctx, 18, 18, {x: this.canvas.width/2, y: this.canvas.height/2}, 'orange', 1, 4),
            enemies: [],
            timer: {
                startTime: 60,
                color: "white"
            }
        };
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
            const { player } = components;
            Component.renderComponents([player]);
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
