        //CONSTANTS
		var CANVAS_WIDTH = 800;
		var CANVAS_HEIGHT = 600;

		var NANONAUT_WIDTH = 181;
		var NANONAUT_HEIGHT = 229;
		var NANONAUT_Y_ACCELERATION = 1;
		var NANONAUT_X_SPEED = 5;
		var NANONAUT_NR_ANIMATION_FRAMES = 7;
		var NANONAUT_ANIMATION_SPEED = 5; //game frame per animated frame
		var NANONAUT_JUMP_SPEED = 20;
		var NANONAUT_MAX_HEALTH = 100;

		var GROUND_Y = 540;
		var BACKGROUND_WIDTH = 1000;
		
		var ROBOT_WIDTH = 141;
		var ROBOT_HEIGHT = 139;
		var ROBOT_NR_ANIMATION_FRAMES = 9;
		var ROBOT_ANIMATION_SPEED = 5;
		var ROBOT_X_SPEED = 4;
		
		
		var MIN_DISTANCE_BETWEEN_ROBOTS = 400;
		var MAX_DISTANCE_BETWEEN_ROBOTS = 1200;
		var MAX_ACTIVE_ROBOTS = 3;

		var SPACE_KEYCODE = 32;
		
		var SCREENSHAKE_RADIUS = 32;
		
		var PLAY_GAME_MODE = 0;
		var GAME_OVER_GAME_MODE = 1;

		//SETUP

		
		var canvas = document.getElementById("canvas");
		var c = canvas.getContext("2d");
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		document.body.appendChild(canvas);

		var nanonautImage = new Image();
		nanonautImage.src = "animatedNanonaut.png";

		var backgroundImage = new Image();
		backgroundImage.src = "background.png";

		var bush1Image = new Image
		bush1Image.src = "bush1.png";

		var bush2Image = new Image();
		bush2Image.src = "bush2.png";
		
		var robotImage = new Image();
		robotImage.src = "animatedRobot.png";
		
		var nanonautSpriteSheet = {
			nrFramesPerRow: 5, 
			spriteWidth: NANONAUT_WIDTH,
			spriteHeight: NANONAUT_HEIGHT,
			image: nanonautImage
		};

		var robotSpriteSheet = {
			nrFramesPerRow: 3,
			spriteWidth: ROBOT_WIDTH,
			spriteHeight: ROBOT_HEIGHT,
			image: robotImage
		};
		
		var robotData = [];
		
		var nanonautX = CANVAS_WIDTH / 2;
		var nanonautY = GROUND_Y - NANONAUT_HEIGHT;

		var spaceKeyIsPressed = false;
		var nanonautYSpeed = 0;
		var nanonautIsInTheAir = false;
		var nanonautFrameNr = 0;
		var nanonautHealth = NANONAUT_MAX_HEALTH;
		
		
		//collisionrectangle
		var nanonautCollisionRectangle = {
		xOffset: 60,
		yOffset: 20,
		width: 50,
		height: 200,
		};
		
		var robotCollisionRectangle = {
		xOffset: 50,
		yOffset: 20,
		width: 50,
		height: 100,
		};
		
		var cameraX = 0;
		var cameraY = 0;
		var screenshake = false;
		var gameFrameCounter = 0;
		
		var gameMode = PLAY_GAME_MODE; 

		var bushData = generateBushes();

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		
		window.addEventListener("load", start);

		function start(){
				window.requestAnimationFrame(mainLoop);
		}
		
		function generateBushes() {
			var generatedBushData = [];
			var bushX = 0;
			while (bushX < (2 * CANVAS_WIDTH)) {
				var bushImage;
				if (Math.random() >= 0.5) {
					bushImage = bush1Image;
				} else {
					bushImage = bush2Image;
				}
				generatedBushData.push ({
					x: bushX,
					y: 80 + Math.random() * 20,
					image: bushImage
				});
				bushX += 150 + Math.random() * 200;
			}	
			return generatedBushData;
		}

		//MAIN LOOP
		function mainLoop(){
			update();
			draw();
			window.requestAnimationFrame(mainLoop);
		}
		
		//PLAYER INPUT
		function onKeyDown(event) {
			if (event.keyCode === 32 || event.keyCode === 38 || event.keyCode === 87 || event.keyCode === 73 || event.keyCode === 13) {
				spaceKeyIsPressed = true;
			}
		}
		
		function onKeyUp(event) {
			if (event.keyCode === 32 || event.keyCode === 38 || event.keyCode === 87 || event.keyCode === 73 || event.keyCode === 13) {
				spaceKeyIsPressed = false;
			}
		}
		
		//UPDATE
		function update(){ 
		
		if (gameMode != PLAY_GAME_MODE) return;

		gameFrameCounter = gameFrameCounter + 1;

		//Update nanonaut
		nanonautX = nanonautX + NANONAUT_X_SPEED;
 
		if (spaceKeyIsPressed && !nanonautIsInTheAir) {
			nanonautYSpeed = -NANONAUT_JUMP_SPEED;
			nanonautIsInTheAir = true;
		}
		
		nanonautY = nanonautY + nanonautYSpeed;
		nanonautYSpeed = nanonautYSpeed + NANONAUT_Y_ACCELERATION;
		
		if (nanonautY > (GROUND_Y - NANONAUT_HEIGHT)) {
				nanonautY = GROUND_Y - NANONAUT_HEIGHT;
				nanonautYSpeed = 0;
				nanonautIsInTheAir = false;
		}
		
		//Update Animation
		if ((gameFrameCounter % NANONAUT_ANIMATION_SPEED) === 0) {
			nanonautFrameNr = nanonautFrameNr + 1;
			if (nanonautFrameNr >= NANONAUT_NR_ANIMATION_FRAMES) {
				nanonautFrameNr =0;
			}
		}
		//Update camera
		cameraX = nanonautX - 150;
		//Update bushes
		for (var i=0; i<bushData.length; i++) {
			if ((bushData[i].x - cameraX) < -CANVAS_WIDTH) {
				bushData[i].x += (2 * CANVAS_WIDTH) + 150;
			}
		}
		screenshake = false;
		var nanonautTouchedARobot = updateRobots ();
		if (nanonautTouchedARobot) {
			screenshake = true;
			if (nanonautHealth > 0) nanonautHealth -= 1;
		}
		//check if game is over
		if (nanonautHealth <= 0) {
		gameMode = GAME_OVER_GAME_MODE;
		screenshake = false;
		}
		}
		//update robots
		function updateRobots() {
		// Move and animate robots and check collision with nanonaut.
		var nanonautTouchedARobot = false;
		for (var i=0; i<robotData.length; i++) {
			if (doesNanonautOverlapRobot(
			nanonautX + nanonautCollisionRectangle.xOffset,
			nanonautY + nanonautCollisionRectangle.yOffset,
			nanonautCollisionRectangle.width,
			nanonautCollisionRectangle.height,
			robotData[i].x + robotCollisionRectangle.xOffset,
			robotData[i].y + robotCollisionRectangle.yOffset,
			robotCollisionRectangle.width,
			robotCollisionRectangle.height
			)) {
				nanonautTouchedARobot = true;
				console.log("ouch");
			}
			robotData[i].x -= ROBOT_X_SPEED;
			if ((gameFrameCounter % ROBOT_ANIMATION_SPEED) === 0) {
				robotData[i].frameNr = robotData[i].frameNr + 1;
				if (robotData[i].frameNr >= ROBOT_NR_ANIMATION_FRAMES) {
					robotData[i].frameNr = 0;
				}
			}
		}
		
		// Remove robots that have gone off screen.
		var robotIndex = 0;
		while (robotIndex < robotData.length) {
			if (robotData[robotIndex].x < cameraX - ROBOT_WIDTH) {
				robotData.splice(robotIndex, 1);
			} else {
				robotIndex += 1;
			}
		}

        // Add a new robot if there aren't enough.
		if (robotData.length < MAX_ACTIVE_ROBOTS) {
			var lastRobotX = CANVAS_WIDTH;
			if (robotData.length > 0) {
				lastRobotX = robotData[robotData.length - 1].x;
			}
			var newRobotX = lastRobotX + MIN_DISTANCE_BETWEEN_ROBOTS + Math.random() * (MAX_DISTANCE_BETWEEN_ROBOTS - MIN_DISTANCE_BETWEEN_ROBOTS);
			robotData.push({
				x: newRobotX,
				y: GROUND_Y - ROBOT_HEIGHT,
				frameNr: 0
			});
		}
					return nanonautTouchedARobot;
		}
				//checking nanonaut and robot overlap
		function doesNanonautOverlapRobotAlongOneAxis(nanonautNearX, nanonautFarX, robotNearX, robotFarX) {
		var nanonautOverlapsNearRobotEdge = (nanonautFarX >= robotNearX) && (nanonautFarX <= robotFarX);
		var nanonautOverlapsFarRobotEdge = (nanonautNearX >= robotNearX) && (nanonautNearX <= robotFarX);
		var nanonautOverlapsEntireRobot = (nanonautNearX <= robotNearX) && (nanonautFarX >= robotFarX);
		return nanonautOverlapsNearRobotEdge || nanonautOverlapsFarRobotEdge || nanonautOverlapsEntireRobot;
			}
		function doesNanonautOverlapRobot(nanonautX, nanonautY, nanonautWidth, nanonautHeight, robotX, robotY, robotWidth, robotHeight) {
		var nanonautOverlapsRobotOnXAxis = doesNanonautOverlapRobotAlongOneAxis(
			nanonautX,
			nanonautX + nanonautWidth,
			robotX,
			robotX + robotWidth
		);
		var nanonautOverlapsRobotOnYAxis = doesNanonautOverlapRobotAlongOneAxis(
			nanonautY,
			nanonautY + nanonautHeight,
			robotY,
			robotY + robotHeight
		);
		return nanonautOverlapsRobotOnXAxis && nanonautOverlapsRobotOnYAxis;
		}
		//DRAWING
		function draw(){
		//screen shake
		var shakenCameraX = cameraX;
		var shakenCameraY = cameraY;
		if (screenshake) {
			shakenCameraX += (Math.random() - .5) * SCREENSHAKE_RADIUS;
			shakenCameraY += (Math.random() - .5) * SCREENSHAKE_RADIUS;
		}
		//draw the sky
		c.fillStyle = "LightSkyBlue";
		c.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y -40);

		//draw the background
		var backgroundX = - (shakenCameraX % BACKGROUND_WIDTH);
		c.drawImage(backgroundImage, backgroundX, -210);
		c.drawImage(backgroundImage, backgroundX + BACKGROUND_WIDTH, -210);

		//draw the gound 
		c.fillStyle = "ForestGreen";
		c.fillRect(0, GROUND_Y - 40, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y + 40);
		
		//draw bushes
		for (var i=0; i<bushData.length; i++) {
		c.drawImage(
			bushData[i].image, 
			bushData[i].x - shakenCameraX, 
			GROUND_Y - bushData[i].y - shakenCameraY
			);
		}
		
		//draw the robots
		for (var i=0; i<robotData.length; i++) {
			drawAnimatedSprite(
				robotData[i].x - shakenCameraX,
				robotData[i].y - shakenCameraY, 
				robotData[i].frameNr, 
				robotSpriteSheet
				);
		}
		
		//draw the nanonaut
		drawAnimatedSprite(
		nanonautX - shakenCameraX, 
		nanonautY - shakenCameraY, 
		nanonautFrameNr, 
		nanonautSpriteSheet
		);
		
		//distance traveled
		var nanonautDistance = nanonautX / 100;
		c.fillStyle = "black";
		c.font = "48px sans-serif";
		c.fillText(nanonautDistance.toFixed(0) + "m", 20, 40);
		
		//draw health bar
		c.fillStyle = "red";
		c.fillRect(400, 10, nanonautHealth / NANONAUT_MAX_HEALTH * 380, 20);
		c.strokeStyle = "red";
		c.strokeRect(400, 10, 380, 20);
            
        c.fillStyle = 'black';
        c.font = '24px sans-serif';
        c.fillText(nanonautHealth + '/' + NANONAUT_MAX_HEALTH, 400, 25);
		
		//GAMEOVER
		if (gameMode == GAME_OVER_GAME_MODE) {
		c.fillStyle = "black";
		c.font = "96px sans-serif";
		console.log("game over");
		c.fillText ("GAME OVER", 120, 300);
		}
		}
		//draw animated sprite
		function drawAnimatedSprite(screenX, screenY, frameNr, spriteSheet) {
			var spriteSheetRow = Math.floor(frameNr / spriteSheet.nrFramesPerRow);
			var spriteSheetColumn = frameNr % spriteSheet.nrFramesPerRow;
			var spriteSheetX = spriteSheetColumn * spriteSheet.spriteWidth;
			var spriteSheetY = spriteSheetRow * spriteSheet.spriteHeight;
		
		c.drawImage(
			spriteSheet.image,
			spriteSheetX, spriteSheetY,
			spriteSheet.spriteWidth, spriteSheet.spriteHeight, 
			screenX, screenY,
			spriteSheet.spriteWidth, spriteSheet.spriteHeight
			);
		}