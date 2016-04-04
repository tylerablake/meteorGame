var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var playerIsReady = false;

var keys = {
	32 : "space",
	37 : "left",
	38 : "up",
	39 : "right",
	40 : "down",
};
var pressed = {};

window.addEventListener("keydown", function(e){
	pressed[keys[e.keyCode]] = true;
});

window.addEventListener("keyup", function(e){
	pressed[keys[e.keyCode]] = false;
});

var animations = {
	bullet:{
		image : new Image(),
		frame: 0,
		frames : 5,
		frameWidth : 55/5,
		time: 0,
		speed: 100
	},
	ship:{
		image: new Image(),
		frame : 0,
		frames: 3,
		frameWidth : 204/3,
		time : 0,
		speed: 200
	},
	meteor:{
		image : new Image(),
		frame : 0,
		frames: 4,
		frameWidth : 320/4,
		time : 0,
		speed: 300
	}
};
animations.bullet.image.src = "images/bullet-f5.png";
animations.ship.image.src = "images/ship-f3.png";
animations.meteor.image.src = "images/meteor-f4.png";


var explode = new Audio();
explode.src = "sounds/explode.wav";
explode.load();

var laser = new Audio();
laser.src = "sounds/laser.wav";
laser.load();

function playSound(sound){
	var s = sound.cloneNode(true);
	s.play();
}

function advanceAnimations(elapsed){
	Object.keys(animations).forEach(function(name){
		var anim = animations[name];
		anim.time += elapsed;
		while(anim.time > anim.speed){
			anim.time -= anim.speed;
			anim.frame++;
			if(anim.frame >= anim.frames){
				anim.frame = 0;
			}
		}
		anim.x = anim.frame * anim.frameWidth;
	});
}

function drawAnimation(context, name, x, y){
	var anim = animations[name];
	context.drawImage(anim.image, anim.x, 0, anim.frameWidth, anim.image.height, x , y, anim.frameWidth, anim.image.height);
}

var bullets= [];
var meteors = [];

var lastFrameTime = null;
var fireTimerMax = 100;
var fireTimer = fireTimerMax;

var score = 0;

var gameOver = false;

function overlaps(x1,y1,w1,h1,x2,y2,w2,h2){
	return x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2;
}

var player = {
	x : 350,
	y : 500,
	speed : 0.6
};


var render = function(time){
	if(lastFrameTime === null){
		lastFrameTime = time;
	}
	var elapsed = time - lastFrameTime;
	lastFrameTime = time;

		advanceAnimations(elapsed);
		fireTimer += elapsed;

		while(meteors.length < 2){
			meteors.push({
				x : (Math.floor(Math.random() * canvas.width - animations.meteor.frameWidth)),
				y : -animations.meteor.image.height
			});
		}
		if(!gameOver){
			if(pressed["left"]){
				if (player.x > 0) {
					player.x -= player.speed * elapsed;
				}
			}
			if(pressed["right"]){
				if(player.x < 730){
					player.x += player.speed * elapsed;
				}
			}
			if(pressed["up"]){
				if(player.y > 0){
					player.y -= player.speed * elapsed;
				}
			}
			if(pressed["down"]){
				if (player.y < 540) {
					player.y += player.speed * elapsed;
				}
			}
			if(pressed["space"] && fireTimer > fireTimerMax){
				fireTimer = 0;
				playSound(laser);
				//TODO: Add PowerUp
				if(score > 5){
				fireTimer = 50;
				}
				if(score > 10){
					fireTimer = 0;
				}
				bullets.push({x: player.x + (animations.ship.frameWidth / 2) - (animations.bullet.frameWidth / 2), y: player.y - animations.bullet.image.height
				});
			}
		}
	context.clearRect(0,0,canvas.width,canvas.height);

	if(!gameOver){
		drawAnimation(context, "ship", player.x, player.y);
	}
	for(var i = 0; i < bullets.length; i++){
		var bullet = bullets[i];
		drawAnimation(context,"bullet",bullet.x, bullet.y);
		bullet.y -= 1 * elapsed;
				for(var j = 0; j < meteors.length; j++){
			var meteor = meteors[j];
			if(!gameOver && overlaps(bullet.x, bullet.y, animations.bullet.frameWidth, animations.bullet.image.height,meteor.x, meteor.y, animations.meteor.frameWidth,animations.meteor.image.height)){
				score++;
				bullets.splice(i,1);
				meteors.splice(j,1);
				j++;
				i--;
			}
		}
	}
	for(var i = 0; i < meteors.length; i++){
		var meteor = meteors[i];
		drawAnimation(context, "meteor", meteor.x, meteor.y);
		//Fast Meteor: 1 Slow Meteor: .5
		//TODO: Set to random number between 0 - 1
		meteor.y +=  (0.55) * elapsed;
		if(meteor.y > canvas.height){
			meteors.splice(i,1);
			i--;
			continue;
		}
		if(!gameOver && overlaps(player.x,player.y,animations.ship.frameWidth, animations.ship.image.height, meteor.x, meteor.y,animations.meteor.frameWidth, animations.meteor.image.height)){
	gameOver = true;
	playSound(explode);
}
	}
	context.fillStyle = "#fff";
	context.font = "25px helvetica";
	context.fillText("Score: " + score, 50, 50);

	if(gameOver){
		context.fillStyle = "#fff";
		context.fillText("GAME OVER!", 300, 300);
		playerIsReady = false;
	}
	window.requestAnimationFrame(render);
};

function playerReady(){
	window.requestAnimationFrame(render);
}
