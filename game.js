window.onload = function() {
    console.log("version 13 cookies");
    const gameboard = document.getElementById("gameboard");
    const gameboard_ctx = gameboard.getContext("2d");

    const gui = document.getElementById("gui");
    const gui_ctx = gui.getContext("2d");

    const scoreLabel = document.getElementById("scoreNumber");
    const levelLabel = document.getElementById("levelNumber");
    const bestScoreLabel = document.getElementById("bestScoreL");

    var buttons = [
        [300, 490, gameStartTextImg.width, gameStartTextImg.height],
        [170, 550, leaderBoardTextImg.width, leaderBoardTextImg.height],
        [250, 620, controlsTextImg.width, controlsTextImg.height]
    ];

    var eatingAudio = new Audio();
    var src1  = document.createElement("source");
    src1.src  = "resources/gameMusic/eatingStuff.mp3";
    eatingAudio.playbackRate = 16.0;
    eatingAudio.appendChild(src1);

    var deathAudio = new Audio();
    var src2  = document.createElement("source");
    src2.src  = "resources/gameMusic/death.mp3";
    deathAudio.playbackRate = 2.0;
    deathAudio.appendChild(src2);

    var gameAudio = new Audio();
    var src3  = document.createElement("source");
    src3.src  = "resources/gameMusic/game.mp3";
    gameAudio.volume = 0.3;
    gameAudio.appendChild(src3);

    var mouseX;
    var mouseY;

    var cubeSize = {x: 29, y: 26};
    var randomNumber;
    var listOfGhosts = [];
    var pacmanPowerDown;
    var ghostVulnerableTime;
    var counter = 1;
    var pacmanTick;

    var level = 1;

    var timeouts = [];
    var bestScore = parseInt(document.cookie);
    var bestLevel = parseInt(localStorage.getItem("bestlvl"));
    if (bestLevel ===  null) {
        bestLevel = 1;
    }

    //***************PAC-MAN***************//

    class Pacman {
        matrixPos;
        canvasPos;
        dx;
        dy;
        direction;
        eaten;
        powerUp;
        score;
        ghostCount;
        lives;
        matrixDefaultPos;
        constructor(matrixPosition, direction) {
            this.matrixDefaultPos = matrixPosition;
            this.matrixPos = matrixPosition;
            this.canvasPos = {x: this.matrixPos.x * cubeSize.x, y: this.matrixPos.y * cubeSize.y};
            this.dx = 0;
            this.dy = 0;
            this.eaten = false;
            this.powerUp = false;
            this.direction = direction;
            this.score = 0;
            this.ghostCount = 1;
            this.lives = 3;
        }

        //Getters
        getMatrixPos() {
            return this.matrixPos;
        }

        getMatrixDefaultPos() {
            return this.matrixDefaultPos;
        }

        getMatrixPosX() {
            return this.matrixPos.x;
        }

        getMatrixPosY() {
            return this.matrixPos.y;
        }

        getCanvasPosX() {
            return this.canvasPos.x;
        }

        getCanvasPosY() {
            return this.canvasPos.y;
        }

        getDx() {
            return this.dx;
        }

        getDy() {
            return this.dy;
        }

        getDirection() {
            return this.direction;
        }

        getEaten() {
            return this.eaten;
        }

        getPowerUp() {
            return this.powerUp;
        }

        getScore() {
            return this.score;
        }

        getLives() {
            return this.lives;
        }

        //Setters
        setMatrixPos(value) {
            this.matrixPos.x = value.x;
            this.matrixPos.y = value.y;
        }

        setMatrixDefaultPos(value) {
            this.matrixDefaultPos.x = value.x;
            this.matrixDefaultPos.y = value.y;
        }

        setMatrixPosX(value) {
            this.matrixPos.x = value;
        } 

        setMatrixPosY(value) {
            this.matrixPos.y = value;
        }

        setCanvasPos(value) {
            this.canvasPos.x = value.x;
            this.canvasPos.y = value.y;
        }

        setCanvasPosX(value) {
            this.canvasPos.x = value;
        }

        setCanvasPosY(value) {
            this.canvasPos.y = value;
        }

        setDx(value) {
            this.dx = value;
        }

        setDy(value) {
            this.dy = value;
        }

        setDirection(value) {
            this.direction = value;
        }

        setEaten(value) {
            this.eaten = value;
        }

        setPowerUp(value) {
            this.powerUp = value;
        }

        setScore(value) {
            this.score = value;
        }

        setLives(value) {
            this.lives = value;
        }

        //Functions
        hasEaten(meal) {
            eatingAudio.play();
            if (this.powerUp === false) {
                this.ghostCount = 1;
            }

            if (meal === "fruit") {
                this.score = this.score + 10;
            } else if (meal === "powerFruit") {
                this.score = this.score + 50;
            } else if (meal === "ghost") {
                this.score = this.score + (200 * this.ghostCount);
                this.ghostCount++;
            }
            scoreLabel.textContent = this.score;
        }


        stopMovement() {
            this.dx = 0;
            this.dy = 0;
        }

        isNextPixelBorder() {
            if (boardMatrix[this.matrixPos.y + this.dy][this.matrixPos.x + this.dx] === 1 || boardMatrix[this.matrixPos.y + this.dy][this.matrixPos.x + this.dx] === 4 || boardMatrix[this.matrixPos.y + this.dy][this.matrixPos.x + this.dx] === 4) {
                return true;
            } else {
                return false;
            }
        }
    }

    //***********************************//

    //**************GHOST***************//
    class Ghost {
        matrixPos;
        matrixDefaultPos;
        canvasPos;
        spawnPoint;
        dx;
        dy;
        direction;
        
        vulnerable;
        eaten;
        respawnState;
        
        directionsPossible;
        target;
        speed;
        defaultSpeed = 200;
        ghostTick;
        constructor(matrixPosition, direction) {				
            this.matrixPos = matrixPosition;
            this.matrixDefaultPos = matrixPosition;
            this.spawnPoint = matrixPosition;
            this.direction = direction;
            this.canvasPos = {x: this.matrixPos.x * cubeSize.x, y: this.matrixPos.y * cubeSize.y};
            this.dx = 0;
            this.dy = 0;
            this.vulnerable = false;
            this.eaten = false;
            this.respawnState = false;
            this.directionsPossible = [];
            this.target = "";
            this.speed = this.defaultSpeed;

        }

        //Getters
        getMatrixPos() {
            return this.matrixPos;
        }

        getMatrixDefaultPos() {
            return this.matrixDefaultPos;
        }

        getMatrixPosX() {
            return this.matrixPos.x;
        }

        getMatrixPosY() {
            return this.matrixPos.y;
        }

        getCanvasPosX() {
            return this.canvasPos.x;
        }

        getCanvasPosY() {
            return this.canvasPos.y;
        }

        getSpawnPoint() {
            return this.spawnPoint;
        }

        getDx() {
            return this.dx;
        }

        getDy() {
            return this.dy;
        }

        getDirection() {
            return this.direction;
        }

        getVulnerable() {
            return this.vulnerable;
        }

        getEaten() {
            return this.eaten;
        }

        getSpeed() {
            return this.speed;
        }

        getDefaultSpeed() {
            return this.defaultSpeed;
        }

        getTick() {
            return this.ghostTick;
        }


        //Setters
        setMatrixPos(value) {
            this.matrixPos.x = value.x;
            this.matrixPos.y = value.y;
        }

        setMatrixDefaultPos(value) {
            this.matrixDefaultPos.x = value.x;
            this.matrixDefaultPos.y = value.y;
        }


        setMatrixPosX(value) {
            this.matrixPos.x = value;
        } 

        setMatrixPosY(value) {
            this.matrixPos.y = value;
        }

        setCanvasPos(value) {
            this.canvasPos.x = value.x;
            this.canvasPos.y = value.y;
        }

        setCanvasPosX(value) {
            this.canvasPos.x = value;
        }

        setCanvasPosY(value) {
            this.canvasPos.y = value;
        }

        setSpawnPoint(value) {
            this.spawnPoint = value;
        }

        setDx(value) {
            this.dx = value;
        }

        setDy(value) {
            this.dy = value;
        }

        setDirection(value) {
            this.direction = value;
        }

        setVulnerable(value) {
            this.vulnerable = value;
        }

        setEaten(value) {
            this.eaten = value;
        }

        setSpeed(value) {
            this.speed = value;
        }

        setDefaultSpeed(value) {
            this.defaultSpeed = value;
        }

        //Functions
        changeDxDy() {
            if (this.direction === 'right') {
                this.dx = 1;
                this.dy = 0;
            }

            if (this.direction === 'left') {
                this.dx = -1;
                this.dy = 0;
            }

            if (this.direction === 'down') {
                this.dx = 0;
                this.dy = 1;
            }

            if (this.direction === 'up') {
                this.dx = 0;
                this.dy = -1;
            }

            if (this.direction === 'stop') {
                this.dx = 0;
                this.dy = 0;
            }
        }

        stopMovement() {
            this.dx = 0;
            this.dy = 0;
        }

        isNextPixelBorder() {
            if (boardMatrix[this.matrixPos.y + this.dy][this.matrixPos.x + this.dx] === 1) {
                return true;
            } else {
                return false;
            }
        }

        isThereObstacle(dir) {
            let dx;
            let dy;
            if (dir === 'right') {
                dx = 1;
                dy = 0;
            }

            if (dir === 'left') {
                dx = -1;
                dy = 0;
            }

            if (dir === 'down') {
                dx = 0;
                dy = 1;
            }

            if (dir === 'up') {
                dx = 0;
                dy = -1;
            }

            //Check for border
            if (boardMatrix[this.matrixPos.y + dy][this.matrixPos.x + dx] === 1 || boardMatrix[this.matrixPos.y + dy][this.matrixPos.x + dx] === boardMatrix[14][-1]) {
                return true;
            }
            
            //Check for Ghost	
            for (i = 0; i < listOfGhosts.length; i++) {
                if (this.matrixPos.x + dx === listOfGhosts[i].getMatrixPosX() &&  this.matrixPos.y + dy === listOfGhosts[i].getMatrixPosY()) {
                    return true;
                }
            }

            //Check for SpawnBorder
            if (this.eaten === false && boardMatrix[this.matrixPos.y][this.matrixPos.x] != 4) {
                if (boardMatrix[this.matrixPos.y + dy][this.matrixPos.x + dx] === 4) {
                    return true;
                }
            }
            return false;
        }

        changeDirection() {
                
            this.lookAround();
            
            //Set ghost's target
            if (this.eaten === true) {
                this.targetIs("spawnPoint");
            } else if (boardMatrix[this.matrixPos.y][this.matrixPos.x] === 4) {
                this.targetIs("getOut");
            } else {
                this.targetIs("pacman");
            }
            
            //Stop ghost if there no directions to move
            if (this.directionsPossible.length === 0) {
                this.direction = "stop";
                return;
            }

            //Find direction which leads to target.
            for (let i = 0; i < this.directionsPossible.length; i++) {
                if (this.directionsPossible[i] === this.target) {
                    this.direction = this.directionsPossible[i];
                    return;
                }
            }
            
            let min = 0;
            let max = this.directionsPossible.length;
            randomNumber = Math.floor(Math.random() * (max - min) + min)
            this.direction = this.directionsPossible[randomNumber];
        }
        
        lookAround() {
            this.directionsPossible = [];
            if (this.isThereObstacle("up") === false ) {
                if (this.direction != "down") {
                    this.directionsPossible.push("up");
                }
            }

            if (this.isThereObstacle("right") === false) {
                if (this.direction != "left") {
                    this.directionsPossible.push("right");
                }
            }

            if (this.isThereObstacle("down") === false) {
                if (this.direction != "up") {
                    this.directionsPossible.push("down");
                }
            }

            if (this.isThereObstacle("left") === false) {
                if (this.direction != "right") {
                    this.directionsPossible.push("left");
                }
            }

        }

        targetIs(obj) {
            if (obj === "pacman") {
                //pacman up
                if (pacman.getMatrixPosY() < this.matrixPos.y) {
                    if (this.vulnerable === true) {
                        this.target = "down";
                    } else {
                        this.target = "up";
                    }
                //pacman down
                } else if (pacman.getMatrixPosY() > this.matrixPos.y) {
                    if (this.vulnerable === true) {
                        this.target = "up";
                    } else {
                        this.target = "down";
                    }
                //pacman left
                } else if (pacman.getMatrixPosX() < this.matrixPos.x) {
                    if (this.vulnerable === true) {
                        this.target = "right"
                    } else {
                        this.target = "left";
                    }
                //pacman right
                } else if (pacman.getMatrixPosX() > this.matrixPos.x) {
                    if (this.vulnerable === true) {
                        this.target = "left";
                    } else {
                        this.target = "right";
                    }
                }
            } else if (obj === "spawnPoint") {
                //spawnPoint up
                if (this.spawnPoint.y < this.matrixPos.y) {
                        this.target = "up";
                
                //spawnPoint down
                } else if (this.spawnPoint.y > this.matrixPos.y) {
                    this.target = "down";
                
                //spawnPoint left
                } else if (this.spawnPoint.x < this.matrixPos.x) {
                    this.target = "left";
                
                //spawnPoint right
                } else if (this.spawnPoint.x > this.matrixPos.x) {
                    this.target = "right";
                
                } else if (this.spawnPoint.x === this.matrixPos.x && this.spawnPoint.y === this.matrixPos.y) {
                    this.respawn();
                }
            } else if (obj === "getOut") {
                this.target = "up";
            }
        } 

        move() {
            this.changeDirection();
            this.changeDxDy();
            this.matrixPos = ({x: this.matrixPos.x + this.dx, y: this.matrixPos.y + this.dy});
            this.canvasPos = ({x: this.matrixPos.x * cubeSize.x, y: this.matrixPos.y * cubeSize.y});
            isPacmanEatsGhost();
        }

        respawn() {
            this.eaten = false;
            this.speed = this.defaultSpeed;
        }

        tick() {
            timeouts.push(setTimeout(() => {
                //console.log("GHOST TICKS");
                this.move();
                this.tick();
            }, this.speed));
        }
    }

    //***********************************//
        
    //***************PAC-MAN**************//
    var pacman = new Pacman({x: 1, y: 1}, 'right');
    //***********************************//


    //***************GHOST#1 ASIAN**************//
    var g1 = new Ghost({x: 13, y: 13}, 'up');
    listOfGhosts[0] = g1;
    //***********************************//


    //***************GHOST#2 BLACK**************//
    var g2 = new Ghost({x: 14, y: 13}, 'up');
    listOfGhosts[1] = g2;
    //***********************************//

    //***************GHOST#3 LATINO**************//
    var g3 = new Ghost({x: 13, y: 14}, 'up');
    listOfGhosts[2] = g3;
    //***********************************//

    //***************GHOST#4 WHITE**************//
    var g4 = new Ghost({x: 14, y: 14}, 'up');
    listOfGhosts[3] = g4;
    //***********************************//

    //28 width x 31 height
    //"0" - food
    //"1" - border
    //"2" - free cell
    //"3" - special food
    //"4" - Ghost Spawn Camp

    var boardMatrix = [
        //0					       13						   27
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],//0
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],//1
        [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],//2
        [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],//3
        [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],//4
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],//5
        [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],//6
        [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],//7
        [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],//8
        [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],//9
        [2,2,2,2,2,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,2,2,2,2,2],//10
        [2,2,2,2,2,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,2,2,2,2,2],//11
        [2,2,2,2,2,1,0,1,1,0,1,1,1,4,4,1,1,1,0,1,1,0,1,2,2,2,2,2],//12
        [1,1,1,1,1,1,0,1,1,0,1,4,4,4,4,4,4,1,0,1,1,0,1,1,1,1,1,1],//13
        [0,0,0,0,0,0,0,0,0,0,1,4,4,4,4,4,4,1,0,0,0,0,0,0,0,0,0,0],//14
        [1,1,1,1,1,1,0,1,1,0,1,4,4,4,4,4,4,1,0,1,1,0,1,1,1,1,1,1],//15
        [2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2],//16
        [2,2,2,2,2,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,2,2,2,2,2],//17
        [2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2],//18
        [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],//19
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],//20
        [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],//21
        [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],//22
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],//23
        [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],//24
        [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],//25
        [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],//26
        [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],//27
        [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],//28
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],//29
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] //30
    ];

    var boardMatrixDefault = [];
    copyArray(boardMatrix, boardMatrixDefault);

    /////// Start game //////
    main();
    /*-------END GAME------*/

    //****************Event Listeners***************//
    document.addEventListener("keydown", checkKeyDown);
    document.addEventListener("click", checkClick);
    document.addEventListener("mousemove", checkPos);

    function disableMouseEventListeners() {
        document.removeEventListener("click", checkClick);
        document.removeEventListener("mousemove", checkPos);
    }
    //*********************************************//

    ///FUNCTIONS///

    // main function called repeatedly to keep the game running
    function main() {
        drawMainMenu();
    }

    function mainTick() {
        pacmanTick = setTimeout(function onTick () {
            //console.log("TICK");
            clearBoard();
            clearGui();
            drawGameBoard();	        

            movePacman();
            
            drawPacman();
            
            drawGhost();
            
                if (endGameCheck() === true) return;

            mainTick();
        }, 100)
    }

    function ghostTicks() {
        clearGhostTimeouts();
        timeouts.push(setTimeout(() => {
            g1.tick();
        }, 500));

        timeouts.push(setTimeout(() => {
            g2.tick();
        }, 3000));

        timeouts.push(setTimeout(() => {
            g3.tick();
        }, 6000));

        timeouts.push(setTimeout(() => {
            g4.tick();
        }, 9000));
    }

    function playGame() {
        gameAudio.play();
        showGui(true);
        mainTick();
        ghostTicks();
    }


    function drawMainMenu() {
        gameboard_ctx.drawImage(mainMenuImg, 0, 0);
        gameboard_ctx.drawImage(titleTextImg, 0, 0);
        gameboard_ctx.drawImage(gameStartTextImg, 300, 490);  //0
        gameboard_ctx.drawImage(leaderBoardTextImg, 170, 550);//1
        gameboard_ctx.drawImage(controlsTextImg, 250, 620);	  //2
    }



    function checkClick(mouseEvent) {
        //buttons[0][0]
        //First element is image
        //Second element: 0 - X; 1 - Y; 2 - width; 3 - height
        if ((mouseX >= buttons[0][0] && mouseX <= buttons[0][0] + buttons[0][2]) && (mouseY >= buttons[0][1] && mouseY <= buttons[0][1] + buttons[0][3])) {
            disableMouseEventListeners();
            playGame();
        } else if ((mouseX >= buttons[1][0] && mouseX <= buttons[1][0] + buttons[1][2]) && (mouseY >= buttons[1][1] && mouseY <= buttons[1][1] + buttons[1][3])) {
            disableMouseEventListeners();
            gameboard_ctx.drawImage(leaderboardMenuImg, 0, 0);
            bestScoreLabel.textContent = document.cookie;
            //bestScoreLabel.textContent = "8123";
            document.getElementById("bestScoreL").style.visibility = "visible";
        } else if ((mouseX >= buttons[2][0] && mouseX <= buttons[2][0] + buttons[2][2]) && (mouseY >= buttons[2][1] && mouseY <= buttons[2][1] + buttons[2][3])) {
            disableMouseEventListeners();
            gameboard_ctx.drawImage(controlsMenuImg, 0, 0);
        }

    }

    function checkPos(mouseEvent) {
        /*
        gameboard_ctx.drawImage(gameStartTextImg, 300, 490);  //0
        gameboard_ctx.drawImage(leaderBoardTextImg, 170, 550);//1
        gameboard_ctx.drawImage(controlsTextImg, 250, 620);	  //2
        */
        mouseX = mouseEvent.offsetX;
        mouseY = mouseEvent.offsetY;
        if ((mouseX >= buttons[0][0] && mouseX <= buttons[0][0] + buttons[0][2]) && (mouseY >= buttons[0][1] && mouseY <= buttons[0][1] + buttons[0][3])) {
            gameboard_ctx.drawImage(gameStartTextRedImg, 300, 490);
        } else if ((mouseX >= buttons[1][0] && mouseX <= buttons[1][0] + buttons[1][2]) && (mouseY >= buttons[1][1] && mouseY <= buttons[1][1] + buttons[1][3])) {
            gameboard_ctx.drawImage(leaderboardTextRedImg, 170, 550);
        } else if ((mouseX >= buttons[2][0] && mouseX <= buttons[2][0] + buttons[2][2]) && (mouseY >= buttons[2][1] && mouseY <= buttons[2][1] + buttons[2][3])) {
            gameboard_ctx.drawImage(controlsTextRedImg, 250, 620); 
        } else {
            drawMainMenu();
        }
    }

    function isNextPixelPortal() {
        if (pacman.getMatrixPosY() + pacman.getDy() === 14 && (pacman.getMatrixPosX() + pacman.getDx() === cubeSize.x || pacman.getMatrixPosX() + pacman.getDx() === -2)) {
            return true;
        } else {
            return false;
        }
    }

    function isCurentPixelFood() {
        if (boardMatrix[pacman.getMatrixPosY()][pacman.getMatrixPosX()] === 0) {
            return true;
        } else {
            return false;
        }
    }

    function isCurentPixelSpecialFood() {
        if (boardMatrix[pacman.getMatrixPosY()][pacman.getMatrixPosX()] === 3) {
            return true;
        } else {
            return false;
        }
    }

    function drawGameBoard () {
        for (j = 0; j < 31; j++) {
            for (i = 0; i < 28; i++) {
                
                if (boardMatrix[j][i] === 0) {
                    gameboard_ctx.drawImage(bananImg, i*cubeSize.x, j*cubeSize.y);
                }

                if (boardMatrix[j][i] === 1) {
                    gameboard_ctx.drawImage(cactusImg, i*cubeSize.x, j*cubeSize.y, cubeSize.x, cubeSize.y);
                }

                if (boardMatrix[j][i] === 3) {
                    gameboard_ctx.drawImage(specialFoodImg, i*cubeSize.x, j*cubeSize.y);
                }

                if (boardMatrix[j][i] === 2 || boardMatrix[j][i] === 4) {
                    gameboard_ctx.drawImage(boardBackgroundImg, i*cubeSize.x, j*cubeSize.y);
                }	
            }
        }

        for (i = 0; i < pacman.getLives(); i++) {
            gui_ctx.drawImage(lifeImg, i*cubeSize.x, cubeSize.y);
        }

    }

    function clearBoard() {
        for (j = 0; j < 31; j++) {
            for (i = 0; i < 28; i++) {
                gameboard_ctx.drawImage(boardBackgroundImg, i*cubeSize.x, j*cubeSize.y);
            }
        }
    }

    function clearGui() {
        gui_ctx.fillStyle = 'white';
        gui_ctx.fillRect(0,0, gui.width, gui.height);
    }

    function movePacman() {
        //if Next pixel border or Ghost's Camp
        if (pacman.isNextPixelBorder() === true) {
            pacman.stopMovement();
        
        //if Next pixel Portal
        } else if (isNextPixelPortal() === true) {
            if (pacman.getMatrixPosX() === 28) {
                pacman.setMatrixPos({x: -1, y: pacman.getMatrixPosY()});
                pacman.setCanvasPos({x: pacman.getMatrixPosX() * cubeSize.x, y: pacman.getMatrixPosY() * cubeSize.y});	
            } else {
                pacman.setMatrixPos({x: 28, y: pacman.getMatrixPosY()});
                pacman.setCanvasPos({x: pacman.getMatrixPosX() * cubeSize.x, y: pacman.getMatrixPosY() * cubeSize.y});
            }
        
        //if Next pixel Path	
        } else {
            pacman.setMatrixPos({x: pacman.getMatrixPosX() + pacman.getDx(), y: pacman.getMatrixPosY() + pacman.getDy()});
            pacman.setCanvasPos({x: pacman.getMatrixPosX() * cubeSize.x, y: pacman.getMatrixPosY() * cubeSize.y});

            /*
            if (counter < 27) {
                pacman.setCanvasPos({x: (pacman.getMatrixPosX() * cubeSize.x) + counter, y: (pacman.getMatrixPosY() * cubeSize.y)});
                counter += 9;
            } else {
                pacman.setMatrixPos({x: pacman.getMatrixPosX() + pacman.getDx(), y: pacman.getMatrixPosY() + pacman.getDy()});
                //pacman.setCanvasPos({x: pacman.getMatrixPosX() * cubeSize.x, y: pacman.getMatrixPosY() * cubeSize.y});
                counter = 0;
            }
            */
            
        }

        //if Current pixel Food
        if (isCurentPixelFood() === true) {
            pacman.hasEaten("fruit");
            boardMatrix[pacman.getMatrixPosY()][pacman.getMatrixPosX()] = 2;
        } else if (isCurentPixelSpecialFood() === true) {
            pacman.hasEaten("powerFruit");
            clearTimeout(pacmanPowerDown);
        
            boardMatrix[pacman.getMatrixPosY()][pacman.getMatrixPosX()] = 2;
            
            pacman.setPowerUp(true);

            for (i = 0; i < listOfGhosts.length; i++) {
                if (listOfGhosts[i].getEaten() === false) {
                    listOfGhosts[i].setVulnerable(true);
                    //listOfGhosts[i].setSpeed(listOfGhosts[i].getSpeed() + 100);
                }
            }

            pacmanPowerDown = setTimeout(() => {
                //song.pause();
                pacman.setPowerUp(false);
                for (i = 0; i < listOfGhosts.length; i++) {
                    if (listOfGhosts[i].getEaten() === false) {
                        //listOfGhosts[i].setSpeed(listOfGhosts[i].getSpeed() - 100);
                        listOfGhosts[i].setVulnerable(false);
                    }
                }
            }, 8000);
        }

        //if Current pixel ghost and Pacman is power upped 
        isPacmanEatsGhost();
    }		

    function drawPacman() {
        if (pacman.getDirection() === 'up') {
            gameboard_ctx.drawImage(pacmanNImg, pacman.getCanvasPosX(), pacman.getCanvasPosY(), cubeSize.x, cubeSize.y);
        } else if (pacman.getDirection() === 'right') {
            gameboard_ctx.drawImage(pacmanEImg, pacman.getCanvasPosX(), pacman.getCanvasPosY(), cubeSize.x, cubeSize.y);
        } else if (pacman.getDirection() === 'down') {
            gameboard_ctx.drawImage(pacmanSImg, pacman.getCanvasPosX(), pacman.getCanvasPosY(), cubeSize.x, cubeSize.y);
        } else if (pacman.getDirection() === 'left') {
            gameboard_ctx.drawImage(pacmanWImg, pacman.getCanvasPosX(), pacman.getCanvasPosY(), cubeSize.x, cubeSize.y);
        }
    }

    function checkKeyDown(event) {
        const LEFT_KEY = 37;
        const A_KEY = 65;

        const RIGHT_KEY = 39;
        const D_KEY = 68;
        
        const UP_KEY = 38;
        const W_KEY = 87;

        const DOWN_KEY = 40;
        const S_KEY = 83;

        const SPACE_KEY = 32;
        const BACKSPACE = 8;
        const keyPressed = event.keyCode;

        if (keyPressed === UP_KEY || keyPressed === W_KEY) {
            pacman.setDx(0);
            pacman.setDy(-1);
            pacman.setDirection('up');
        }

        if (keyPressed === DOWN_KEY || keyPressed === S_KEY) {
            pacman.setDx(0);
            pacman.setDy(1);
            pacman.setDirection('down');
        }

        if (keyPressed === RIGHT_KEY || keyPressed === D_KEY) {
            pacman.setDx(1);
            pacman.setDy(0);
            pacman.setDirection('right');
        }

        if (keyPressed === LEFT_KEY || keyPressed === A_KEY) {
            pacman.setDx(-1);
            pacman.setDy(0);
            pacman.setDirection('left');
        }

        if (keyPressed === SPACE_KEY) {
            if (counter % 2 > 0) {
                document.getElementById("pauseText").style.visibility = "visible";
                gameAudio.pause();
                clearGhostTimeouts();
                clearTimeout(pacmanTick);
                pacman.stopMovement();
            } else {
                document.getElementById("pauseText").style.visibility = "hidden";
                gameAudio.play();
                playGame();
            }
            counter++;
        }

        if (keyPressed === BACKSPACE) {
            location.reload();
        }

    }


    function drawGhost() {
        if (g1.getVulnerable() === false && g1.getEaten() === false) {
            gameboard_ctx.drawImage(g1Img, g1.getCanvasPosX(), g1.getCanvasPosY(), cubeSize.x, cubeSize.y);	
        
        } else if (g1.getVulnerable() === true && g1.getEaten() === false) {
            gameboard_ctx.drawImage(g1vImg, g1.getCanvasPosX(), g1.getCanvasPosY(), cubeSize.x, cubeSize.y);
        
        } else if (g1.getVulnerable() === false && g1.getEaten() === true) {
            gameboard_ctx.drawImage(eyesImg, g1.getCanvasPosX(), g1.getCanvasPosY(), cubeSize.x, cubeSize.y)
        }

        
        if (g2.getVulnerable() === false && g2.getEaten() === false) {
            gameboard_ctx.drawImage(g2Img, g2.getCanvasPosX(), g2.getCanvasPosY(), cubeSize.x, cubeSize.y);	
        
        } else if (g2.getVulnerable() === true && g2.getEaten() === false){
            gameboard_ctx.drawImage(g2vImg, g2.getCanvasPosX(), g2.getCanvasPosY(), cubeSize.x, cubeSize.y);
        
        } else if (g2.getVulnerable() === false && g2.getEaten() === true) {
            gameboard_ctx.drawImage(eyesImg, g2.getCanvasPosX(), g2.getCanvasPosY(), cubeSize.x, cubeSize.y);
        }

        if (g3.getVulnerable() === false && g3.getEaten() === false) {
            gameboard_ctx.drawImage(g3Img, g3.getCanvasPosX(), g3.getCanvasPosY(), cubeSize.x, cubeSize.y);	
        
        } else if (g3.getVulnerable() === true && g3.getEaten() === false){
            gameboard_ctx.drawImage(g3vImg, g3.getCanvasPosX(), g3.getCanvasPosY(), cubeSize.x, cubeSize.y);
        
        } else if (g3.getVulnerable() === false && g3.getEaten() === true) {
            gameboard_ctx.drawImage(eyesImg, g3.getCanvasPosX(), g3.getCanvasPosY(), cubeSize.x, cubeSize.y);
        }

        if (g4.getVulnerable() === false && g4.getEaten() === false) {
            gameboard_ctx.drawImage(g4Img, g4.getCanvasPosX(), g4.getCanvasPosY(), cubeSize.x, cubeSize.y);	
        
        } else if (g4.getVulnerable() === true && g4.getEaten() === false){
            gameboard_ctx.drawImage(g4vImg, g4.getCanvasPosX(), g4.getCanvasPosY(), cubeSize.x, cubeSize.y);
        
        } else if (g4.getVulnerable() === false && g4.getEaten() === true) {
            gameboard_ctx.drawImage(eyesImg, g4.getCanvasPosX(), g4.getCanvasPosY(), cubeSize.x, cubeSize.y);
        }	 
    }

    function gameOver() {
        for (i = 0; i < listOfGhosts.length; i++) {
            if (pacman.getMatrixPosX() === listOfGhosts[i].getMatrixPosX() && pacman.getMatrixPosY() === listOfGhosts[i].getMatrixPosY() && listOfGhosts[i].getEaten() === false && listOfGhosts[i].getVulnerable() === false) {
                if (pacman.getLives() === 1) {
                    deathAudio.play();
                    pacman.setLives(pacman.getLives() - 1);
                    gameboard_ctx.drawImage(gameOverImg, 0, 0, gameboard.width, gameboard.height);
                    pacman.setLives(3);
                    
                    clearGhostTimeouts();

                    clearTimeout(pacmanTick);
                    gameAudio.pause();
                    return true;
                } else {
                    deathAudio.play();
                    pacman.setLives(pacman.getLives() - 1);
                    reset();
                    return false;
                }	
            }
        }
    }

    function gameWin() {
        for (j = 0; j < 31; j++) {
            for (i = 0; i < 28; i++) {
                if (boardMatrix[j][i] === 0 || boardMatrix[j][i] === 3) {
                    return false;
                }
            }
        }
        return true;	
    }		

    function reset() {
        clearGhostTimeouts();
        pacman.setMatrixPos({x: 1, y: 1});
        pacman.stopMovement();
        for (i = 0; i < listOfGhosts.length; i++) {
            listOfGhosts[i].setMatrixPos(listOfGhosts[i].getMatrixDefaultPos());
            listOfGhosts[i].setCanvasPos({x: listOfGhosts[i].getMatrixPosX() * cubeSize.x, y: listOfGhosts[i].getMatrixPosY() * cubeSize.y});
            listOfGhosts[i].setVulnerable(false);
            listOfGhosts[i].setEaten(false);
            listOfGhosts[i].setSpeed(listOfGhosts[i].getDefaultSpeed());
        }
        drawGhost();
        ghostTicks();
    }

    function isPacmanEatsGhost() {
        if (pacman.getPowerUp() === true) {
            for (i = 0; i < listOfGhosts.length; i++) {
                if (pacman.getMatrixPosX() === listOfGhosts[i].getMatrixPosX() && pacman.getMatrixPosY() === listOfGhosts[i].getMatrixPosY() && listOfGhosts[i].getVulnerable() === true) {
                    listOfGhosts[i].setEaten(true);
                    pacman.hasEaten("ghost");
                    listOfGhosts[i].setVulnerable(false);
                    listOfGhosts[i].setSpeed(50);
                    return true;
                }
            }
        }
    }

    function endGameCheck() {
        if (gameOver() === true) {
            saveBestScore();
            return true;
        } else if (gameWin() === true) {
            level++;
            levelLabel.textContent = level;
            copyArray(boardMatrixDefault, boardMatrix);
            saveBestScore();
            for (i = 0; i < listOfGhosts.length; i++) {
                listOfGhosts[i].setDefaultSpeed(listOfGhosts[i].getDefaultSpeed() + 100);
            }
        }
    }


    function copyArray(fromArray, toArray) {
        for (var i = 0; i < fromArray.length; i++) {
                toArray[i] = fromArray[i].slice();
            }
    }

    function showGui(value) {
        if (value === true) {
            document.getElementById("gui").style.visibility = "visible";
            document.getElementById("levelText").style.visibility = "visible";
            document.getElementById("levelNumber").style.visibility = "visible";
            document.getElementById("scoreText").style.visibility = "visible";
            document.getElementById("scoreNumber").style.visibility = "visible";
        } else {
            document.getElementById("gui").style.visibility = "hidden";
            document.getElementById("levelText").style.visibility = "hidden";
            document.getElementById("levelNumber").style.visibility = "hidden";
            document.getElementById("scoreText").style.visibility = "hidden";
            document.getElementById("scoreNumber").style.visibility = "hidden";
            document.getElementById("bestScoreL").style.visibility = "hidden";
        }
    }

    function saveBestScore() {
        alert("Your Score: " + scoreLabel.textContent);
        if (parseInt(scoreLabel.textContent) > bestScore) {
            alert("New Best Score!");
            document.cookie = "" + scoreLabel.textContent + "; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/";
        }

        if (parseInt(levelLabel.textContent) > bestLevel) {
            alert("New Best Level!");
            localStorage.setItem("bestlvl", levelLabel.textContent);
        }
    }

    function clearGhostTimeouts() {
        for (let k = 0; k < timeouts.length; k++) {
            clearTimeout(timeouts[k]);
        }
    }
}