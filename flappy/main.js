
(function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";
r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.4.0-min.gz.js";
r.onload=function(){e.amplitude.runQueuedFunctions()};var i=t.getElementsByTagName("script")[0];
i.parentNode.insertBefore(r,i);function s(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"];
for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[];return this;
};var p=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];
for(var l=0;l<p.length;l++){s(c,p[l])}n.Revenue=c;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","logEventWithTimestamp","logEventWithGroups"];
function v(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
}}for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){e=(!e||e.length===0?"$default_instance":e).toLowerCase();
if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n;
})(window,document);
amplitude.getInstance().init("20732ada648ee1d0dde288f000977440");

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keymW1ZElKs4tF7ib' }).base('appCppypdYKJeG9QI');


// CONSTANTS
const START_X = 100;
const START_Y = 400;
const MAX_X = 1200;
const MAX_Y = 800;

const GAME_VERSION = 'v0.9.9';

// pipe constants
const pipeHeight = 50;
const holeSize = 4;

// spawn constants
const X_OFFSET_INCR = 50;
const Y_OFFSET_INCR = 50;
// cactus constants
const groundCactusY = 610;
const groundCactusYHard = 545;

const maxFuel = 500;

// should map to keys in sprite file names
const VEHICLES = {
    BALLOON: 'BALLOON',
    BALLOON1: 'BALLOON1',
    BALLOON2: 'BALLOON2',
    BALLOON3: 'BALLOON3',
    SQUARE: 'SQUARE',
    PLANE: 'PLANE',
    PLANE1: 'PLANE1',
    PLANE2: 'PLANE2',
    PLANE3: 'PLANE3',
    ROCKET: 'ROCKET', // only for analytics
    ROCKET1: 'ROCKET1',
    ROCKET2: 'ROCKET2',
    ROCKET3: 'ROCKET3',
};

const VEHICLE_TO_BASE_VEHICLE = {
    BALLOON: 'BALLOON',
    BALLOON1: 'BALLOON',
    BALLOON2: 'BALLOON',
    BALLOON3: 'BALLOON',
    SQUARE: 'SQUARE',
    PLANE: 'PLANE',
    PLANE1: 'PLANE',
    PLANE2: 'PLANE',
    PLANE3: 'PLANE',
    ROCKET: 'ROCKET', // only for analytics
    ROCKET1: 'ROCKET',
    ROCKET2: 'ROCKET',
    ROCKET3: 'ROCKET',
};

const IS_SPRITE_SHEET = {
    BALLOON: false,
    BALLOON1: true,
    BALLOON2: true,
    BALLOON3: true,
    SQUARE: false,
    PLANE: false,
    PLANE1: true,
    PLANE2: true,
    PLANE3: true,
    ROCKET: false, // only for analytics
    ROCKET1: true,
    ROCKET2: true,
    ROCKET3: true,
};

const VEHICLE_LIST = [
    VEHICLES.BALLOON1, VEHICLES.BALLOON2, VEHICLES.BALLOON3,
    VEHICLES.PLANE1, VEHICLES.PLANE2, VEHICLES.PLANE3,
    VEHICLES.ROCKET3, VEHICLES.ROCKET2, VEHICLES.ROCKET1,
];

const ALL_VEHICLE_LIST = VEHICLE_LIST.concat([VEHICLES.SQUARE])

const STAGES = {
    'DESERT': 'desert',
    'SKY': 'sky',
    'SPACE': 'space',
};
const STAGE_LIST = [STAGES.DESERT, STAGES.SKY, STAGES.SPACE];
const stageToBackgroundLength = {
    [STAGES.DESERT]: 2173,
    [STAGES.SKY]: 2560,
    [STAGES.SPACE]: 2560,
};

// mapping to sprite file names
const SPRITES = {
    [VEHICLES.BALLOON]: 'balloon',
    [VEHICLES.SQUARE]: 'secret-ship',
    PIPE: 'pipe',
    [VEHICLES.PLANE]: 'plane',
    COIN_1: '1coin',
    COIN_A: '5coin',
    SKY_CACTUS: 'cloud-cactus',
    EARTH_CACTUS: 'ground-cactus',
    SAND_ISLAND: 'sand-island',
    SPACE_ROCKS: 'space-obstacle',
    PLANET_SKY: 'planet1',
    PLANET_EARTH: 'planet2',
    LONG_ISLAND: 'floating-island',
    RAINBOW_ISLAND: 'rainbow-island',
    AIR_ROCK: 'rock-cluster',
    INSTRUCTIONS: 'instruction',
    SPLASH: 'data-explorer-splash',
};

const OBSTACLE_SPRITES = {
    [STAGES.DESERT]: {
        CLOUD: SPRITES.SKY_CACTUS,
        ROCK: SPRITES.EARTH_CACTUS,
        LONG: SPRITES.SAND_ISLAND,
    },
    [STAGES.SKY]: {
        CLOUD: SPRITES.RAINBOW_ISLAND,
        ROCK: SPRITES.AIR_ROCK,
        LONG: SPRITES.LONG_ISLAND,
    },
    [STAGES.SPACE]: {
        CLOUD: SPRITES.PLANET_SKY,
        ROCK: SPRITES.PLANET_EARTH,
        LONG: SPRITES.SPACE_ROCKS,
    },
}

const BACKGROUNDS = {
    [STAGES.DESERT]: 'desert_bg',
    [STAGES.SKY]: 'sky_bg',
    [STAGES.SPACE]: 'space_bg',
};

const SPRITE_SHEETS = {
    [VEHICLES.BALLOON1]: 'balloon1',
    [VEHICLES.BALLOON2]: 'balloon2',
    [VEHICLES.BALLOON3]: 'balloon3',
    [VEHICLES.PLANE1]: 'plane1',
    [VEHICLES.PLANE2]: 'plane2',
    [VEHICLES.PLANE3]: 'plane3',
    [VEHICLES.ROCKET1]: 'ship1',
    [VEHICLES.ROCKET2]: 'ship2',
    [VEHICLES.ROCKET3]: 'ship3',
    BUTTON: 'button',
    START_BUTTON: 'start',
};

const SHEET_DIMENSIONS = {
    [SPRITE_SHEETS.BUTTON]: [50, 50],
    [SPRITE_SHEETS.START_BUTTON]: [150, 100],
    [SPRITE_SHEETS[VEHICLES.BALLOON1]]: [100, 175],
    [SPRITE_SHEETS[VEHICLES.BALLOON2]]: [100, 175],
    [SPRITE_SHEETS[VEHICLES.BALLOON3]]: [100, 175],
    [SPRITE_SHEETS[VEHICLES.PLANE1]]: [100, 100],
    [SPRITE_SHEETS[VEHICLES.PLANE2]]: [100, 100],
    [SPRITE_SHEETS[VEHICLES.PLANE3]]: [100, 100],
    [SPRITE_SHEETS[VEHICLES.ROCKET1]]: [250, 200],
    [SPRITE_SHEETS[VEHICLES.ROCKET2]]: [250, 200],
    [SPRITE_SHEETS[VEHICLES.ROCKET3]]: [250, 200],
};

const BUTTON_SHEET_HEIGHT = 50;
const BUTTON_SHEET_WIDTH = 50;

// controls falling of main sprite
const vehicleToGravity = {
    [VEHICLES.BALLOON]: 600,
    [VEHICLES.SQUARE]: 1700,
    [VEHICLES.PLANE]: 1500,
    [VEHICLES.ROCKET]: 1300,
};

const vehicleVelocityToAngleRatio = {
    [VEHICLES.BALLOON]: 1000,
    [VEHICLES.SQUARE]: 50,
    [VEHICLES.PLANE]: 50,
    [VEHICLES.ROCKET]: 30,
};
const vehicleAngleOffset = {
    [VEHICLES.BALLOON]: 0,
    [VEHICLES.SQUARE]: 0,
    [VEHICLES.PLANE]: 70,
    [VEHICLES.ROCKET]: 0,
}

// x, y, xoffset, y offset
const vehicleToBodyModifier = {
    [VEHICLES.BALLOON]: [70, 140, 15, 15],
    [VEHICLES.SQUARE]: [248, 284, 0, 0], // size gets cut in 4
    [VEHICLES.PLANE]: [75, 60, 15, 25],
    [VEHICLES.ROCKET]: [180, 120, 30, 40], // these get halved
};

// controls speed of scrolling
const vehicleToSpeed = {
    [VEHICLES.BALLOON]: -200,
    [VEHICLES.SQUARE]: -420,
    [VEHICLES.PLANE]: -300,
    [VEHICLES.ROCKET]: -350,
};

const vehicleToObstacleTimeout = {
    [VEHICLES.BALLOON]: 7500,
    [VEHICLES.SQUARE]: 3500,
    [VEHICLES.PLANE]: 5000,
    [VEHICLES.ROCKET]: 4500,
};

// controls change in velocity from pressing space
const vehicleToVelocityDelta = {
    [VEHICLES.BALLOON]: 200,
    [VEHICLES.SQUARE]: 475,
    [VEHICLES.PLANE]: 475,
    [VEHICLES.ROCKET]: 200,
};
const vehicleToFuelDrainMillis = {
    [VEHICLES.BALLOON]: 70,
    [VEHICLES.SQUARE]: 80,
    [VEHICLES.PLANE]: 55,
    [VEHICLES.ROCKET]: 50,
}

const vehicleToAnalyticsName = {
    [VEHICLES.BALLOON]: 'balloon',
    [VEHICLES.SQUARE]: 'glitch',
    [VEHICLES.PLANE]: 'paper plane',
    [VEHICLES.ROCKET]: 'rocket',
    [VEHICLES.BALLOON1]: 'balloon (standard)',
    [VEHICLES.BALLOON2]: 'balloon (white)',
    [VEHICLES.BALLOON3]: 'balloon (pink)',
    [VEHICLES.PLANE1]: 'paper plane (standard)',
    [VEHICLES.PLANE2]: 'paper plane (green)',
    [VEHICLES.PLANE3]: 'paper plane (purple)',
    [VEHICLES.ROCKET1]: 'rocket (strawberry)',
    [VEHICLES.ROCKET2]: 'rocket (cream)',
    [VEHICLES.ROCKET3]: 'rocket (standard)',
};

const vehicleToScoreName = {
    [VEHICLES.BALLOON]: 'Hot Air Balloon',
    [VEHICLES.SQUARE]: 'Abstract Art',
    [VEHICLES.PLANE]: 'Paper Airplane',
    [VEHICLES.ROCKET]: 'Space Ship',
    [VEHICLES.BALLOON1]: 'Hot Air Balloon (Tangerine)',
    [VEHICLES.BALLOON2]: 'Hot Air Balloon (Peppermint)',
    [VEHICLES.BALLOON3]: 'Hot Air Balloon (Watermelon)',
    [VEHICLES.PLANE1]: 'Paper Airplane (Coconut)',
    [VEHICLES.PLANE2]: 'Paper Airplane (Apple)',
    [VEHICLES.PLANE3]: 'Paper Airplane (Grape)',
    [VEHICLES.ROCKET1]: 'Space Ship (Strawberry)',
    [VEHICLES.ROCKET2]: 'Space Ship (Cream)',
    [VEHICLES.ROCKET3]: 'Space Ship (Standard)',
};

const stageToAnalyticsName = {
    [STAGES.DESERT]: 'desert',
    [STAGES.SKY]: 'sky',
    [STAGES.SPACE]: 'space',
};

const stageToScoreName = {
    [STAGES.DESERT]: 'Dusty Desert',
    [STAGES.SKY]: 'Soaring Skies',
    [STAGES.SPACE]: 'Asteroid Belt',
};

const preloadSprites = function preloadSprites() {
    Object.keys(SPRITES).forEach(key => {
        game.load.image(SPRITES[key], 'assets/' + SPRITES[key] + '.png');
    });

    Object.keys(BACKGROUNDS).forEach(key => {
        game.load.image(BACKGROUNDS[key], 'assets/backgrounds/' + BACKGROUNDS[key] + '.png');
    })

    Object.keys(SPRITE_SHEETS).forEach(key => {
        const val = SPRITE_SHEETS[key];
        const dimensions = SHEET_DIMENSIONS[val];
        game.load.spritesheet(val, 'assets/' + val + '_sheet.png',dimensions[0], dimensions[1]);
    })
};

let localHighScore = 0;
let userName = '';

// randomly select a vehicle
let vehicleIndex = Math.floor(Math.random() *  VEHICLE_LIST.length);
let vehicleType = VEHICLE_LIST[vehicleIndex];
let baseVehicleType = VEHICLE_TO_BASE_VEHICLE[vehicleType];
// let vehicleIndex = 0;
// let vehicleType = VEHICLES.BALLOON;
// let baseVehicleType = VEHICLES.BALLOON;
let selectedStageIndex = Math.floor(Math.random() * STAGE_LIST.length);
let selectedStage = STAGE_LIST[selectedStageIndex];
// let selectedStageIndex = 0;
// let selectedStage = STAGES.DESERT;
let DEBUG = false;
let EASY_MODE = true;

function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function logHighscore(score, duration, vehicle, stage) {
    const lastScore = localHighScore;
    localHighScore = Math.max(localHighScore, score);

    const table = EASY_MODE ? base('Data Explorer Scores') : base('Data Explorer Scores (Hard)');
    table.create({
        'name': userName,
        'score': score,
        'vehicle': vehicleToScoreName[vehicle],
        'survival time': duration,
        'stage': stageToScoreName[stage],
        'version': GAME_VERSION,
        'hitboxes showing': DEBUG,
    }, function (err, record) {
        if (err) {
            console.log(err);
            return;
        }
    });

    return score > lastScore;
};

// HELPERS
function addSinglePipe(y, obstacleGroup, data) {
    // create a pipe at x and y, and add it to the pipe group
    const pipe = game.add.sprite(MAX_X, y, SPRITES.PIPE);
    obstacleGroup.add(pipe);

    // enable physics
    game.physics.arcade.enable(pipe);
    pipe.body.velocity.x = vehicleToSpeed[baseVehicleType];

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
function addBackground() {
    return game.add.tileSprite(0, 0, stageToBackgroundLength[selectedStage], MAX_Y, BACKGROUNDS[selectedStage]);
}

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
        game.stage.backgroundColor = '#22BCE2';
    },
    create: function() {
        game.state.start('login');
    },
};

// enter name screen
var loginState = {
    create: function() {
        amplitude.getInstance().regenerateDeviceId();
        var identify = new amplitude.Identify().set('version', GAME_VERSION);
        amplitude.getInstance().identify(identify);
        userName = '';

        const splash = game.add.sprite(MAX_X / 2, -80, SPRITES.SPLASH);
        splash.anchor.setTo(0.5, 0);
        splash.scale.setTo(0.8, 0.8)

        const loginPrompt = game.add.text(MAX_X /2, MAX_Y - 220, 'Please enter your email and click Start to continue', {
            font: '30px Arial',
            fill: '#ffffff',
        });
        loginPrompt.anchor.set(0.5);

        this.userInput = game.add.inputField(MAX_X / 2 - 200, MAX_Y - 170, {
            blockInput: false,
            font: '18px Arial',
            forceCase: PhaserInput.ForceCase.lower,
            fill: '#212121',
            width: 400,
            max: 40,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            placeHolder: 'Email',
            textAlign: 'center',
        });
        this.userInput.setText(userName);
        this.userInput.startFocus();


        const submitButton = game.add.button(MAX_X / 2, MAX_Y - 80, SPRITE_SHEETS.START_BUTTON, this.onSubmit, this, 0, 1, 2);
        submitButton.anchor.set(0.5, 0.5);


        this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(this.onSubmit, this);

        this.invalidEmail = game.add.text(MAX_X / 2 + 320, MAX_Y - 150, 'Invalid Email', {
            font: '30px Arial',
            fill: '#ff0000',
        });
        this.invalidEmail.anchor.set(0.5);
        this.invalidEmail.visible = false;
    },

    onSubmit: function() {
        this.onSetUserName(this.userInput.value.trim());
    },

    onSetUserName: function(name) {
        if (isValidEmail(name)) {
            amplitude.getInstance().setUserId(name);
            var identify = new amplitude.Identify().set('version', GAME_VERSION);
            amplitude.getInstance().identify(identify);

            userName = name;

            amplitude.getInstance().logEvent('User Logged In');

            game.state.start('menu');
        } else {
            this.invalidEmail.visible = true;

            amplitude.getInstance().logEvent('Invalid Email');

            this.userInput.startFocus();
        }
    },
};

// screen to select a vehicle
var menuState = {
    create: function() {
        this.backgrounds = STAGE_LIST.map(stage => {
            background = game.add.tileSprite(0, 0, stageToBackgroundLength[stage], MAX_Y, BACKGROUNDS[stage]);
            background.stageType = stage;
            return background
        });
        this.backgrounds.forEach((background) => {
            background.visible = background.stageType === selectedStage;
        });

        // Title instructions
        const titleLabel = game.add.text(
            80,
            20,
            'Data Explorer',
            {
                font: '40px Arial',
                fill: '#ffffff',
            });
        // instructions
        const instructions = game.add.text(
            80,
            80,
            'Help Datamonster soar through the skies!\nTap or hold space to fly higher.',
            {
                font: '25px Arial',
                fill: '#ffffff',
            });

        // logic for selecting vehicle
        this.vehicles = ALL_VEHICLE_LIST.map(vehicle => {
            const modifier = vehicleToBodyModifier[vehicle];
            let sprite;
            if (IS_SPRITE_SHEET[vehicle]) {
                sprite = game.add.sprite(START_X, START_Y, SPRITE_SHEETS[vehicle], 0);
            } else {
                sprite = game.add.sprite(START_X, START_Y, SPRITES[vehicle]);
            }
            sprite.anchor.setTo(0.5, 0.5);

            if (VEHICLE_TO_BASE_VEHICLE[vehicle] === VEHICLES.ROCKET) {
                // scale down
                sprite.scale.setTo(0.5, 0.5);
            } else if (VEHICLE_TO_BASE_VEHICLE[vehicle] === VEHICLES.SQUARE) {
                // scale down
                sprite.scale.setTo(0.25, 0.25);
            }
            sprite.angle = vehicleAngleOffset[VEHICLE_TO_BASE_VEHICLE[vehicle]]
            sprite.vehicleType = vehicle;
            return sprite;
        });

        this.vehicles.forEach((vehicleSprite) => {
            vehicleSprite.visible = vehicleSprite.vehicleType === vehicleType;
        });

        // HITBOX TOGGLE
        const hitBoxLabel = game.add.text(MAX_X - 170, MAX_Y - 140, 'Show Hitboxes:',  {
            font: '24px Arial',
            fill: '#ffffff',
        });
        hitBoxLabel.anchor.set(0.5, 0.5);
        const hitBoxButton = game.add.button(MAX_X - 50, MAX_Y - 140, SPRITE_SHEETS.BUTTON, this.toggleDebug, this, 0, 0, 0);
        hitBoxButton.anchor.set(0.5, 0.5);
        this.hitBoxButtonLabel = game.add.text(MAX_X - 50, MAX_Y - 136, DEBUG ? 'ON' : 'OFF', {
            font: '16px Arial',
            fill: '#ffffff',
        });
        this.hitBoxButtonLabel.anchor.set(0.5, 0.5);

        // DIFFICULTY TOGGLE
        const difficultyLabel = game.add.text(MAX_X - 140, MAX_Y - 50, 'Difficulty:',  {
            font: '24px Arial',
            fill: '#ffffff',
        });
        difficultyLabel.anchor.set(0.5, 0.5);
        const hardButton = game.add.button(MAX_X - 50, MAX_Y - 50, SPRITE_SHEETS.BUTTON, this.toggleDifficulty, this, 0, 0, 0);
        hardButton.anchor.set(0.5, 0.5);
        this.hardButtonLabel = game.add.text(MAX_X - 50, MAX_Y - 45, EASY_MODE ? 'Easy' : 'Hard', {
            font: '16px Arial',
            fill: '#ffffff',
        });
        this.hardButtonLabel.anchor.set(0.5, 0.5);

        game.add.sprite(0, 0, SPRITES.INSTRUCTIONS);
        // // start instructions
        // const startLabel = game.add.text(
        //     80,
        //     MAX_Y - 140,
        //     'Use the Up and Down arrows to change stages\nUse the Left and Right arrows to select a vehicle\nPress Space to start!',
        //     {
        //         font: '25px Arial',
        //         fill: '#ffffff',
        //     });

        const bestLabel = game.add.text(MAX_X - 220, 20, 'Best Score: ' + localHighScore, { font: '25px Arial', fill: '#ffffff'});

        this.leftArrow = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightArrow = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.upArrow = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downArrow = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.secretKey = game.input.keyboard.addKey(Phaser.Keyboard.A);

        this.leftArrow.onDown.add(this.onLeft, this);
        this.rightArrow.onDown.add(this.onRight, this);
        this.upArrow.onDown.add(this.onUp, this);
        this.downArrow.onDown.add(this.onDown, this);
        this.spaceKey.onDown.addOnce(this.start, this);
        this.secretKey.onDown.add(this.onSecretKey, this);
    },
    start: function () {
        var identify = new amplitude.Identify().set('vehicle', vehicleToAnalyticsName[vehicleType]).set('stage', selectedStage).set('vehicle class', vehicleToAnalyticsName[baseVehicleType]);
        amplitude.getInstance().identify(identify);
        amplitude.getInstance().logEvent('Game Started', { difficulty: EASY_MODE ? 'easy' : 'hard' });
        game.state.start('play');
    },
    update: function() {
        this.backgrounds.forEach((background) => {
            background.visible = background.stageType === selectedStage;
        });
        this.vehicles.forEach((vehicleSprite) => {
            vehicleSprite.visible = vehicleSprite.vehicleType === vehicleType;
        });
    },
    toggleDifficulty: function() {
        EASY_MODE = !EASY_MODE && vehicleType !== VEHICLES.SQUARE;
        this.hardButtonLabel.text = EASY_MODE ? 'Easy' : 'Hard';

        amplitude.getInstance().logEvent('Difficulty Changed', { difficulty: EASY_MODE ? 'easy' : 'hard' });
    },
    toggleDebug: function() {
        DEBUG = !DEBUG && vehicleType !== VEHICLES.SQUARE;
        this.hitBoxButtonLabel.text = DEBUG ? 'ON' : 'OFF';

        amplitude.getInstance().logEvent('Toggle Hit Boxes', { hitboxes: DEBUG })
    },
    onSecretKey: function() {
        vehicleType = VEHICLES.SQUARE;
        baseVehicleType = VEHICLES.SQUARE;
        this.toggleDifficulty();
        this.toggleDebug();

        amplitude.getInstance().logEvent('Secret Ship Selected');
    },
    onUp: function() {
        const lastStage = selectedStage;
        selectedStageIndex = (selectedStageIndex + 1) % STAGE_LIST.length;
        selectedStage = STAGE_LIST[selectedStageIndex];

        const eventProperties = {
            direction: 'up',
            lastStage: stageToAnalyticsName[lastStage],
            stage: stageToAnalyticsName[selectedStage],
        };
        amplitude.getInstance().logEvent('Cycle Stage', eventProperties);
    },
    onDown: function() {
        const lastStage = selectedStage;

        selectedStageIndex -= 1;
        if (selectedStageIndex < 0) {
            selectedStageIndex += STAGE_LIST.length;
        }
        selectedStage = STAGE_LIST[selectedStageIndex];

        const eventProperties = {
            direction: 'down',
            lastStage: stageToAnalyticsName[lastStage],
            stage: stageToAnalyticsName[selectedStage],
        };
        amplitude.getInstance().logEvent('Cycle Stage', eventProperties);
    },
    onLeft: function() {
        const lastType = vehicleType;

        vehicleIndex -= 1;
        if (vehicleIndex < 0) {
            vehicleIndex += VEHICLE_LIST.length;
        }
        vehicleType = VEHICLE_LIST[vehicleIndex];
        baseVehicleType = VEHICLE_TO_BASE_VEHICLE[vehicleType];

        const eventProperties = {
            direction: 'left',
            lastVehicle: vehicleToAnalyticsName[lastType],
            vehicle: vehicleToAnalyticsName[vehicleType],
        };
        amplitude.getInstance().logEvent('Cycle Vehicle', eventProperties);
    },
    onRight: function() {
        const lastType = vehicleType;

        vehicleIndex = (vehicleIndex + 1) % VEHICLE_LIST.length;
        vehicleType = VEHICLE_LIST[vehicleIndex];
        baseVehicleType = VEHICLE_TO_BASE_VEHICLE[vehicleType];

        const eventProperties = {
            direction: 'right',
            lastVehicle: vehicleToAnalyticsName[lastType],
            vehicle: vehicleToAnalyticsName[vehicleType],
        };
        amplitude.getInstance().logEvent('Cycle Vehicle', eventProperties);
    },
};

// Create our 'main' state that will contain the game
var playState = {
    // set up the game, display sprites, etc.
    create: function() {
        // analytics
        this.startTime = game.time.now;
        this.spaceCount = 0;
        this.skyCactusCount = 0;
        this.groundCactusCount = 0;
        this.barCount = 0;
        this.coinCount = 0;
        this.bigCoinCount = 0;

        this.currentPattern = null;
        this.lastPattern = null;

        // SETUP ENTITIES
        this.background = addBackground();

        // start vehicle at start of screen

        if (IS_SPRITE_SHEET[vehicleType]) {
            this.vehicle = game.add.sprite(START_X, START_Y, SPRITE_SHEETS[vehicleType], 0);
        } else {
            this.vehicle = game.add.sprite(START_X, START_Y, SPRITES[vehicleType]);
        }

        this.vehicle.ampData = {
            vehicle: vehicleToAnalyticsName[vehicleType],
        };

        // Add physics to the vehicle, needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.vehicle);
        // Add gravity to the vehicle to make it fall
        this.vehicle.body.gravity.y = vehicleToGravity[baseVehicleType];
        this.vehicle.anchor.setTo(0.5, 0.5);
        if (baseVehicleType === VEHICLES.ROCKET) {
            // scale down
            this.vehicle.scale.setTo(0.5, 0.5);
        } else if (baseVehicleType === VEHICLES.SQUARE) {
            // scale down
            this.vehicle.scale.setTo(0.25, 0.25);
        }
        const bodyModifier = vehicleToBodyModifier[baseVehicleType];
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

        this.bestLabel = game.add.text(MAX_X - 220, 20, 'Best Score: ' + localHighScore, { font: '25px Arial', fill: '#ffffff'});

        // create objects
        this.spawnObjects();
        this.obstacleTimer = game.time.events.loop(vehicleToObstacleTimeout[baseVehicleType], this.spawnObjects, this);

        this.canRestart = false;
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "Score: 0", { font: "30px Arial", fill: "#ffffff" });

        // analytics
        this.startTime = game.time.now;
        this.spaceCount = 0;
        this.skyCactusCount = 0;
        this.groundCactusCount = 0;
        this.barCount = 0;
        this.coinCount = 0;
        this.bigCoinCount = 0;

        this.currentPattern = null;
        this.lastPattern = null;
    },

    update: function() {
        if (this.vehicle.alive) {
            // slide background
            this.background.tilePosition.x += -1;

            // if the vehicle hits the top, bounce off
            if (this.vehicle.y < 0) {
                // bounce off the wall
                this.vehicle.body.velocity.y = Math.max(Math.abs(this.vehicle.body.velocity.y) / 2, vehicleToVelocityDelta[baseVehicleType] / 2);
            }
            // If the vehicle is hit the bottom
            // Call the 'restartGame' function
            if (this.vehicle.y + this.vehicle.body.height / 2> MAX_Y) {
                this.gameOver('crash landing');
            } else {
                // check collisions
                game.physics.arcade.overlap(this.vehicle, this.obstacles, (vehicle, obstacle) => {
                    if (this.vehicle.alive) {
                        this.gameOver(obstacle.ampData.type);
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
            let acceleration = vehicleToVelocityDelta[baseVehicleType] * 2;
            if (baseVehicleType === VEHICLES.ROCKET) {
                acceleration = vehicleToGravity[baseVehicleType];
            }
            this.vehicle.body.acceleration.y = -vehicleToGravity[baseVehicleType] - acceleration;
            if (game.time.now > this.fuelTime) {
                this.currentFuel -= 1;
                this.fuelTime = game.time.now + vehicleToFuelDrainMillis[baseVehicleType];
            }
            if (IS_SPRITE_SHEET[vehicleType]) {
                this.vehicle.frame = 1;
            }
        } else {
            this.vehicle.body.acceleration.y = 0;
            if (IS_SPRITE_SHEET[vehicleType]) {
                if (this.vehicle.alive) {
                    this.vehicle.frame = 0;
                } else {
                    this.vehicle.frame = 2;
                }
            }
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
        if (this.vehicle.alive) {
            this.vehicle.angle = vehicleAngleOffset[baseVehicleType] + (this.vehicle.body.velocity.y / vehicleVelocityToAngleRatio[baseVehicleType]);
        } else {
            this.vehicle.angle += 5;
        }
    },

    // debugging
    render: function() {
        if (DEBUG) {
            // game.debug.bodyInfo(this.vehicle, 32, 32);
            game.debug.body(this.vehicle);
            this.obstacles.forEach((obstacle) => game.debug.body(obstacle));
        }
    },

    initSprite: function(sprite) {
        // enable physics
        game.physics.arcade.enable(sprite);
        // move sprite
        sprite.body.velocity.x = vehicleToSpeed[baseVehicleType];
        // clean up sprite when not visible
        sprite.checkWorldBounds = true;
        sprite.outOfBoundsKill = true;
    },

    addPipes: function() {
        addPipeColumn(this.obstacles);
    },
    addBar: function(xOffset, yOffset) {
        const bar = game.add.sprite(MAX_X + xOffset, yOffset, OBSTACLE_SPRITES[selectedStage].LONG);
        this.obstacles.add(bar);
        this.initSprite(bar);

        bar.body.setSize(400, 50, 0, 0)
        bar.ampData = {
            type: 'long bar',
            marked: false,
        }
    },
    addCloud: function(xOffset, yOffset) {
        const cloud = game.add.sprite(MAX_X + xOffset, yOffset, OBSTACLE_SPRITES[selectedStage].CLOUD);
        this.obstacles.add(cloud);
        this.initSprite(cloud);

        cloud.body.setSize(172, 184, 14, 8);
        if (!EASY_MODE) {
            cloud.scale.setTo(1.2, 1.2);
        }
        cloud.ampData = {
            type: 'large floating object',
            marked: false,
        }
    },
    addRock: function(xOffset, yOffset) {
        const yBase = EASY_MODE ? groundCactusY : groundCactusYHard;
        const rock = game.add.sprite(MAX_X + xOffset, yBase + yOffset, OBSTACLE_SPRITES[selectedStage].ROCK);
        this.obstacles.add(rock);
        this.initSprite(rock);

        rock.body.setSize(156, 164, 12, 8);
        if (!EASY_MODE) {
            rock.scale.setTo(1.3, 1.3);
        }
        rock.ampData = {
            type: 'large grounded object',
            marked: false,
        }
    },
    addCoin1: function(xOffset, yOffset) {
        const coin = game.add.sprite(MAX_X + xOffset, yOffset, SPRITES.COIN_1);
        this.coins.add(coin);
        this.initSprite(coin);

        coin.ampData = {
            value: 1,
            type: 'coin',
            marked: false,
        };
    },
    addCoinA: function(xOffset, yOffset) {
        const coin = game.add.sprite(MAX_X + xOffset, yOffset, SPRITES.COIN_A);
        this.coins.add(coin);
        this.initSprite(coin);

        coin.ampData = {
            value: 10,
            type: 'amplitude coin',
            marked: false,
        };
    },
    renderPattern: function(pattern) {
        pattern.forEach(patternObj => {
            const xOffset = patternObj.x * X_OFFSET_INCR;
            const yOffset = patternObj.y * Y_OFFSET_INCR;
            switch (patternObj.type) {
                case 'c':
                    this.addCloud(xOffset, yOffset);
                    break;
                case 'g':
                    this.addRock(xOffset, 0);
                    break;
                case '_':
                    this.addBar(xOffset, yOffset);
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
        this.lastPattern = this.currentPattern;
        if (EASY_MODE) {
            // const patternIdx = 0;
            const patternIdx = Math.floor(Math.random() * easySpawnPatterns.length);
            // spawn patterns defined in external file
            this.renderPattern(easySpawnPatterns[patternIdx]);
            this.currentPattern = patternIdx;
        } else {
            // const patternIdx = 0;
            const patternIdx = Math.floor(Math.random() * spawnPatterns.length);
            // spawn patterns defined in external file
            this.renderPattern(spawnPatterns[patternIdx]);
            this.currentPattern = patternIdx;
        }

        const eventProperties = this.getAnalyticsEventProperties();
        amplitude.getInstance().logEvent('Obstacles Spawned', eventProperties);
    },

    onSpace: function() {
        // Make the vehicle jump
        if (this.vehicle.alive && this.currentFuel > 0) {
            // Add a vertical velocity to the vehicle
            this.vehicle.body.velocity.y -= vehicleToVelocityDelta[baseVehicleType];
            this.spaceCount += 1;
            this.currentFuel -= 1;
            this.fuelTime = game.time.now + vehicleToFuelDrainMillis[baseVehicleType];
        } else {
            // Start the 'main' state, which restarts the game
            if (this.canRestart) {
                game.state.start('menu');
            }
        }
    },
    onCollectCoin: function(coinSprite) {
        this.score += coinSprite.ampData.value;
        this.labelScore.text = 'Score: ' + this.score;
        if (this.score > localHighScore) {
            localHighScore = this.score;
            this.bestLabel.text = 'Best Score: ' + localHighScore;
        }
        this.maybeMarkCoin(coinSprite);
        // const eventProperties = this.getAnalyticsEventProperties();
        // eventProperties['type'] = coinSprite.ampData.type;
        // amplitude.getInstance().logEvent('Item Collected', eventProperties);

        coinSprite.destroy();
    },
    // Restart the game
    gameOver: function(cause) {
        this.vehicle.alive = false;
        this.vehicle.body.gravity.y = vehicleToGravity[baseVehicleType] / 2;
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
                fill: '#ff1111',
            });

        // analytics + leaderboard
        const eventProperties = this.getAnalyticsEventProperties();
        eventProperties['cause of death'] = cause;
        eventProperties['out of fuel'] = this.currentFuel <= 0;
        amplitude.getInstance().logEvent('Game Ended', eventProperties);
        logHighscore(this.score, eventProperties.duration, vehicleType, selectedStage);
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
            if (obstacle.ampData.type === 'large grounded object') {
                this.groundCactusCount += 1;
            } else if (obstacle.ampData.type === 'long bar') {
                this.barCount += 1;
            } else {
                this.skyCactusCount += 1;
            }
            obstacle.ampData.marked = true;
        }
    },
    getAnalyticsEventProperties: function() {
        return {
            'score': this.score || 0,
            'fuel left': this.currentFuel,
            'fuel fraction': this.currentFuel / maxFuel,
            'duration': Math.floor((game.time.now - this.startTime) / 1000),
            'large ground obstacle count': this.groundCactusCount,
            'large air obstacle count': this.skyCactusCount,
            'long bar obstacle count': this.barCount,
            'coin count': this.coinCount,
            'amplitude coin count': this.bigCoinCount,
            'spacebar down count': this.spaceCount,
            'hitboxes on': DEBUG,
            'difficulty': EASY_MODE ? 'easy' : 'hard',
            'last pattern index': this.lastPattern || -1,
            'current pattern index': this.currentPattern || -1,
        };
    }
};


// Initialize Phaser and main frame
var game = new Phaser.Game(MAX_X, MAX_Y, Phaser.AUTO);

Phaser.Device.whenReady(function() {
    game.plugins.add(PhaserInput.Plugin);

    // add game states
    game.state.add('boot', bootState);
    game.state.add('load', loadState);
    game.state.add('login', loginState);
    game.state.add('menu', menuState);
    game.state.add('play', playState);
    // Start the state to actually start the game
    game.state.start('boot');
});

