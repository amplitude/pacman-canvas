/*-------------------------------------------------------------------

	___________    ____   _____ _____    ____
	\____ \__  \ _/ ___\ /     \\__  \  /    \
	|  |_> > __ \\  \___|  Y Y  \/ __ \|   |  \
	|   __(____  /\___  >__|_|  (____  /___|  /
	|__|       \/     \/      \/     \/     \/ .platzh1rsch.ch

	author: platzh1rsch		(www.platzh1rsch.ch)

-------------------------------------------------------------------*/

"use strict";

// CONSTANTS + LOGIC FOR RENDERING
let CELL_PIXELS = 30; // number of pixels in a cell - should be a multiple of 2
let MOVE_SPEED_IN_PIXELS = 5; // should divide CELL_PIXELS evenly
let DAZZLE_SPEED_IN_PIXELS = 2;
let PILL_FONT_SIZE = 13;
let POWER_PILL_SIZE = 8;

// fixed map size (for now) - should match up with map.json file being loaded
const useSmallMap = false;
const SMALL_MAP_CONFIG = "data/map.json";
const LARGE_MAP_DOT_CONFIG = "data/dot-map.txt";

let GRID_MAX_X, GRID_MAX_Y, GHOST_CONFS, GHOST_HOUSE_DIR_OVERRIDES, PAC_CONF;
if (useSmallMap) {
	GRID_MAX_X = 18;
	GRID_MAX_Y = 13;
	GHOST_CONFS = {
		'pinky': { 'gridStartX': 7, 'gridStartY': 5, 'gridBaseX': 2, 'gridBaseY': 2, 'imgLoc': 'img/ghosts/pinky.svg' },
		'inky': { 'gridStartX': 8, 'gridStartY': 5, 'gridBaseX': 13, 'gridBaseY': 11, 'imgLoc': 'img/ghosts/Inky.svg' },
		'blinky': { 'gridStartX': 9, 'gridStartY': 5, 'gridBaseX': 13, 'gridBaseY': 0, 'imgLoc': 'img/ghosts/blinky.svg' },
		'clyde': { 'gridStartX': 10, 'gridStartY': 5, 'gridBaseX': 2, 'gridBaseY': 11, 'imgLoc': 'img/ghosts/clyde.svg' },
	};
	GHOST_HOUSE_DIR_OVERRIDES = { '7,5': 'right', '8,5': 'up', '9,5': 'up', '10,5': 'left', '8,4': 'exit', '9,4': 'exit' };
	PAC_CONF = { 'radius': 15, 'gridStartX': '0', 'gridStartY': '6', 'color': 'Yellow'};
} else {
	GRID_MAX_X = 28;
	GRID_MAX_Y = 31;
	GHOST_CONFS = {
		'pinky': { 'gridStartX': 12, 'gridStartY': 14, 'gridBaseX': 1, 'gridBaseY': 1, 'imgLoc': 'img/ghosts/pinky.svg' },
		'inky': { 'gridStartX': 13, 'gridStartY': 14, 'gridBaseX': 23, 'gridBaseY': 29, 'imgLoc': 'img/ghosts/Inky.svg' },
		'blinky': { 'gridStartX': 14, 'gridStartY': 14, 'gridBaseX': 26, 'gridBaseY': 1, 'imgLoc': 'img/ghosts/blinky.svg' },
		'clyde': { 'gridStartX': 15, 'gridStartY': 14, 'gridBaseX': 4, 'gridBaseY': 29, 'imgLoc': 'img/ghosts/clyde.svg' },
	};
	GHOST_HOUSE_DIR_OVERRIDES = { '12,14': 'right', '13,14': 'up', '14,14': 'up', '15,14': 'left', '13,13': 'up', '14,13': 'up',  '13,12': 'exit', '14,12': 'exit' };
	PAC_CONF = { 'radius': 25, 'gridStartX': '0', 'gridStartY': '14', 'color': '#ffaf86'};

	CELL_PIXELS = 45;
	MOVE_SPEED_IN_PIXELS = 9;
	DAZZLE_SPEED_IN_PIXELS = 3;
	PILL_FONT_SIZE = 20;
	POWER_PILL_SIZE = 15;
}

// helper for grid position getting - handles 1 out of bound
const getGridPosX = posX => {
	if (posX < 0) {
		posX = posX + (GRID_MAX_X * CELL_PIXELS);
	} else if (posX > GRID_MAX_X * CELL_PIXELS) {
		posX = posX - (GRID_MAX_X * CELL_PIXELS);
	}
	return (posX - (posX % CELL_PIXELS)) / CELL_PIXELS;
}
const getGridPosY = posY => {
	if (posY < 0) {
		posY = posY + (GRID_MAX_Y * CELL_PIXELS);
	} else if (posY > GRID_MAX_Y * CELL_PIXELS) {
		posY = posY - (GRID_MAX_Y * CELL_PIXELS);
	}
	return (posY - (posY % CELL_PIXELS)) / CELL_PIXELS;
}
// constants for small map
const WALL_PADDING = 8; // padding given to a wall
const DOOR_Y_OFFSET = 12; // top padding of door line from top of grid cells
const DOOR_THICKNESS = 1;

// helper for building a wall, 0,0 is the top left corner
const buildWall = function buildWall(context, gridX, gridY, width, height) {
	// we want to add padding inside wall rectangles
	const startX = gridX * CELL_PIXELS + WALL_PADDING;
	const startY = gridY * CELL_PIXELS + WALL_PADDING;
	const pixelWidth = width * CELL_PIXELS - (2 * WALL_PADDING);
	const pixelHeight = height * CELL_PIXELS - (2 * WALL_PADDING);
	context.fillRect(startX, startY, pixelWidth, pixelHeight);
};

// GAMEPLAY LOGIC AND CONSTANTS
const getFramesPerSecond = level => {
	switch (level) {
		case 1:
			return 25;
		case 2:
			return 25;
		default:
			return 30;
	}
}

const getGhostSpeed = function getGhostSpeed(level) {
	switch (level) {
		case 1:
			if (useSmallMap) {
				return 3.75;
			} else {
				return 7.5;
			}
		default:
			return MOVE_SPEED_IN_PIXELS;
	}
};

const getChaserSpeedPillThresholds = level => {
	// the chaser (blinky) gets faster after a certain number of things are eaten
	// [first speed bump, second speed bump]
	switch (level) {
		case 1:
			return [20, 10];
		case 2:
			return [40, 20];
		case 3:
			return [60, 30];
		default:
			return [100, 50];
	}
}

const getLevelTitle = function (level) {
	switch (level) {
		case 2:
			return '"A Little Faster"';
		// activate chase / scatter switching
		case 3:
			return '"The Last Level"';
		default:
			return '';
	}
}


function geronimo() {

	(function (e, t) {
		var n = e.amplitude || { _q: [], _iq: {} }; var r = t.createElement("script"); r.type = "text/javascript";
		r.async = true; r.src = "https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.4.0-min.gz.js";
		r.onload = function () { e.amplitude.runQueuedFunctions() }; var i = t.getElementsByTagName("script")[0];
		i.parentNode.insertBefore(r, i); function s(e, t) {
			e.prototype[t] = function () {
				this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
				return this
			}
		} var o = function () { this._q = []; return this }; var a = ["add", "append", "clearAll", "prepend", "set", "setOnce", "unset"];
		for (var u = 0; u < a.length; u++) { s(o, a[u]) } n.Identify = o; var c = function () {
			this._q = []; return this;
		}; var p = ["setProductId", "setQuantity", "setPrice", "setRevenueType", "setEventProperties"];
		for (var l = 0; l < p.length; l++) { s(c, p[l]) } n.Revenue = c; var d = ["init", "logEvent", "logRevenue", "setUserId", "setUserProperties", "setOptOut", "setVersionName", "setDomain", "setDeviceId", "setGlobalUserProperties", "identify", "clearUserProperties", "setGroup", "logRevenueV2", "regenerateDeviceId", "logEventWithTimestamp", "logEventWithGroups"];
		function v(e) {
			function t(t) {
				e[t] = function () {
					e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
				}
			} for (var n = 0; n < d.length; n++) { t(d[n]) }
		} v(n); n.getInstance = function (e) {
			e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase();
			if (!n._iq.hasOwnProperty(e)) { n._iq[e] = { _q: [] }; v(n._iq[e]) } return n._iq[e]
		}; e.amplitude = n;
	})(window, document);

	amplitude.getInstance().init("7ce925d7704fbb2104606431cacf209a");

	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: 'keymW1ZElKs4tF7ib' }).base('appCppypdYKJeG9QI');

	/* ----- Global Variables ---------------------------------------- */
	var canvas;
	var backgroundCanvas;
	var backgroundImageLoaded = false;
	var shouldRenderBackground = true;
	var joystick;
	var context;
	var backgroundContext;
	var game;
	var canvas_walls, context_walls;
	var inky, blinky, clyde, pinky;

	//var base = new Airtable({ apiKey: 'keymW1ZElKs4tF7ib' }).base('appCppypdYKJeG9QI');

	/* AJAX stuff */
	function startNewGame() {
		game.pause = true;
		game.loggedIn = false;
		game.running = false;

		// clear existing info
		$('#playerEmail').val('');
		$('#playerName').val('');
		// hide new game button
		$('#newGame').hide();
		startLogin();
	}

	function startLogin() {
		// show all the things needed to show and submit and email
		$('#canvas-overlay-container').show();
		$('#splash-screen').show();
		$('#email-form').show();
		$('#playerEmail').focus();
	}

	function getHighscore() {
		$("#highscore-list").text("");
		base('Scores').select({
			sort: [
				{ field: 'score', direction: 'desc' }
			],
			maxRecords: 20
		}).eachPage(function page(records, fetchNextPage) {
			records.forEach(function (record) {
				$("#highscore-list").append("<li>" + record.get('name') + "<span id='score'>" + record.get('score') + "</span></li>");
			});
			fetchNextPage();
		}, function done(error) {
			console.log(error);
		});
	}

	function addHighscore() {
		$("#highscore-form").html("Saving highscore...");
		base('Scores').create({
			'name': game.user,
			'email': game.email,
			'score': game.score.score,
			'level': game.level
		}, function (err, record) {
			if (err) {
				console.log(err);
				return;
			}
			console.log('Highscore added');
			$('#highscore-form').html('<span class="button" id="show-highscore">View Leaderboard</span>');
		});
	}

	function between(x, min, max) {
		return x >= min && x <= max;
	}


	// Logger
	var logger = function () {
		var oldConsoleLog = null;
		var pub = {};

		pub.enableLogger = function enableLogger() {
			if (oldConsoleLog === null)
				return;

			window['console']['log'] = oldConsoleLog;
		};

		pub.disableLogger = function disableLogger() {
			oldConsoleLog = console.log;
			window['console']['log'] = function () { };
		};

		return pub;
	}();

	// stop watch to measure the time
	function Timer() {
		this.time_diff = 0;
		this.time_start = 0;
		this.time_stop = 0;
		this.start = function () {
			this.time_start = new Date().getTime();
		}
		this.stop = function () {
			this.time_stop = new Date().getTime();
			this.time_diff += this.time_stop - this.time_start;
			this.time_stop = 0;
			this.time_start = 0;
		}
		this.reset = function () {
			this.time_diff = 0;
			this.time_start = 0;
			this.time_stop = 0;
		}
		this.get_time_diff = function () {
			return this.time_diff;
		}
	}

	// Manages the whole game ("God Object")
	function Game() {
		this.loggedIn = false;
		this.user;
		this.timer = new Timer();
		this.running = false;
		this.pause = true;
		this.score = new Score();
		this.soundfx = 0;
		this.map;
		this.pillCount;				// number of pills
		this.frameCount = 0;
		this.level = 1;
		this.refreshLevel = function (h) {
			$(h).html("Lvl: " + this.level);
		};
		this.gameOver = false;
		this.canvas = $("#myCanvas").get(0);
		this.wallColor = "#00A7CF";
		this.gridWidth = GRID_MAX_X;
		this.width = CELL_PIXELS * GRID_MAX_X;
		this.gridHeight = GRID_MAX_Y;
		this.height = CELL_PIXELS * GRID_MAX_Y;

		this.pillSize = 3;
		this.powerpillSize = POWER_PILL_SIZE;

		this.ghostFrightened = false;
		this.ghostFrightenedTimer = 240;
		this.ghostKillCount = 0;
		this.ghostMode = 0;			// 0 = Scatter, 1 = Chase
		this.ghostSpeedNormal = getGhostSpeed(this.level);
		this.ghostSpeedDazzled = DAZZLE_SPEED_IN_PIXELS; // global default for ghost speed when dazzled

		/* Game Functions */
		this.startGhostFrightened = function () {
			console.log("ghost frightened");
			this.ghostFrightened = true;
			this.ghostFrightenedTimer = 240;
			inky.dazzle();
			pinky.dazzle();
			blinky.dazzle();
			clyde.dazzle();
		};

		this.endGhostFrightened = function () {
			console.log("ghost frigthened end");
			this.ghostKillCount = 0;
			this.ghostFrightened = false;
			inky.undazzle();
			pinky.undazzle();
			blinky.undazzle();
			clyde.undazzle();
		};

		this.checkGhostMode = function () {
			if (this.ghostFrightened) {
				this.ghostFrightenedTimer--;
				if (this.ghostFrightenedTimer === 0) {
					this.endGhostFrightened();
					this.ghostFrigthenedTimer = 240;
					/*inky.reverseDirection();
					pinky.reverseDirection();
					clyde.reverseDirection();
					blinky.reverseDirection();*/
				}
			}
			const maybeScatter = () => {
				if (this.ghostMode === 1) {
					this.ghostMode = 0;

					game.buildWalls();
					inky.reverseDirection();
					pinky.reverseDirection();
					clyde.reverseDirection();
					blinky.reverseDirection();
				}
			};

			const maybeChase = () => {
				if (this.ghostMode === 0) {
					this.ghostMode = 1;
					game.buildWalls();
				}
			}

			// check frame count to see whether we are chasing or scattering
			// 7 seconds scatter -> 20 seconds chase
			// 7 seconds scatter -> 20 seconds chase
			// 7 seconds scatter -> 20 seconds chase
			// instant scatter -> chase
			// estimate 30 frames per second
			if (this.frameCount > 81 * 30) {
				maybeChase();
			} else if (this.frameCount === 81 * 30) {
				maybeScatter();
			} else if (this.frameCount > 61 * 30) {
				maybeChase();
			} else if (this.frameCount > 54 * 30) {
				maybeScatter();
			} else if (this.frameCount > 34 * 30) {
				maybeChase();
			} else if (this.frameCount > 27 * 30) {
				maybeScatter();
			} else if (this.frameCount > 7 * 30) {
				maybeChase();
			}
		};

		this.getMapContent = (gridX, gridY) => {
			const maxGridX = GRID_MAX_X;
			const maxGridY = GRID_MAX_Y;
			if (gridX < 0) gridX = maxGridX + gridX;
			if (gridX >= maxGridX) gridX = gridX - maxGridX;
			if (gridY < 0) gridY = maxGridY + gridY;
			if (gridY >= maxGridY) gridY = gridY - maxGridY;
			return this.map.posY[gridY].posX[gridX].type;
		};

		this.setMapContent = function (x, y, val) {
			this.map.posY[y].posX[x].type = val;
		};

		this.toggleSound = function () {
			this.soundfx === 0 ? this.soundfx = 1 : this.soundfx = 0;
			$('#mute').toggle();
			amplitude.getInstance().logEvent('Toggled.Sound');
		};

		this.reset = function () {
		};

		this.newGame = function () {
			console.log("new Game");
			amplitude.getInstance().logEvent('New.Game');
			this.init(0);
			this.pauseResume();
		};

		this.nextLevel = function () {
			this.level++;
			// for amplify, stop after level 3
			if (this.level === 4) {
				// reset stuff
				this.init(1);
				game.showMessage("You did it!", "Final Score: " + game.score.score + "<br/>(Click to Restart!)");
				game.gameOver = true;
				amplitude.getInstance().logEvent('Game.Over', { 'score': game.score.score, 'level': game.level, 'lives': pacman.lives });
				addHighscore();
				// $('#playerEmail').focus();]\
			} else {
				// update things for new level
				this.ghostSpeedNormal = getGhostSpeed(this.level);
				console.log("Level " + game.level);
				amplitude.getInstance().logEvent('Next.Level', { 'newLevel': game.level, 'lives': pacman.lives });
				game.showMessage("Level " + game.level, getLevelTitle(game.level) + "<br/>(Click to continue!)");
				game.refreshLevel(".level");
				this.init(1);
			}
		};

		this.drawHearts = function (count) {
			var html = "";
			for (var i = 0; i < count; i++) {
				html += " <img src='img/heart.png'>";
			}
			$(".lives").html("Lives: " + html);

		};

		this.showContent = function (id) {
			$('.content').hide();
			$('#' + id).show();
		};


		this.showMessage = function (title, text) {
			this.timer.stop();
			this.pause = true;
			$('#canvas-overlay-container').fadeIn(200);
			// NO CONTROLS
			// if ($('.controls').css('display') != "none") $('.controls').slideToggle(200);
			$('#canvas-overlay-content #title').text(title);
			$('#canvas-overlay-content #title').show();
			$('#canvas-overlay-content #text').html(text);
		};

		this.closeMessage = function () {
			$('#canvas-overlay-container').fadeOut(200);
			this.clearMessage();
			// NO CONTROLS
			// $('.controls').slideToggle(200);
		};

		this.clearMessage = function() {
			$('#canvas-overlay-content #title').text('');
			$('#canvas-overlay-content #text').html('');
		}

		this.pauseResume = function () {
			if (!this.running) {
				if (
					$('#playerEmail').val() === undefined || $('#playerEmail').val() === '' || $('#playerName').val() === undefined || $('#playerName').val() === '') {
					startLogin();
					console.log("don't start yet");
				} else if (this.loggedIn) {
					// start the game
					console.log("start");
					// start timer
					this.timer.start();

					this.pause = false;
					this.running = true;
					this.closeMessage();
					animationLoop();
				}
			} else if (this.gameOver) {
				this.clearMessage();
				startNewGame();
			} else if (this.pause) {
				// stop timer
				this.timer.stop();

				this.pause = false;
				this.closeMessage();
			} else {
				this.showMessage("Pause", "Click to Resume");
			}
		};

		this.init = function (state) {
			// state == 0 => new game

			console.log("init game " + state);

			// reset timer if restart
			if (state === 0) {
				this.timer.reset();
			}

			// get Small Level Map
			if (useSmallMap) {
				$.ajax({
					url: SMALL_MAP_CONFIG,
					async: false,
					beforeSend: function (xhr) {
						if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
					},
					dataType: "json",
					success: data => {
						this.map = data;
					}
				});
			} else {
				// parse dot map
				$.ajax({
					url: LARGE_MAP_DOT_CONFIG,
					async: false,
					beforeSend: function (xhr) {
						if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain");
					},
					dataType: "text",
					success: data => {
						// convert into the weird format that's used
						const posY = data.split('\n').map((line, idx) => {
							return {
								'row': idx + 1,
								'posX': line.split('').map((c, idx) => {
									let type;
									switch (c) {
										case 'x':
											type = 'wall';
											break;
										case '.':
											type = 'pill';
											break;
										case 'o':
											type = 'powerpill'
											break;
										case 'd':
											type = 'door'
											break;
										default:
											type = 'null';
									}
									return {
										'col': idx + 1,
										'type': type,
									};
								}),
							};
						});
						this.map = { 'posY': posY  };
					}
				});
			}

			let pillCount = 0;
			this.map.posY.forEach(rowObj => {
				rowObj.posX.forEach(obj => {
					if (obj.type == "pill") {
						pillCount++;
					}
				});
			});
			this.pillCount = pillCount;

			if (state === 0) {
				this.score.set(0);
				this.score.refresh(".score");
				pacman.lives = 3;
				game.level = 1;
				this.refreshLevel(".level");
				game.gameOver = false;
				amplitude.logEvent('Game.Started');
			}
			pacman.reset();

			game.drawHearts(pacman.lives);

			this.frameCount = 0;
			this.ghostKillCount = 0;
			this.ghostFrightened = false;
			this.ghostFrightenedTimer = 240;
			this.ghostMode = 0;			// 0 = Scatter, 1 = Chase
			// reset wall color
			game.buildWalls();

			// initalize Ghosts, avoid memory flooding
			if (pinky === null || pinky === undefined) {
				pinky = new Ghost("pinky", GHOST_CONFS.pinky);
				inky = new Ghost("inky", GHOST_CONFS.inky);
				blinky = new Ghost("blinky", GHOST_CONFS.blinky);
				clyde = new Ghost("clyde", GHOST_CONFS.clyde);
			} else {
				//console.log("ghosts reset");
				pinky.reset();
				inky.reset();
				blinky.reset();
				clyde.reset();
			}
			blinky.start();	// blinky is the first to leave ghostHouse
			inky.start();
			pinky.start();
			clyde.start();
		};

		this.check = function () {
			if ((this.pillCount === 0) && game.running) {
				this.nextLevel();
			}
		};

		this.win = function () { };
		this.gameover = function () { };

		this.toPixelPos = function (gridPos) {
			return gridPos * CELL_PIXELS;
		};

		/* ------------ Start Pre-Build Walls  ------------ */
		this.buildWalls = function () {
			if (useSmallMap) {
				// should rerender background probably
				shouldRenderBackground = true;
				if (this.ghostMode === 0) game.wallColor = "#00A7CF";
				else game.wallColor = "Red";
				canvas_walls = document.createElement('canvas');
				canvas_walls.width = game.canvas.width;
				canvas_walls.height = game.canvas.height;
				context_walls = canvas_walls.getContext("2d");

				context_walls.fillStyle = game.wallColor;
				context_walls.strokeStyle = game.wallColor;

				//horizontal outer
				buildWall(context_walls, 0, 0, 18, 1);
				buildWall(context_walls, 0, 12, 18, 1);

				// vertical outer
				buildWall(context_walls, 0, 0, 1, 6);
				buildWall(context_walls, 0, 7, 1, 6);
				buildWall(context_walls, 17, 0, 1, 6);
				buildWall(context_walls, 17, 7, 1, 6);

				// ghost base
				buildWall(context_walls, 7, 4, 1, 1);
				buildWall(context_walls, 6, 5, 1, 2);
				buildWall(context_walls, 10, 4, 1, 1);
				buildWall(context_walls, 11, 5, 1, 2);
				buildWall(context_walls, 6, 6, 6, 1);

				// ghost base door - no left-right padding, place at wall padding (thickness 1)
				context_walls.fillRect(8 * CELL_PIXELS, 4 * CELL_PIXELS + DOOR_Y_OFFSET, 2 * CELL_PIXELS, DOOR_THICKNESS);

				// single blocks
				buildWall(context_walls, 4, 0, 1, 2);
				buildWall(context_walls, 13, 0, 1, 2);

				buildWall(context_walls, 2, 2, 1, 2);
				buildWall(context_walls, 6, 2, 2, 1);
				buildWall(context_walls, 15, 2, 1, 2);
				buildWall(context_walls, 10, 2, 2, 1);

				buildWall(context_walls, 2, 3, 2, 1);
				buildWall(context_walls, 14, 3, 2, 1);
				buildWall(context_walls, 5, 3, 1, 1);
				buildWall(context_walls, 12, 3, 1, 1);
				buildWall(context_walls, 3, 3, 1, 3);
				buildWall(context_walls, 14, 3, 1, 3);

				buildWall(context_walls, 3, 4, 1, 1);
				buildWall(context_walls, 14, 4, 1, 1);

				buildWall(context_walls, 0, 5, 2, 1);
				buildWall(context_walls, 3, 5, 2, 1);
				buildWall(context_walls, 16, 5, 2, 1);
				buildWall(context_walls, 13, 5, 2, 1);

				buildWall(context_walls, 0, 7, 2, 2);
				buildWall(context_walls, 16, 7, 2, 2);
				buildWall(context_walls, 3, 7, 2, 2);
				buildWall(context_walls, 13, 7, 2, 2);

				buildWall(context_walls, 4, 8, 2, 2);
				buildWall(context_walls, 12, 8, 2, 2);
				buildWall(context_walls, 5, 8, 3, 1);
				buildWall(context_walls, 10, 8, 3, 1);

				buildWall(context_walls, 2, 10, 1, 1);
				buildWall(context_walls, 15, 10, 1, 1);
				buildWall(context_walls, 7, 10, 4, 1);
				buildWall(context_walls, 4, 11, 2, 2);
				buildWall(context_walls, 12, 11, 2, 2);
				/* ------------ End Pre-Build Walls  ------------ */
			}
		};
	}

	game = new Game();



	function Score() {
		this.score = 0;
		this.set = function (i) {
			this.score = i;
		};
		this.add = function (i) {
			this.score += i;
		};
		this.refresh = function (h) {
			$(h).html("Score: " + this.score);
		};

	}



	// used to play sounds during the game
	var Sound = {};
	Sound.play = function (sound) {
		if (game.soundfx == 1) {
			var audio = document.getElementById(sound);
			(audio !== null) ? audio.play() : console.log(sound + " not found");
		}
	};


	// Direction object in Constructor notation
	function Direction(name, angle1, angle2, dirX, dirY) {
		this.name = name;
		this.angle1 = angle1;
		this.angle2 = angle2;
		this.dirX = dirX;
		this.dirY = dirY;
		this.equals = function (dir) {
			return JSON.stringify(this) == JSON.stringify(dir);
		};
	}

	// Direction Objects
	var up = new Direction("up", 1.75, 1.25, 0, -1);		// UP
	var left = new Direction("left", 1.25, 0.75, -1, 0);	// LEFT
	var down = new Direction("down", 0.75, 0.25, 0, 1);		// DOWN
	var right = new Direction("right", 0.25, 1.75, 1, 0);	// RIGHT
	/*var directions = [{},{},{},{}];
	directions[0] = up;
	directions[1] = down;
	directions[2] = right;
	directions[3] = left;*/


	// DirectionWatcher
	function directionWatcher() {
		this.dir = null;
		this.set = function (dir) {
			this.dir = dir;
		};
		this.get = function () {
			return this.dir;
		};
	}

	// Ghost object in Constructor notation
	function Ghost(name, ghostConf) {
		const gridStartX = ghostConf.gridStartX;
		const gridStartY = ghostConf.gridStartY;
		const gridBaseX = ghostConf.gridBaseX;
		const gridBaseY = ghostConf.gridBaseY;
		const image = ghostConf.imgLoc;

		this.name = name;
		this.posX = gridStartX * CELL_PIXELS;
		this.posY = gridStartY * CELL_PIXELS;
		this.startPosX = gridStartX * CELL_PIXELS;
		this.startPosY = gridStartY * CELL_PIXELS;
		this.gridStartX = gridStartX;
		this.gridStartY = gridStartY;
		this.gridBaseX = gridBaseX;
		this.gridBaseY = gridBaseY;
		this.speed = game.ghostSpeedNormal;
		this.images = JSON.parse(
			'{"normal" : {'
			+ '"inky" : "0",'
			+ '"pinky" : "1",'
			+ '"blinky" : "2",'
			+ '"clyde" : "3"'
			+ '},'
			+
			'"frightened1" : {'
			+
			'"left" : "", "up": "", "right" : "", "down": ""},'
			+
			'"frightened2" : {'
			+
			'"left" : "", "up": "", "right" : "", "down": ""},'
			+
			'"dead" : {'
			+
			'"left" : "", "up": "", "right" : "", "down": ""}}'
		);
		this.image = new Image();
		this.image.src = image;
		this.stopped = true; // in case we don't want to have all ghosts moving
		this.ghostHouse = true;
		this.dazzled = false;
		this.dead = false;
		this.start = () => {
			this.stopped = false;
		}
		this.stop = () => {
			this.stopped = true;
		}
		this.dazzle = () => {
			this.changeSpeed(game.ghostSpeedDazzled);
			// ensure ghost doesnt leave grid
			if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
			if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
			this.dazzled = true;
		}
		this.undazzle = () => {
			// only change speed if ghost is not "dead"
			if (!this.dead) this.changeSpeed(game.ghostSpeedNormal);
			// ensure ghost doesnt leave grid
			if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
			if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
			this.dazzled = false;
		}
		this.dazzleImg = new Image();
		this.dazzleImg.src = 'img/dazzled.svg';
		this.dazzleImg2 = new Image();
		this.dazzleImg2.src = 'img/dazzled2.svg';
		this.deadImg = new Image();
		this.deadImg.src = 'img/dead.svg';
		this.direction = right;
		this.radius = pacman.radius;
		this.draw = function (context) {
			if (this.dead) {
				context.drawImage(this.deadImg, this.posX, this.posY, CELL_PIXELS, CELL_PIXELS);
			}
			else if (this.dazzled) {
				if (pacman.beastModeTimer < 50 && pacman.beastModeTimer % 8 > 1) {
					context.drawImage(this.dazzleImg2, this.posX, this.posY, CELL_PIXELS, CELL_PIXELS);
				} else {
					context.drawImage(this.dazzleImg, this.posX, this.posY, CELL_PIXELS, CELL_PIXELS);
				}
			}
			else context.drawImage(this.image, this.posX, this.posY, CELL_PIXELS, CELL_PIXELS);
		}
		this.getCenterX = function () {
			return this.posX + CELL_PIXELS / 2;
		}
		this.getCenterY = function () {
			return this.posY + CELL_PIXELS / 2;
		}

		this.reset = function () {
			this.dead = false;
			this.posX = this.startPosX;
			this.posY = this.startPosY;
			this.ghostHouse = true;
			// set new speed, etc
			this.undazzle();
		}

		this.die = function () {
			if (!this.dead) {
				amplitude.getInstance().logEvent('Killed.Ghost', { 'name': name, 'lives': pacman.lives });
				game.score.add(100 * Math.pow(2, game.ghostKillCount));
				//this.reset();
				this.dead = true;
				this.changeSpeed(game.ghostSpeedNormal);
			}
		}
		this.changeSpeed = function (s) {
			// adjust gridPosition to new speed
			this.posX = Math.round(this.posX / s) * s;
			this.posY = Math.round(this.posY / s) * s;
			this.speed = s;
		}

		this.move = () => {
			// Check for direction changes first (if aligned to the grid)
			if (this.isAlignedToGrid(this.posX, this.posY)) {
				// set the new direction to go
				const dir = this.getNextDirection();
				if (!!dir) {
					this.setDirection(dir);
				}
			}
			this.checkCollision();

			// If in the Ghost House, override any direction movement to "exit"
			if (this.ghostHouse == true && this.isAlignedToGrid(this.posX, this.posY)) {
				const posKey = `${getGridPosX(this.posX)},${getGridPosY(this.posY)}`;
				const override = GHOST_HOUSE_DIR_OVERRIDES[posKey];
				switch (override) {
					case 'up':
						this.setDirection(up);
						break;
					case 'right':
						this.setDirection(right);
						break;
					case 'left':
						this.setDirection(left);
						break;
					case 'exit':
						this.ghostHouse = false;
						break;
				}
				console.log(this.name + " " + posKey + " " + override);
			}

			this.moveFigure();
		}

		this.checkCollision = function () {

			/* Check Back to Home */
			if (this.dead && getGridPosX(this.posX) == this.gridStartX && getGridPosY(this.posY) == this.gridStartY) this.reset();
			else {

				/* Check Ghost / Pacman Collision			*/
				if ((between(pacman.getCenterX(), this.getCenterX() - this.radius, this.getCenterX() + this.radius))
					&& (between(pacman.getCenterY(), this.getCenterY() - this.radius, this.getCenterY() + this.radius))) {
					if ((!this.dazzled) && (!this.dead)) {
						pacman.die();
					}
					else {
						this.die();
					}
				}
			}
		}

		/* Pathfinding - find the best direction to set */
		this.getNextDirection = function () {
			// get next field
			var pX = getGridPosX(this.posX);
			var pY = getGridPosY(this.posY);

			// TODO - if dazzled, pick a random direction

			// get target - tX, tY as grid coordinate
			if (this.dead) {			// go Home
				var tX = this.gridStartX;
				var tY = this.gridStartY;
			} else if (game.ghostMode == 0) {			// Scatter Mode
				var tX = this.gridBaseX;
				var tY = this.gridBaseY;
			} else if (game.ghostMode == 1) {			// Chase Mode
				const pacmanGridPosX = getGridPosX(pacman.posX);
				const pacmanGridPosY = getGridPosY(pacman.posY);
				switch (this.name) {
					// target: 4 ahead of pacman or 4 ahead and 4 left of pacman if pacman is facing up
					case "pinky":
						const pdir = pacman.direction;
						let pdirX = pdir.dirX;
						let pdirY = pdir.dirY;
						// pacman is facing UP (pdirX == 0, pdirY == -1), we should target 4 ahead and 4 left
						if (pdir.dirX === up.dirX && pdir.dirY === up.dirY) {
							pdirX = pdir.pdirY;
						}

						// TODO(kevin) - game.width / pacman.radius seems wrong - width of map in cells should be game.width / (2 * pacman.radius)
						var tX = (pacmanGridPosX + pdirX * 4) % (game.width / pacman.radius + 1);
						var tY = (pacmanGridPosY + pdirY * 4) % (game.height / pacman.radius + 1);
						break;

					// target: pacman
					case "blinky":
						var tX = pacmanGridPosX;
						var tY = pacmanGridPosY;
						break;

					// target:
					case "inky":
						const blinkyGridPosX = getGridPosX(blinky.posX);
						const blinkyGridPosY = getGridPosY(blinky.posY);
						var tX = pacmanGridPosX + 2 * pacman.direction.dirX;
						var tY = pacmanGridPosY + 2 * pacman.direction.dirY;
						var vX = tX - blinkyGridPosX;
						var vY = tY - blinkyGridPosY;
						tX = Math.abs(blinkyGridPosX + vX * 2);
						tY = Math.abs(blinkyGridPosY + vY * 2);
						break;
					// target: pacman, until pacman is closer than 5 grid fields, then back to scatter
					case "clyde":
						var tX = pacmanGridPosX;
						var tY = pacmanGridPosY;
						var dist = Math.sqrt(Math.pow((pX - tX), 2) + Math.pow((pY - tY), 2));

						if (dist < 5) {
							tX = this.gridBaseX;
							tY = this.gridBaseY;
						}
						break;

				}
			}

			// console.log('use bfs');
			var map = [];
			var mapWidth = game.map.posY[0].posX.length;
			var mapHeight = game.map.posY.length;
			for (i = 0; i < mapHeight; i++) {
				map[i] = [];
				for (j = 0; j < mapWidth; j++) {
					map[i][j] = -1;
				}
			}
			var currLoc = {
				"x": getGridPosX(this.posX),
				"y": getGridPosY(this.posY)
			};
			var neighbors = new Set([currLoc]);
			var currDist = 0;
			var newNeighbors = new Set([]);
			while (neighbors.length > 0) {
				for (loc in neighbors) {
					if (loc.x == tX && loc.y == tY) {
						var dist = currDist;
						var tempLoc = loc;
						while (dist > 1) {
							if (map[tempLoc.y][tempLoc.x + 1] == dist - 1) {
								tempLoc = {
									"x": tempLoc.x + 1,
									"y": tempLoc.y
								};
							} else if (map[tempLoc.y][tempLoc.x - 1] == dist - 1) {
								tempLoc = {
									"x": tempLoc.x - 1,
									"y": tempLoc.y
								};
							} else if (map[tempLoc.y + 1][tempLoc.x] == dist - 1) {
								tempLoc = {
									"x": tempLoc.x,
									"y": tempLoc.y + 1
								};
							} else if (map[tempLoc.y - 1][tempLoc.x] == dist - 1) {
								tempLoc = {
									"x": tempLoc.x,
									"y": tempLoc.y - 1
								};
							}
						}
						let retDir;
						if (tempLoc.x == currLoc.x && tempLoc.y > currLoc.y) {
							retDir = down;
						} else if (tempLoc.x == currLoc.x) {
							retDir = up;
						} else if (tempLoc.y > currLoc.y) {
							retDir = right;
						} else {
							retDir = left;
						}
						// return DIRECTION VIA BFS
						return retDir;
					}
					var field = game.getMapContent(loc.x, loc.y);
					if (field != "wall" && map[loc.y][loc.x] === -1) {
						map[loc.y][loc.x] = currDist;
						if (loc.x < mapWidth - 1) {
							newNeighbors.add({
								"x": loc.x + 1,
								"y": loc.y
							});
						}
						if (loc.x > 0) {
							newNeighbors.add({
								"x": loc.x - 1,
								"y": loc.y
							});
						}
						if (loc.y < mapHeight - 1) {
							newNeighbors.add({
								"x": loc.x,
								"y": loc.y + 1
							});
						}
						if (loc.y > 0) {
							newNeighbors.add({
								"x": loc.x,
								"y": loc.y - 1
							});
						}
					}
				}
				neighbors = newNeighbors;
				currDist++;
			}

			// console.log("Didn't BFS!");

			var oppDir = this.getOppositeDirection();	// ghosts are not allowed to change direction 180�

			var dirs = [{}, {}, {}, {}];
			dirs[0].field = game.getMapContent(pX, pY - 1);
			dirs[0].dir = up;
			dirs[0].distance = Math.sqrt(Math.pow((pX - tX), 2) + Math.pow((pY - 1 - tY), 2));

			dirs[1].field = game.getMapContent(pX, pY + 1);
			dirs[1].dir = down;
			dirs[1].distance = Math.sqrt(Math.pow((pX - tX), 2) + Math.pow((pY + 1 - tY), 2));

			dirs[2].field = game.getMapContent(pX + 1, pY);
			dirs[2].dir = right;
			dirs[2].distance = Math.sqrt(Math.pow((pX + 1 - tX), 2) + Math.pow((pY - tY), 2));

			dirs[3].field = game.getMapContent(pX - 1, pY);
			dirs[3].dir = left;
			dirs[3].distance = Math.sqrt(Math.pow((pX - 1 - tX), 2) + Math.pow((pY - tY), 2));

			// Sort possible directions by distance
			function compare(a, b) {
				if (a.distance < b.distance)
					return -1;
				if (a.distance > b.distance)
					return 1;
				return 0;
			}
			var dirs2 = dirs.sort(compare);

			var r = this.dir;
			var j;

			if (this.dead) {
				for (var i = dirs2.length - 1; i >= 0; i--) {
					if ((dirs2[i].field != "wall") && !(dirs2[i].dir.equals(this.getOppositeDirection()))) {
						r = dirs2[i].dir;
					}
				}
			}
			else {
				for (var i = dirs2.length - 1; i >= 0; i--) {
					if ((dirs2[i].field != "wall") && (dirs2[i].field != "door") && !(dirs2[i].dir.equals(this.getOppositeDirection()))) {
						r = dirs2[i].dir;
					}
				}
			}
			return r;
		}
		this.reverseDirection = function () {
			console.log("reverseDirection: " + this.direction.name + " to " + this.getOppositeDirection().name);
			this.setDirection(this.getOppositeDirection());
		}

	}

	Ghost.prototype = new Figure();

	// Super Class for Pacman & Ghosts
	function Figure() {
		this.posX;
		this.posY;
		this.speed;
		this.dirX = right.dirX;
		this.dirY = right.dirY;
		this.direction;

		// need unbound functions
		this.isAlignedToGrid = function(posX, posY) {
			if ((posX % CELL_PIXELS === 0) && (posY % CELL_PIXELS === 0)) return true;
			return false;
		}
		this.getOppositeDirection = function() {
			if (this.direction.equals(up)) return down;
			else if (this.direction.equals(down)) return up;
			else if (this.direction.equals(right)) return left;
			else if (this.direction.equals(left)) return right;
		}
		this.moveFigure = function() {
			this.posX += this.speed * this.dirX;
			this.posY += this.speed * this.dirY;
			// if (this.name === 'pacman') {
			// 	console.log('movingX: ' + this.posX + ' -> ' + (this.posX + this.speed * this.dirX));
			// 	console.log('movingY: ' + this.posY + ' -> ' + (this.posY + this.speed * this.dirY));
			// }

			// Check if out of canvas
			// get a radius that's a multiple of speed
			let radiusOffset = 0;
			while (radiusOffset < this.radius) {
				radiusOffset += this.speed;
			}
			// going through the right
			if (this.posX > game.width + this.radius) this.posX = this.speed - radiusOffset;
			if (this.posX <= 0 - this.radius) this.posX = game.width - this.speed + radiusOffset;
			if (this.posY > game.height + this.radius) this.posY = this.speed - radiusOffset;
			if (this.posY <= 0 - this.radius) this.posY = game.height - this.speed + radiusOffset;
		}
		this.setDirection = function(dir) {
			this.dirX = dir.dirX;
			this.dirY = dir.dirY;
			this.angle1 = dir.angle1;
			this.angle2 = dir.angle2;
			this.direction = dir;
		}
		this.setPosition = function(x, y) {
			this.posX = x;
			this.posY = y;
		}
	}

	function pacman() {
		this.name = 'pacman'
		this.radius = PAC_CONF.radius;
		// start location
		this.posX = PAC_CONF.gridStartX * CELL_PIXELS;
		this.posY = PAC_CONF.gridStartY * CELL_PIXELS;

		this.speed = MOVE_SPEED_IN_PIXELS;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.mouth = 1; /* Switches between 1 and -1, depending on mouth closing / opening */
		this.dirX = right.dirX;
		this.dirY = right.dirY;
		this.lives = 3;
		this.stuckX = 0;
		this.stuckY = 0;
		this.stuckCount = 0;
		this.frozen = false;		// used to play die Animation
		this.freeze = function () {
			this.frozen = true;
		}
		this.unfreeze = function () {
			this.frozen = false;
		}
		this.getCenterX = function () {
			return this.posX + CELL_PIXELS / 2;
		}
		this.getCenterY = function () {
			return this.posY + CELL_PIXELS / 2;
		}
		this.directionWatcher = new directionWatcher();

		this.direction = right;

		this.beastMode = false;
		this.beastModeTimer = 0;

		this.checkCollisions = () => {

			if ((this.stuckX == 0) && (this.stuckY == 0) && this.frozen == false) {

				// Get the Grid Position of Pac (top left corner)
				const gridX = getGridPosX(this.posX);
				const gridY = getGridPosY(this.posY);
				const field = game.getMapContent(gridX, gridY);

				// get the new grid cell being "moved into"
				let gridAheadX = gridX;
				let gridAheadY = gridY;
				if (this.dirX === 1) {
					//moving right, assume that we'll automatically be in the next cell
					gridAheadX = (gridAheadX + 1) % game.gridWidth;
				} else if (this.dirX === -1) {
					// moving left, try to move and see the position
					gridAheadX = getGridPosX(this.posX - this.speed);
				}
				if (this.dirY == 1) {
					// moving down, assume you'll automatically be in the next cell
					gridAheadY = (gridAheadY + 1) % game.gridHeight;
				} else if (this.dirY == -1) {
					// moving up, try to move and see the position
					gridAheadY = getGridPosY(this.posY - this.speed);
				}
				const fieldAhead = game.getMapContent(gridAheadX, gridAheadY);


				/*	Check Pill Collision			*/
				if ((field === "pill") || (field === "powerpill")) {
					//console.log("Pill found at ("+gridX+"/"+gridY+"). Pacman at ("+this.posX+"/"+this.posY+")");
					if (
						// moving right, assume it's ok if we are just a little bit inside
						((this.dirX == 1) && (between(this.posX, game.toPixelPos(gridX) + 5 - this.radius, game.toPixelPos(gridX + 1))))
						// moving left, assume it's ok if your center passes midpoint of cell
						|| ((this.dirX == -1) && (between(this.posX, game.toPixelPos(gridX), game.toPixelPos(gridX) + (CELL_PIXELS / 2))))
						|| ((this.dirY == 1) && (between(this.posY, game.toPixelPos(gridY) + 5 - this.radius, game.toPixelPos(gridY + 1))))
						|| ((this.dirY == -1) && (between(this.posY, game.toPixelPos(gridY), game.toPixelPos(gridY) + (CELL_PIXELS / 2))))
					) {
						var s;
						if (field === "powerpill") {
							amplitude.getInstance().logEvent('Ate.PowerPill', { 'level': game.level });
							Sound.play("powerpill");
							s = 50;
							this.enableBeastMode();
							game.startGhostFrightened();
						}
						else {
							amplitude.getInstance().logEvent('Ate.Pill', { 'level': game.level });
							Sound.play("waka");
							s = 10;
							game.pillCount--;
						}
						// remove pill
						game.map.posY[gridY].posX[gridX].type = "null";
						game.score.add(s);
					}
				}

				/*	Check Wall Collision			*/
				if ((fieldAhead === "wall") || (fieldAhead === "door")) {
					this.stuckX = this.dirX;
					this.stuckY = this.dirY;
					pacman.stop();
					if (field === "wall" || field === "door") {
						// get out of the wall if we are in it
						if ((this.stuckX == 1) && ((this.posX % CELL_PIXELS) != 0)) this.posX -= this.speed;
						if ((this.stuckY == 1) && ((this.posY % CELL_PIXELS) != 0)) this.posY -= this.speed;
						if (this.stuckX == -1) this.posX += this.speed;
						if (this.stuckY == -1) this.posY += this.speed;
					}
					this.stuckCount += 1;
				} else {
					if (this.stuckCount > 0) {
						amplitude.getInstance().logEvent('Stopped.By.Wall', { 'level': game.level, 'frameCount': this.stuckCount });
						console.log('stuck on wall done ' + this.stuckCount)
						this.stuckCount = 0;
					}
				}
			} else {
				this.stuckCount += 1;
			}
		}
		this.checkDirectionChange = function () {
			if (this.directionWatcher.get() != null) {
				//console.log("next Direction: "+directionWatcher.get().name);

				// wtf is this?
				if ((this.stuckX == 1) && this.directionWatcher.get() == right) {
					this.directionWatcher.set(null);
				} else {
					// reset stuck events
					this.stuckX = 0;
					this.stuckY = 0;


					// only allow direction changes inside the grid
					if (this.isAlignedToGrid(this.posX, this.posY)) {
						//console.log("changeDirection to "+directionWatcher.get().name);

						// check if possible to change direction without getting stuck
						// console.log("x: " + getGridPosX(this.posX) + " + " + this.directionWatcher.get().dirX);
						// console.log("y: " + getGridPosY(this.posY) + " + " + this.directionWatcher.get().dirY);
						var x = getGridPosX(this.posX) + this.directionWatcher.get().dirX;
						var y = getGridPosY(this.posY) + this.directionWatcher.get().dirY;
						if (x <= -1) x = game.gridWidth - 1;
						if (x >= game.gridWidth) x = 0;
						if (y <= -1) x = game.gridHeight - 1;
						if (y >= game.gridHeight) y = 0;

						var nextTile = game.map.posY[y].posX[x].type;
						if (nextTile != "wall") {
							this.setDirection(this.directionWatcher.get());
							this.directionWatcher.set(null);
						}
					} else {
						// console.log('Not aligned when checking direction: ' + this.posX + ", " + this.posY);
					}
				}
			}
		}
		this.setDirection = (dir) => {
			if (!this.frozen) {
				amplitude.logEvent('Changed.Direction', { 'direction': dir.name });
				this.dirX = dir.dirX;
				this.dirY = dir.dirY;
				this.angle1 = dir.angle1;
				this.angle2 = dir.angle2;
				this.direction = dir;
			}
		}
		this.enableBeastMode = function () {
			this.beastMode = true;
			this.beastModeTimer = 240;
			//console.log("Beast Mode activated!");
			amplitude.getInstance().logEvent('Enabled.Beast.Mode');
			inky.dazzle();
			pinky.dazzle();
			blinky.dazzle();
			clyde.dazzle();
		};
		this.disableBeastMode = function () {
			this.beastMode = false;
			//console.log("Beast Mode is over!");
			amplitude.getInstance().logEvent('Disabled.Beast.Mode');
			inky.undazzle();
			pinky.undazzle();
			blinky.undazzle();
			clyde.undazzle();
		};
		this.move = function () {

			if (!this.frozen) {
				if (this.beastModeTimer > 0) {
					this.beastModeTimer--;
					//console.log("Beast Mode: "+this.beastModeTimer);
				}
				if ((this.beastModeTimer == 0) && (this.beastMode == true)) this.disableBeastMode();

				this.moveFigure();
			}
			else this.dieAnimation();
		}

		this.eat = function () {
			if (!this.frozen) {
				if (this.dirX == this.dirY == 0) {

					this.angle1 -= this.mouth * 0.07;
					this.angle2 += this.mouth * 0.07;

					var limitMax1 = this.direction.angle1;
					var limitMax2 = this.direction.angle2;
					var limitMin1 = this.direction.angle1 - 0.21;
					var limitMin2 = this.direction.angle2 + 0.21;

					if (this.angle1 < limitMin1 || this.angle2 > limitMin2) {
						this.mouth = -1;
					}
					if (this.angle1 >= limitMax1 || this.angle2 <= limitMax2) {
						this.mouth = 1;
					}
				}
			}
		}
		this.stop = function () {
			this.dirX = 0;
			this.dirY = 0;
		}
		this.reset = function () {
			this.unfreeze();
			// TODO(kevin) - pull out as startX, startY for pacman
			this.posX = PAC_CONF.gridStartX * CELL_PIXELS;
			this.posY = PAC_CONF.gridStartY * CELL_PIXELS;
			this.setDirection(right);
			this.stop();
			this.stuckX = 0;
			this.stuckY = 0;
			//console.log("reset pacman");
		}
		this.dieAnimation = function () {
			this.angle1 += 0.05;
			this.angle2 -= 0.05;
			if (this.angle1 >= this.direction.angle1 + 0.7 || this.angle2 <= this.direction.angle2 - 0.7) {
				this.dieFinal();
			}
		}
		this.die = function () {
			Sound.play("die");
			this.freeze();
			this.dieAnimation();
		}
		this.dieFinal = function () {
			this.reset();
			pinky.reset();
			inky.reset();
			blinky.reset();
			clyde.reset();
			this.lives--;
			console.log("pacman died, " + this.lives + " lives left");
			amplitude.getInstance().logEvent('Died', { 'livesLeft': this.lives, 'level': game.level });
			if (this.lives <= 0) {
				game.showMessage("Game over", "Total Score: " + game.score.score + "<br/>(Click to Restart!)");
				game.gameOver = true;
				amplitude.getInstance().logEvent('Game.Over', { 'score': game.score.score, 'level': game.level  });
				addHighscore();
				// $('#playerEmail').focus();
			}
			game.drawHearts(this.lives);
		}
	}
	pacman.prototype = new Figure();
	var pacman = new pacman();
	game.buildWalls();


	// Check if a new cache is available on page load.
	function checkAppCache() {
		console.log('check AppCache');
		window.applicationCache.addEventListener('updateready', function (e) {
			console.log("AppCache: updateready");
			if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {

				// Browser downloaded a new app cache.
				// Swap it in and reload the page to get the new hotness.
				window.applicationCache.swapCache();
				if (confirm('A new version of this site is available. Load it?')) {
					window.location.reload();
				}

			} else {
				// Manifest didn't change. Nothing new to server.
			}
		}, false);

		window.applicationCache.addEventListener('cached', function (e) {
			console.log("AppCache: cached");
		}, false);

	}


	// Action starts here:

	function hideAdressbar() {
		console.log("hide adressbar");
		$("html").scrollTop(1);
		$("body").scrollTop(1);
	}

	function submitEmail() {
		var patt = /^.+@.+\..+$/;
		if ($('#playerEmail').val() === undefined || !patt.test($('#playerEmail').val())) {
			$('#form-validater').html("Please enter a valid email<br/>");
			return false;
		} else if ($('#playerName').val() === undefined || $('#playerName').val() === '') {
			$('#form-validater').html("Please enter a user name<br/>");
			return false;
		} else {
			$('#form-validater').html("");
			// TODO - remove?
			// if (game.loggedIn) {
			// 	addHighscore();
			// }
			// TODO - change to set user name
			amplitude.getInstance().setUserId($('#playerEmail').val());
			amplitude.getInstance().setUserProperties({'name': $('#playerName').val()});
			game.loggedIn = true;
			game.user = $('#playerName').val();
			game.email = $('#playerEmail').val();
			$('#email-form').hide();

			// log new game - initialize the game and try to unpause
			game.newGame();
			// reveal the "New Game" option
			$('#newGame').show();
			return true;
		}
	}

	$(document).ready(function () {
		// MAKE SURE BACKGROUND IMAGE IS LOADED
		$('#wallsImg').each(function(idx, img) {
			$('<img>').on('load', imageLoaded).attr('src', $(img).attr('src'));
		});
		function imageLoaded() {
			backgroundImageLoaded = true;
		}

		$.ajaxSetup({ mimeType: "application/json" });

		$.ajaxSetup({
			beforeSend: function (xhr) {
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType("application/json");
					//console.log("mimetype set to json");
				}
			}
		});

		// Hide address bar
		hideAdressbar();

		if (window.applicationCache != null) checkAppCache();

		/* -------------------- EVENT LISTENERS -------------------------- */

		// Listen for resize changes
		/*window.addEventListener("resize", function() {
			// Get screen size (inner/outerWidth, inner/outerHeight)
			// deactivated because of problems
			if ((window.outerHeight < window.outerWidth) && (window.outerHeight < 720)) {
			game.showMessage("Rotate Device","Your screen is too small to play in landscape view.");
			console.log("rotate your device to portrait!");
			}
		}, false);*/


		// --------------- Controls


		// Keyboard
		window.addEventListener('keydown', doKeyDown, true);

		$('#email-submit').click(function () {
			// hide splash screen on successful submission
			if (submitEmail()) {
				$('#splash-screen').hide();
			}
		});

		$('#playerEmail').keyup(function(e) {
			if (e.keyCode == 13) {
				$('#playerName').focus();
			}
		});

		$('#playerName').keyup(function(e) {
			if (e.keyCode == 13) {
				$('#email-submit').click();
			}
		});

		$('#canvas-container').click(function () {
			console.log('pause game');
			console.log(game.running);
			game.pauseResume();
		});

		$('#canvas-container #email-submit').click(function (e) {
			e.stopPropagation();
		});

		$('#canvas-container #playerEmail').click(function (e) {
			e.stopPropagation();
		});

		$('#canvas-container #playerName').click(function (e) {
			e.stopPropagation();
		});

		// $('body').on('click', '#show-highscore', function () {
		// 	game.showContent('highscore-content');
		// 	getHighscore();
		// });

		// Hammerjs Touch Events
		/*Hammer('#canvas-container').on("tap", function(event) {
			if (!(game.gameOver == true))	game.pauseResume();
		});*/
		Hammer('.container').on("swiperight", function (event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(right);
			}
		});
		Hammer('.container').on("swipeleft", function (event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(left);
			}
		});
		Hammer('.container').on("swipeup", function (event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(up);
			}
		});
		Hammer('.container').on("swipedown", function (event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(down);
			}
		});

		// Mobile Control Buttons
		$(document).on('touchend mousedown', '#up', function (event) {
			event.preventDefault();
			window.navigator.vibrate(200);
			pacman.directionWatcher.set(up);
		});
		$(document).on('touchend mousedown', '#down', function (event) {
			event.preventDefault();
			window.navigator.vibrate(200);
			pacman.directionWatcher.set(down);
		});
		$(document).on('touchend mousedown', '#left', function (event) {
			event.preventDefault();
			window.navigator.vibrate(200);
			pacman.directionWatcher.set(left);
		});
		$(document).on('touchend mousedown', '#right', function (event) {
			event.preventDefault();
			window.navigator.vibrate(200);
			pacman.directionWatcher.set(right);
		});

		// Menu
		$(document).on('click', '.button#newGame', function (event) {
			startNewGame();
		});
		// $(document).on('click', '.button#highscore', function (event) {
		// 	game.showContent('highscore-content');
		// 	getHighscore();
		// });
		// $(document).on('click', '.button#instructions', function (event) {
		// 	game.showContent('instructions-content');
		// });
		// $(document).on('click', '.button#info', function (event) {
		// 	game.showContent('info-content');
		// });
		// back button
		$(document).on('click', '.button#back', function (event) {
			game.showContent('game-content');
		});
		// toggleSound
		$(document).on('click', '.controlSound', function (event) {
			game.toggleSound();
		});
		// get latest
		// $(document).on('click', '#updateCode', function (event) {
		// 	console.log('check for new version');
		// 	event.preventDefault();
		// 	window.applicationCache.update();
		// });

		// checkAppCache();

		canvas = $("#myCanvas").get(0);
		backgroundCanvas = $("#myBackground").get(0);
		context = canvas.getContext("2d");
		backgroundContext = backgroundCanvas.getContext('2d');



		/* --------------- GAME INITIALISATION ------------------------------------

			TODO: put this into Game object and change code to accept different setups / levels

		-------------------------------------------------------------------------- */

		game.init(0);
		//logger.disableLogger();

		renderContent();
	});

	function renderContent() {
		//context.save()

		// Refresh Score
		game.score.refresh(".score");

		// Pills
		context.beginPath();
		context.fillStyle = "White";
		context.strokeStyle = "White";

		var dotPosY;
		$.each(game.map.posY, function (i, item) {
			dotPosY = this.row;
			$.each(this.posX, function () {
				if (this.type == "pill") {
					context.font = `${PILL_FONT_SIZE}px PressStart2Play`
					context.textAlign = "center";
					context.textBaseline = "middle";
					var pillNumber = chance.integer({ min: 0, max: 1 });
					context.fillText(pillNumber, game.toPixelPos(this.col - 1) + CELL_PIXELS / 2, game.toPixelPos(dotPosY - 1) + CELL_PIXELS / 2)
					// context.arc(game.toPixelPos(this.col - 1) + CELL_PIXELS / 2, game.toPixelPos(dotPosY - 1) + CELL_PIXELS / 2, game.pillSize, 0 * Math.PI, 2 * Math.PI);
					context.moveTo(game.toPixelPos(this.col - 1), game.toPixelPos(dotPosY - 1));
				}
				else if (this.type == "powerpill") {
					context.arc(game.toPixelPos(this.col - 1) + CELL_PIXELS / 2, game.toPixelPos(dotPosY - 1) + CELL_PIXELS / 2, game.powerpillSize, 0 * Math.PI, 2 * Math.PI);
					context.moveTo(game.toPixelPos(this.col - 1), game.toPixelPos(dotPosY - 1));
				}
			});
		});
		context.fill();

		// Walls
		if (shouldRenderBackground) {
			if (useSmallMap) {
				backgroundContext.drawImage(canvas_walls, 0, 0);
				shouldRenderBackground = false;
				console.log("rendered background")
			} else {
				// const wallsImage = new Image();
				// wallsImage.src = 'img/walls.png';

				if (backgroundImageLoaded) {
					backgroundContext.drawImage(document.getElementById('wallsImg'), 0, 0);

					console.log("rendered background")
					shouldRenderBackground = false;
				}
			};
		}


		if (game.running == true) {
			// Ghosts
			pinky.draw(context);
			blinky.draw(context);
			inky.draw(context);
			clyde.draw(context);


			// Pac Man
			context.beginPath();
			context.fillStyle = PAC_CONF.color;
			context.strokeStyle = PAC_CONF.color;
			context.arc(pacman.posX + CELL_PIXELS / 2, pacman.posY + CELL_PIXELS / 2, pacman.radius, pacman.angle1 * Math.PI, pacman.angle2 * Math.PI);
			context.lineTo(pacman.posX + CELL_PIXELS / 2, pacman.posY + CELL_PIXELS / 2);
			context.stroke();
			context.fill();
		}
	}

	// helper for debugging where things are in the grid
	function renderGrid(ctx, cnv, gridPixelSize, color) {
		ctx.save();
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = color;

		// horizontal grid lines
		for (var i = 0; i <= cnv.height; i = i + gridPixelSize) {
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(cnv.width, i);
			ctx.closePath();
			ctx.stroke();
		}

		// vertical grid lines
		for (var i = 0; i <= cnv.width; i = i + gridPixelSize) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, cnv.height);
			ctx.closePath();
			ctx.stroke();
		}

		context.restore();
	}

	function animationLoop() {
		// clear canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		// renderGrid(context, canvas, CELL_PIXELS / 2, "red");
		renderContent();

		if (game.dieAnimation == 1) pacman.dieAnimation();
		if (game.pause != true) {
			// Make changes before next loop
			pacman.move();
			pacman.eat();
			pacman.checkDirectionChange();
			pacman.checkCollisions();		// has to be the LAST method called on pacman

			// hack to make ghosts slightly slower (5%) than pacman
			if (game.frameCount % 20 !== 0) {
				blinky.move();
				inky.move();
				pinky.move();
				clyde.move();
			} else {
				const cutoffs = getChaserSpeedPillThresholds(game.level);

				// chaser is full speed at first cutoff
				if (game.pillCount <= cutoffs[0]) {
					blinky.move();
				}
				//chaser is faster at second cutoff
				if (game.pillCount <= cutoffs[1]) {
					blinky.move();
				}
			}

			// console.log(game.frameCount)
			game.checkGhostMode();
		}

		// All dots collected?
		game.check();
		game.frameCount += 1;

		//requestAnimationFrame(animationLoop);
		const refreshRate = 1000 / getFramesPerSecond(game.level);
		if (game.gameOver === true || game.running === false) {
			return;
		}
		setTimeout(animationLoop, refreshRate);
	}


	var prevKeyDown;
	var prevKeyTime = 0;

	function doKeyDown(evt) {
		const isInputFocsued = $('#playerEmail').is(':focus') || $('#playerName').is(':focus');

		switch (evt.keyCode) {
			case 38:	// UP Arrow Key pressed
				evt.preventDefault();
			case 87:	// W pressed
				if (!isInputFocsued) {
					pacman.directionWatcher.set(up);
				}
				break;
			case 40:	// DOWN Arrow Key pressed
				evt.preventDefault();
			case 83:	// S pressed
				if (!isInputFocsued) {
					pacman.directionWatcher.set(down);
				}
				break;
			case 37:	// LEFT Arrow Key pressed
				evt.preventDefault();
			case 65:	// A pressed
				if (!isInputFocsued) {
					pacman.directionWatcher.set(left);
				}
				break;
			case 39:	// RIGHT Arrow Key pressed
				evt.preventDefault();
			case 68:	// D pressed
				if (!isInputFocsued) {
					pacman.directionWatcher.set(right);
				}
				break;
			case 78:	// N pressed
				if (!isInputFocsued) {
					game.pause = 1;
					game.newGame();
				}
				break;
			case 77:	// M pressed
				if (!isInputFocsued) {
					game.toggleSound();
				}
				break;
			case 8:		// Backspace pressed -> show Game Content
			case 27:	// ESC pressed -> show Game Content
				if (!isInputFocsued) {
					evt.preventDefault();
					game.showContent('game-content');
				}
				break;
			case 32:	// SPACE pressed -> pause Game
				evt.preventDefault();
				if (!(game.gameOver == true)
					&& $('#game-content').is(':visible')
				) game.pauseResume();
				break;
		}
	}
}

geronimo();
