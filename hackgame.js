var context;
var queue;
var WIDTH = 800;
var HEIGHT = 500;
var playerStartPosX = WIDTH/2;
var playerStartPosY = HEIGHT - 110;
var mouseXPosition;
var mouseYPosition;
var moveSpeed = 4.5;
var K_SPACE = 32;
var K_J = 74;
var K_A = 65;
var K_D = 68;
var K_W = 87;
var K_UP = 38;
var K_DOWN = 40;
var K_LEFT = 37;
var K_RIGHT = 39;
var gravity = 0.16;
var stage;
var score = 0;
var scoreText;
var objectArray = [];
var bulletArray = [];
var enemyArray = [];
var enemyImg = [];
var leftDown = false;
var rightDown = false;
var d = new Date();

window.onload = function()
{
    /*
     *      Set up the Canvas with Size and height
     *
     */
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    /*
     *      Set up the Asset Queue and load sounds
     *
     */
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    /*
     *      Create a load manifest for all assets
     *
     */
    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.jpg'},
        {id: 'fish', src: 'assets/fish.png'},
        {id: 'megamanRed', src: 'assets/megaman_red.png'},
        {id: 'heart', src: 'assets/heart.png'},
        {id: 'phantom', src: 'assets/phantom.png'},
        {id: 'player', src: 'assets/player.png'},
        {id: 'bullet', src: 'assets/bullet.png'},
    ]);
    queue.load();

    enemyImg.push('fish');
    enemyImg.push('megamanRed');
    enemyImg.push('phantom');

    /*
     *      Create a timer that updates once per second
     *
     */
    //gameTimer = setInterval(updateTime, 1000);

}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function queueLoaded(event)
{
    // Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"))
    stage.addChild(backgroundImage);

    //Add Score
    scoreText = new createjs.Text("SCORE: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //Ad Timer
    /*
    timerText = new createjs.Text("Time: " + gameTime.toString(), "36px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);
    */

    playerSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('player')],
        "frames": {"width": 64, "height": 69}
    });

    bulletSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('bullet')],
        "frames": {"width": 26, "height": 17},
        "animations": { "flap": [0,4] }
    });

    createPlayer();
    // Add ticker
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);
    createjs.Ticker.addEventListener('tick', enemyEvent);
    createjs.Ticker.addEventListener('tick', bulletEvent);
    createjs.Ticker.addEventListener('tick', checkCollision);


    // Set up events AFTER the game is loaded
    //window.onmousemove = handleMouseMove;
    //window.onmousedown = handleMouseDown;
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

function handleKeyUp(e)
{
    var unicode=e.keyCode? e.keyCode : e.charCode
    if (unicode == K_LEFT || unicode == K_A) {
        leftDown = false;
    }
    if (unicode == K_RIGHT || unicode == K_D) {
        rightDown = false;
    }
}

function handleKeyDown(e)
{
    var unicode=e.keyCode? e.keyCode : e.charCode
    if (unicode == K_J) {
        playerOne.shoot();
    }
    if (unicode == K_SPACE || unicode == K_UP || unicode == K_W) {
        playerOne.jump();
    }
    if (unicode == K_LEFT || unicode == K_A) {
        leftDown = true;
        playerOne.speedX = -moveSpeed;
        playerOne.bitmap.scaleX = -1;
    }
    if (unicode == K_RIGHT || unicode == K_D) {
        rightDown = true;
        playerOne.speedX = moveSpeed;
        playerOne.bitmap.scaleX = 1;
    }
    
}

function checkCollision() 
{
    for (index = 0; index < enemyArray.length; index++) {
        for (i = 0; i < bulletArray.length; i++) {
            if (ndgmr.checkRectCollision(enemyArray[index].bitmap,bulletArray[i].bitmap)) {
                score += 10;
                scoreText.text = "SCORE: " + score.toString();
                stage.removeChild(enemyArray[index].bitmap);
                stage.removeChild(bulletArray[i].bitmap);
                enemyArray.remove(index);
                bulletArray.remove(i);
                break;
            }
        }
    }
}

function tickEvent()
{
    if (new Date() - d > 2000) {
        d = new Date();
        createEnemy();
    }
    if (!leftDown && !rightDown && playerOne.speedX !=0) {
        playerOne.speedX = 0;
    } else if (leftDown && !rightDown && playerOne.speedX > 0) {
        playerOne.speedX = -moveSpeed;
        playerOne.bitmap.scaleX = -1;
    } else if (rightDown && !leftDown && playerOne.speedX < 0) {
        playerOne.speedX = moveSpeed;
        playerOne.bitmap.scaleX = 1;
    }

    if (playerOne.speedY < 0 || playerOne.bitmap.y <= playerStartPosY - 74) {
        playerOne.speedY += gravity;
        playerOne.bitmap.y += playerOne.speedY;
        playerOne.y += playerOne.speedY;
    } else {
        playerOne.speedY = 0;
        playerOne.bitmap.y = playerStartPosY - 69;
    }
    playerOne.bitmap.x += playerOne.speedX;
}

function enemy(image, direction, imgString)
{
    console.log(imgString);
    console.log(direction);
    this.bitmap = new createjs.Bitmap(image);

    if (direction == "right") {
        this.bitmap.x = 0 - 64;
        this.speedX = 4;
    } else {
        this.bitmap.x = WIDTH + 64;
        this.bitmap.scaleX = -1;
        this.speedX = -4;
    }
    this.speedY = 0;

    if (imgString == 'fish') {
        this.bitmap.y = playerStartPosY - 60;
        this.update = function() {
            this.bitmap.x += this.speedX;
            this.bitmap.y += this.speedY;
            if (this.speedY < 0 || this.bitmap.y <= playerStartPosY - 65) {
                this.speedY += gravity;
                this.bitmap.y += this.speedY;
            } else {
                this.speedY = 0;
                this.bitmap.y = playerStartPosY - 60;
            }
            if (this.bitmap.y >= playerStartPosY - 60 && Math.random() >= .99) {
                this.jump();
            }
        }
    }

    if (imgString == 'phantom') {
        this.bitmap.y = playerStartPosY - 250;
        if (direction == "right") {
            this.bitmap.x = 0 - 64;
            this.speedX = 3.5;
        } else {
            this.bitmap.x = WIDTH + 64;
            this.bitmap.scaleX = -1;
            this.speedX = -3.5;
        }
        var specialMove = false;
        this.update = function() {
            this.bitmap.x += this.speedX;
            this.bitmap.y += this.speedY;
            if (!specialMove && Math.abs(this.bitmap.x - playerOne.bitmap.x) < 200) {
                this.speedY = 2;
                specialMove = true;
            }
            if (this.bitmap.y <= playerStartPosY - 80) {
                this.bitmap.y += this.speedY;
            } else {
                this.speedY = 0;
                this.bitmap.y = playerStartPosY - 80;
            }
        }
    }

    if (imgString == 'megamanRed') {
        this.bitmap.y = playerStartPosY - 60;
        this.update = function() {
            this.bitmap.x += this.speedX;
            this.bitmap.y += this.speedY;
        }
    }

    this.jump = function() {
        this.speedY = -5;
    }
}

function bullet(image, direction) 
{
    this.bitmap = new createjs.Bitmap(image);
    this.bitmap.y = playerOne.bitmap.y + playerOne.bitmap.getBounds().height/2;

    if (direction == "right") {
        this.bitmap.x = playerOne.bitmap.x + playerOne.bitmap.getBounds().width/2;
        this.speedX = 6.5;
    } else {
        this.bitmap.scaleX = -1;
        this.bitmap.x = playerOne.bitmap.x - 25;
        this.speedX = -6.5;
    }

    this.update = function() {
        this.bitmap.x += this.speedX;
    }
}

function player(image, x, y)
{
    this.bitmap = new createjs.Bitmap(image);
    this.bitmap.x = x;
    this.bitmap.y = y;
    this.bitmap.regX = this.bitmap.getBounds().width/2;
    //this.bitmap.regY = this.bitmap.getBounds().height/2;
    this.speedY = 0;
    this.speedX = 0;

    this.x = x;
    this.y = y;

    this.direction = function() {
        if (this.bitmap.scaleX > 0) {
            return "right";
        }
        return "left";
    }

    this.jump = function() {
        this.speedY = -7;
    }

    this.updateImage = function(image) {
        this.bitmap.image = image;
    }

    this.shoot = function() {
        bulletSprite = new bullet(queue.getResult('bullet'), this.direction());
        stage.addChild(bulletSprite.bitmap);
        bulletArray.push(bulletSprite);
    }

}

function bulletEvent() {
    for(var i = 0; i < bulletArray.length; i++) {
        bulletArray[i].update();
        if (bulletArray[i].bitmap.x > WIDTH || bulletArray[i].bitmap.x < 0) {
            stage.removeChild(bulletArray[i].bitmap);
            bulletArray.remove(i);
        }
    }
}

function enemyEvent() {
    for(var i = 0; i < enemyArray.length; i++) {
        enemyArray[i].update();
        if (enemyArray[i].bitmap.x > WIDTH + 100 || enemyArray[i].bitmap.x < - 100) {
            stage.removeChild(enemyArray[i].bitmap);
            enemyArray.remove(i);
        }
    }
}

function createEnemy()
{
    var direction;
    if (Math.random() >= .5) {
        direction = 'right';
    } else {
        direction = 'left'
    }
    imgString = enemyImg[Math.floor(Math.random()*enemyImg.length)];
    monster = new enemy(queue.getResult(imgString), direction, imgString);
    stage.addChild(monster.bitmap);
    enemyArray.push(monster);
}

function createPlayer()
{
    playerOne = new player(queue.getResult('player'), playerStartPosX, playerStartPosY - 69);

    stage.addChild(playerOne.bitmap);
}