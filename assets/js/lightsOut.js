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

const globals = {
    FONT: "Arial",
    CANVAS_W: 800,
    CANVAS_H: 500
}

const canvas = document.createElement('canvas');
canvas.width = globals.CANVAS_W;
canvas.height = globals.CANVAS_H;
document.querySelector('#canvasContainer').append(canvas);

//TODO: Sz object instead of width and height
const gameInfo = {
    player: {
        width: 18,
        height: 18, 
        startLocation: {x: canvas.width/2, y: canvas.height/2},
        color: 'orange',
        health: 1,
        speed: 4
    },
    enemy: {
        width: 28,
        height: 28, 
        color: 'black',
        health: 1,
        speed: 2
    },
    timer: {
        font: globals.FONT,
        fontSz: '30px',
        location: {x: 10, y: 30},
        startTime: 0,
        textAlign: 'left',
        color: 'white'
    }
}

function enforceLocationInBounds(width, height, location) {
    if(location.x > width) {
        location.x = width;
    }
    if(location.x < 0) {
        location.x = 0;
    }
    if(location.y > height) {
        location.y = height;
    }
    if(location.y < 0) {
        location.y = 0;
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.components = {};
        this.utilities = {
            enforceLocationInBounds: (location) => enforceLocationInBounds(canvas.width, canvas.height, location),
            endGame: () => this.endGame()
        };
        Object.assign(this.components, {
            player: new Player(this.ctx, gameInfo.player.width, gameInfo.player.height, gameInfo.player.startLocation, gameInfo.player.color, this.utilities, gameInfo.player.health, gameInfo.player.speed),
            enemies: [],
            //ctx, content, fontSz, font, textAlign, location, color, utilities
            timer: new Timer(this.ctx, gameInfo.timer.startTime, gameInfo.timer.fontSz, gameInfo.timer.font, gameInfo.timer.textAlign, gameInfo.timer.location, gameInfo.timer.color, this.utilities)
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
            const { player, enemies, timer } = components;
            Component.renderComponents([player, ...enemies, timer]);
        }
        else if(currState == states.END) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "30px Comic Sans MS";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("WASTED", canvas.width/2, canvas.height/2);
        }
    }
    endGame() {
        this.currState = this.states.END;
    }
}



class Component {
    constructor(ctx, width, height, location, color, utilities) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.location = location;
        this.color = color; 
        this.utilities = utilities;
    }
    static render(component) {
        component.render();
    } 
    static renderComponents(components) {
        components.forEach(c => this.render(c));
    }  
    render() {
        this.show();
    }
}

class TextComponent extends Component {
    constructor(ctx, content, fontSz, font, textAlign, location, color, utilities) {
        super(ctx, null, null, location, color, utilities);
        this.content = content;
        this.font = font;
        this.fontSz = fontSz;
        this.textAlign = textAlign;
    }
}

class Timer extends TextComponent {
    constructor(ctx, content, fontSz, font, textAlign, location, color, utilities) {
        super(ctx, content, fontSz, font, textAlign, location, color, utilities);
        this.time = content;

        setInterval(() => this.time += 1, 1000);
    }
    show() {
        const {ctx, fontSz, font, textAlign, color, time, location} = this;
        ctx.font = `${fontSz} ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.fillText(time, location.x, location.y);
    }
}

class Character extends Component {
    constructor(ctx, width, height, location, color, utilities, health, speed) {
        super(ctx, width, height, location, color, utilities);
        this.health = health;
        this.speed = speed;
    }
    render() {
        this.update();
        this.show();
    }
}

class Player extends Character {
    constructor(ctx, width, height, location, color, utilities, health, speed) {
        super(ctx, width, height, location, color, utilities, health, speed);
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
        const { enforceLocationInBounds } = this.utilities;
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
        enforceLocationInBounds(location);
    }
    damage(damageAmount) {
        this.health -= damageAmount;
        if(this.health <= 0) this.destroy();
    }
    destroy() {
        this.utilities.endGame();
    }
}

class Enemy extends Character {
    constructor(ctx, width, height, location, color, utilities, health, speed, components) {
        super(ctx, width, height, location, color, utilities, health, speed);
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
        const {player} = this.components;
        //this.normalMovement();
        // //TODO: location needs to be standardized
        if(this.hasCollision(player)) {
            //make an attackDamage stat
            player.damage(1);
            this.damage(1);
        }
    }
    normalMovement() {
       const {speed, height, width, location} = this;
       const {player} = this.components;
       const locX = location.x + (width/2);
       const locY = location.y + (height/2);
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

    hasCollision(other) {

        const otherX = other.location.x - (other.width);
        const otherY = other.location.y - (other.width);
       // console.log(locX, otherX, locY, otherY);
        if(this.location.x <= otherX + other.width*2 && 
           this.location.x + this.width >= otherX  && 
           this.location.y <= otherY + other.height*2 && 
           this.location.y + this.width >= otherY ) {
            return true;
        }
        else { 
            return false; 
        }
        
    }

    static spawnEnemy(canvasW, canvasH) {
        const allocation = (canvasH + canvasW) / 2;
        const x = Math.floor((Math.random() * canvasW));
        const y = Math.floor((Math.random() * (allocation - x)));
    }

    static addEnemy() {
        this.components.enemies.push(new Enemy());
    }
}

const game = new Game(canvas);
game.start();

//Player object creation

//Enemy player objects

//Timer object creation

//
