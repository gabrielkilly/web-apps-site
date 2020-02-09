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
    FONT: "Khand",
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
        this.score = 0;
        this.components = {};
        this.intervals = {};
        this.utilities = {
            enforceLocationInBounds: (location) => enforceLocationInBounds(canvas.width, canvas.height, location),
            endGame: () => this.end(),
            addToIntervals: (name, interval) => this.addToIntervals(name, interval)
        };
        Object.assign(this.components, {
            player: Player.createPlayer(this.ctx, this.utilities),
            enemies: [],
            timer: Timer.createTimer(this.ctx, this.utilities)
        });
        this.states = {
            INTRO: 0,
            IN_PROCESS: 1,
            END: 2
        }
        this.currState = this.states.IN_PROCESS;
    }
    start() { 
        this.addToIntervals('render', setInterval(() => this.render(), 20));
        this.addToIntervals('spawnEnemy', setInterval(() => this.spawnEnemy(Enemy.createEnemy(this.ctx, this.utilities, this.components)), 8000));
        this.spawnEnemy(Enemy.createEnemy(this.ctx, this.utilities, this.components));

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
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.font = `50px ${globals.FONT}`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(`You Lasted ${this.score}s`, canvas.width/2, canvas.height/2);

                ctx.beginPath();
                ctx.font = `20px ${globals.FONT}`;
                ctx.fillText(`Press <ENTER> To Play Again`, canvas.width/2, canvas.height/2 + 50);
            }, 20);

            this.addToIntervals('restart', setInterval(() => {
                if(keyStates.START) {
                    this.restart();
                }
            }, 20));
        }
    }
    restart() {
        this.clearIntervals();
        this.components.player = Player.createPlayer(this.ctx, this.utilities);
        console.log(this.components.player);
        this.components.timer = Timer.createTimer(this.ctx, this.utilities);
        this.currState = this.states.IN_PROCESS;
        this.start();
    }
    end() {
        this.clearIntervals();
        this.score = this.components.timer.getTime();
        this.clearComponents();
        this.currState = this.states.END;
        this.render();
        
    }
    addToIntervals(name, interval) {
        this.intervals[name] = interval;
    }
    clearIntervals() {
        Object.keys(this.intervals).forEach((k) => {
            clearInterval(this.intervals[k]);
            this.intervals[k] = null;
        });
    }
    clearComponents() {
        this.components.player = null;
        this.components.timer = null;
        this.components.enemies = [];
    }
    spawnEnemy(enemy) {
        const {ctx} = this;
        const enemySpawnOutline = setInterval(() => {
            ctx.beginPath();
            ctx.rect(enemy.location.x, enemy.location.y, enemy.width, enemy.height);
            ctx.fillStyle = 'gray';
            ctx.fill();
        }, 150);

        setTimeout(() => {
            this.components.enemies.push(enemy);
            clearInterval(enemySpawnOutline);
        }, 1200);
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
        utilities.addToIntervals('timer', setInterval(() => this.time += 1, 1000));
    }
    show() {
        const {ctx, fontSz, font, textAlign, color, time, location} = this;
        ctx.font = `${fontSz} ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.fillText(time, location.x, location.y);
    }
    getTime() {
        return this.time;
    }
    static createTimer(ctx, utilities) {
       return  new Timer(ctx, gameInfo.timer.startTime, gameInfo.timer.fontSz, gameInfo.timer.font, gameInfo.timer.textAlign, gameInfo.timer.location, gameInfo.timer.color, utilities);
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
    static createPlayer(ctx, utilities) {
        console.log(gameInfo.player.startLocation);
        return new Player(ctx, gameInfo.player.width, gameInfo.player.height, {...gameInfo.player.startLocation}, gameInfo.player.color, utilities, gameInfo.player.health, gameInfo.player.speed);
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
        this.normalMovement();
        // //TODO: location needs to be standardized
        if(this.hasCollision(player)) {
            //make an attackDamage stat
            player.damage(1);
            //this.damage(1);
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

    static getRandomSpawnLocation (playerLocation) {
        //const allocation = (globals.CANVAS_H + globals.CANVAS_W) / 2;
        const x = Math.floor((Math.random() * (globals.CANVAS_W - 20)) + 20);
        const y = Math.floor((Math.random() * (globals.CANVAS_H - 20)) + 20);
        return {x, y};
    }

    static createEnemy(ctx, utilities, components) {
        const {width, height, color, health, speed} = gameInfo.enemy;
        return new Enemy(ctx, width, height, this.getRandomSpawnLocation(components.player.location), color, utilities, health, speed, components);
    }
}

const game = new Game(canvas);
game.start();

//Player object creation

//Enemy player objects

//Timer object creation

//
