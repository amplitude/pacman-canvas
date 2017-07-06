// CONSTANTS
const START_X = 100;
const START_Y = 400;
const MAX_X = 1200;
const MAX_Y = 800;

// pipe constants
const pipeHeight = 50;
const holeSize = 4;

// spawn constants
const X_OFFSET_INCR = 50;
const Y_OFFSET_INCR = 50;
// cactus constants
const groundCactusY = 520;

const maxFuel = 500;

// should map to keys in sprite file names
const VEHICLES = {
    BALLOON: 'BALLOON',
    SQUARE: 'SQUARE',
    PLANE: 'PLANE',
};

const VEHICLE_LIST = [VEHICLES.BALLOON, VEHICLES.SQUARE, VEHICLES.PLANE];

// mapping to sprite file names
const SPRITES = {
    BALLOON: 'balloon',
    SQUARE: 'bird',
    PIPE: 'pipe',
    PLANE: 'plane',
    BACKGROUND: 'bg',
    COIN_1: '1coin',
    COIN_A: '5coin',
    SKY_CACTUS: 'cloud-cactus',
    EARTH_CACTUS: 'ground-cactus',
};
// controls falling of main sprite
const vehicleToGravity = {
    [VEHICLES.BALLOON]: 600,
    [VEHICLES.SQUARE]: 1500,
    [VEHICLES.PLANE]: 1500,
};

const vehicleVelocityToAngleRatio = {
    [VEHICLES.BALLOON]: 1000,
    [VEHICLES.SQUARE]: 50,
    [VEHICLES.PLANE]: 50,
};
const vehicleAngleOffset = {
    [VEHICLES.BALLOON]: 0,
    [VEHICLES.SQUARE]: 0,
    [VEHICLES.PLANE]: -20,
}

// x, y, xoffset, y offset
const vehicleToBodyModifier = {
    [VEHICLES.BALLOON]: [80, 170, 10, 10],
    [VEHICLES.SQUARE]: [50, 50, 0, 0],
    [VEHICLES.PLANE]: [80, 60, 20, 30],
};

// controls speed of scrolling
const vehicleToSpeed = {
    [VEHICLES.BALLOON]: -200,
    [VEHICLES.SQUARE]: -300,
    [VEHICLES.PLANE]: -300,
};

const vehicleToObstacleTimeout = {
    [VEHICLES.BALLOON]: 7500,
    [VEHICLES.SQUARE]: 5000,
    [VEHICLES.PLANE]: 5000,
};

// controls change in velocity from pressing space
const vehicleToVelocityDelta = {
    [VEHICLES.BALLOON]: 200,
    [VEHICLES.SQUARE]: 475,
    [VEHICLES.PLANE]: 475,
};
const vehicleToFuelDrainMillis = {
    [VEHICLES.BALLOON]: 60,
    [VEHICLES.SQUARE]: 40,
    [VEHICLES.PLANE]: 40,
}

const vehicleToAnalyticsName = {
    [VEHICLES.BALLOON]: 'balloon',
    [VEHICLES.SQUARE]: 'box',
    [VEHICLES.PLANE]: 'paper plane',
};

const preloadSprites = function preloadSprites() {
    Object.keys(SPRITES).forEach(key => {
        game.load.image(SPRITES[key], 'assets/' + SPRITES[key] + '.png');
    });
}

let vehicleIndex = 0;
let vehicleType = VEHICLES.BALLOON;
let DEBUG = true;

// HELPERS
function addSinglePipe(y, obstacleGroup, data) {
    // create a pipe at x and y, and add it to the pipe group
    const pipe = game.add.sprite(MAX_X, y, SPRITES.PIPE);
    obstacleGroup.add(pipe);

    // enable physics
    game.physics.arcade.enable(pipe);
    pipe.body.velocity.x = vehicleToSpeed[vehicleType];

    // clean up pipe when not visible
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;

    // Data for analytics
    if (data) {
        pipe.ampData = data;
    }
};
function addPipeColumn(obstacleGroup) {
    // assume spots > holeSize
    const spots = Math.floor(MAX_Y / pipeHeight);

    // randomly create a hole
    const hole = Math.floor(Math.random() * (spots - holeSize));

    for (let i = 0; i < spots; i++) {
        if (i < hole) {
            addSinglePipe(i * pipeHeight, obstacleGroup, { type: 'pipe', position: 'top' });
        }
        if (i > hole + 3) {
            addSinglePipe(i * pipeHeight, obstacleGroup, { type: 'pipe', position: 'bottom' });
        }
    }
};

var bootState = {
    create: function() {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // allow spawning off screen
        game.world.setBounds(0, 0, MAX_X + 2000, MAX_Y);

        // call load state
        game.state.start('load');
    },
};

var loadState = {
    // preload all assets here
    preload: function() {
        // could put up a loading screen here
        preloadSprites();
        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';
    },
    create: function() {
        game.state.start('menu');
    },
};

// screen to select a vehicle
var menuState = {
    create: function() {
        this.background = game.add.tileSprite(0, 0, 2171, MAX_Y, SPRITES.BACKGROUND);

        // Title instructions
        const titleLabel = game.add.text(
            80,
            20,
            'Data Explorer',
            {
                font: '40px Arial',
                fill: '#eeeeee',
            });
        // instructions
        const instructions = game.add.text(
            80,
            80,
            'Help Datamonster soar through the skies!\nTap or hold space to fly higher.',
            {
                font: '25px Arial',
                fill: '#eeeeee',
            });

        // logic for selecting vehicle
        this.vehicles = VEHICLE_LIST.map(vehicle => {
            const modifier = vehicleToBodyModifier[vehicle];
            const sprite = game.add.sprite(START_X, START_Y, SPRITES[vehicle]);
            sprite.anchor.setTo(0.5, 0.5);
            sprite.angle = vehicleAngleOffset[vehicle]
            sprite.vehicleType = vehicle;
            return sprite;
        });

        this.vehicles.forEach((vehicleSprite) => {
            vehicleSprite.visible = vehicleSprite.vehicleType === vehicleType
        });

        // start instructions
        const startLabel = game.add.text(
            80,
            MAX_Y - 120,
            'Use Left and Right to select a vehicle\nPress Space to start!',
            {
                font: '25px Arial',
                fill: '#eeeeee',
            });

        this.leftArrow = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightArrow = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.leftArrow.onDown.add(this.onLeft, this);
        this.rightArrow.onDown.add(this.onLeft, this);
        this.spaceKey.onDown.addOnce(this.start, this);

    },
    start: function () {
        // TODO analytics
        game.state.start('play');
    },
    update: function() {
        this.vehicles.forEach((vehicleSprite) => {
            vehicleSprite.visible = vehicleSprite.vehicleType === vehicleType
        });
    },
    onLeft: function() {
        vehicleIndex -= 1;
        if (vehicleIndex < 0) {
            vehicleIndex += VEHICLE_LIST.length;
        }
        vehicleType = VEHICLE_LIST[vehicleIndex];
    },
    onRight: function() {
        vehicleIndex = (vehicleIndex + 1) % VEHICLE_LIST.length;
        vehicleType = VEHICLE_LIST[vehicleIndex];
    },
};

// Create our 'main' state that will contain the game
var playState = {
    // set up the game, display sprites, etc.
    create: function() {
        // SETUP ENTITIES
        this.background = game.add.tileSprite(0, 0, 2171, MAX_Y, SPRITES.BACKGROUND);

        // start vehicle at start of screen
        this.vehicle = game.add.sprite(START_X, START_Y, SPRITES[vehicleType]);
        this.vehicle.ampData = {
            vehicle: vehicleToAnalyticsName[vehicleType],
        };

        // Add physics to the vehicle, needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.vehicle);
        // Add gravity to the vehicle to make it fall
        this.vehicle.body.gravity.y = vehicleToGravity[vehicleType];
        this.vehicle.anchor.setTo(0.5, 0.5);
        const bodyModifier = vehicleToBodyModifier[vehicleType];
        if (bodyModifier) {
            this.vehicle.body.setSize(bodyModifier[0], bodyModifier[1], bodyModifier[2], bodyModifier[3]);
        }

        // create a group of all obstacles
        this.obstacles = game.add.group();

        // Call the 'jump' function when the spacekey is hit
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.onSpace, this);

        // create groups to hold all obstacles
        this.obstacles = game.add.group();
        this.coins = game.add.group();
        // fuel is currently unused
        this.fuel = game.add.group();
        this.fuelTime = game.time.now;
        this.currentFuel = maxFuel;
        this.fuelLabel = game.add.text(20, MAX_Y - 80, "Fuel: " + maxFuel + "/" + maxFuel, { font: "30px Arial", fill: "#ffffff" });

        // create objects
        this.spawnObjects();
        this.obstacleTimer = game.time.events.loop(vehicleToObstacleTimeout[vehicleType], this.spawnObjects, this);

        this.canRestart = false;
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        // analytics
        this.spaceCount = 0;
        this.skyCactusCount = 0;
        this.groundCactusCount = 0;
        this.coinCount = 0;
        this.bigCoinCount = 0;
    },

    update: function() {
        if (this.vehicle.alive) {
            // slide background
            this.background.tilePosition.x += -1;

            // if the vehicle hits the top, bounce off
            if (this.vehicle.y < 0) {
                // bounce off the wall
                this.vehicle.body.velocity.y = Math.max(Math.abs(this.vehicle.body.velocity.y) / 2, vehicleToVelocityDelta[vehicleType] / 2);
            }
            // If the vehicle is hit the bottom
            // Call the 'restartGame' function
            if (this.vehicle.y + this.vehicle.body.height / 2> MAX_Y) {
                this.gameOver('crash landing');
            } else {
                // check collisions
                game.physics.arcade.overlap(this.vehicle, this.obstacles, (vehicle, obstacle) => {
                    if (this.vehicle.alive) {
                        this.gameOver(obstacle.type);
                    }
                }, null, this);
            }
        }

        if (this.vehicle.alive) {
            // check coins
            game.physics.arcade.overlap(this.vehicle, this.coins, (vehicle, coin) => {
                this.onCollectCoin(coin);
            }, null, this);
        }

        if (this.spaceKey.isDown && this.vehicle.alive && this.currentFuel > 0) {
            this.vehicle.body.acceleration.y = -vehicleToGravity[vehicleType] - vehicleToVelocityDelta[vehicleType] * 2;
            if (game.time.now > this.fuelTime) {
                this.currentFuel -= 1;
                this.fuelTime = game.time.now + vehicleToFuelDrainMillis[vehicleType];
            }
        } else {
            this.vehicle.body.acceleration.y = 0;
        }
        this.fuelLabel.text = "Fuel: " + this.currentFuel + "/" + maxFuel;

        this.obstacles.forEach(obstacle => {
            if (obstacle.body.x < START_X) {
                this.maybeMarkObstacle(obstacle);
            }
        });
        this.coins.forEach(coin => {
            if (coin.body.x < START_X) {
                this.maybeMarkCoin(coin);
            }
        });

        // update angle based on velocity
        this.vehicle.angle = vehicleAngleOffset[vehicleType] + (this.vehicle.body.velocity.y / vehicleVelocityToAngleRatio[vehicleType]);
    },

    // debugging
    render: function() {
        if (DEBUG) {
            game.debug.bodyInfo(this.vehicle, 32, 32);

            game.debug.body(this.vehicle);
            this.obstacles.forEach((obstacle) => game.debug.body(obstacle));
        }
    },

    initSprite: function(sprite) {
        // enable physics
        game.physics.arcade.enable(sprite);
        // move sprite
        sprite.body.velocity.x = vehicleToSpeed[vehicleType];
        // clean up sprite when not visible
        sprite.checkWorldBounds = true;
        sprite.outOfBoundsKill = true;
    },

    addPipes: function() {
        addPipeColumn(this.obstacles);
    },
    addSkyCactus: function(xOffset, yOffset) {
        const cactus = game.add.sprite(MAX_X + xOffset, yOffset, SPRITES.SKY_CACTUS);
        this.obstacles.add(cactus);
        this.initSprite(cactus);

        cactus.body.setSize(200, 220, 25, 20);
        cactus.ampData = {
            type: 'cloudy cactus',
            marked: false,
        }
    },
    addGroundCactus: function(xOffset, yOffset) {
        const cactus = game.add.sprite(MAX_X + xOffset, groundCactusY + yOffset, SPRITES.EARTH_CACTUS);
        this.obstacles.add(cactus);
        this.initSprite(cactus);

        cactus.body.setSize(200, 200, 25, 40);
        cactus.ampData = {
            type: 'grounded cactus',
            marked: false,
        }
    },
    addCoin1: function(xOffset, yOffset) {
        const coin = game.add.sprite(MAX_X + xOffset, yOffset, SPRITES.COIN_1);
        this.coins.add(coin);
        this.initSprite(coin);

        coin.ampData = {
            value: 1,
            marked: false,
        };
    },
    addCoinA: function(xOffset, yOffset) {
        const coin = game.add.sprite(MAX_X + xOffset, yOffset, SPRITES.COIN_A);
        this.coins.add(coin);
        this.initSprite(coin);

        coin.ampData = {
            value: 10,
            marked: false,
        };
    },
    renderPattern: function(pattern) {
        pattern.forEach(patternObj => {
            const xOffset = patternObj.x * X_OFFSET_INCR;
            const yOffset = patternObj.y * Y_OFFSET_INCR;
            switch (patternObj.type) {
                case 'c':
                    this.addSkyCactus(xOffset, yOffset);
                    break;
                case 'g':
                    this.addGroundCactus(xOffset, 0);
                    break;
                case 'o':
                    this.addCoin1(xOffset, yOffset);
                    break;
                case '*':
                    this.addCoinA(xOffset, yOffset);
                    break;
                default:
                    break;
            }
        });
    },
    // helper functions
    spawnObjects: function() {
        const patternIdx = Math.floor(Math.random() * spawnPatterns.length);
        // spawn patterns defined in external file
        this.renderPattern(spawnPatterns[patternIdx]);
    },

    onSpace: function() {
        // Make the vehicle jump
        if (this.vehicle.alive && this.currentFuel > 0) {
            // Add a vertical velocity to the vehicle
            this.vehicle.body.velocity.y -= vehicleToVelocityDelta[vehicleType];
            this.spaceCount += 1;
            this.currentFuel -= 1;
            this.fuelTime = game.time.now + vehicleToFuelDrainMillis[vehicleType];
        } else {
            // Start the 'main' state, which restarts the game
            if (this.canRestart) {
                game.state.start('menu');
            }
        }
    },
    onCollectCoin: function(coinSprite) {
        this.score += coinSprite.ampData.value;
        this.labelScore.text = this.score;
        this.maybeMarkCoin(coinSprite);
        coinSprite.destroy();
    },
    // Restart the game
    gameOver: function(cause) {
        this.vehicle.alive = false;
        // stop all things
        game.time.events.remove(this.obstacleTimer);
        this.obstacles.forEach((obstacle) => {
            obstacle.body.velocity.x = 0;
        }, this);
        this.coins.forEach((coin) => {
            coin.body.velocity.x = 0;
        }, this);

        game.time.events.add(Phaser.Timer.SECOND * 1, this.allowRestart, this);

        this.gameOverLabel = game.add.text(
            160,
            MAX_Y / 2,
            'Game Over...',
            {
                font: '40px Arial',
                fill: '#111111',
            });
    },
    allowRestart: function() {
        this.gameOverLabel.text = 'Game Over... press Space to return';
        this.canRestart = true;
    },

    // mark things that pass
    maybeMarkCoin: function(coinSprite) {
        if (!coinSprite.ampData.marked) {
            if (coinSprite.ampData.value !== 1) {
                this.bigCoinCount += 1;
            } else {
                this.coinCount += 1;
            }
            coinSprite.ampData.marked = true;
        }
    },
    maybeMarkObstacle: function(obstacle) {
        if (!obstacle.ampData.marked) {
            if (obstacle.ampData.type === 'grounded cactus') {
                this.groundCactusCount += 1;
            } else {
                this.skyCactusCount += 1;
            }
            obstacle.ampData.marked = true;
        }
    },
};

var endState = {

    create: function() {

    },
};

// Initialize Phaser and main frame
var game = new Phaser.Game(MAX_X, MAX_Y);

// add game states
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('end', endState);
// Start the state to actually start the game
game.state.start('boot');
