
//Places 2D canvas that fills to the screen width and height
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

//Places the background image to display while the canvas is transparent
const menu = document.querySelector('.button-column');
const bg = new Image();
bg.src = 'img/MainBackground.png';

//Starts currentLevel at ) unless level is specified in the URL
const urlParams = new URLSearchParams(window.location.search);
let currentLevel = urlParams.has('level') ? parseInt(urlParams.get('level'), 10) : 0;

//Inital vairbales for base game, lives, score, gameover boolean and start time
let lives = 3;
let score = 0;
let gameOver = false;
let startTime = Date.now();

//Listener for keys, key presses equal true so they will activate and false when they are no longer pressed
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = keys[e.code] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = keys[e.code] = false; });

//varibales for establishing how fast the player can shoot
let lastShotTime = 0;
const shotDelay = 100;

//random number generation
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function for printing score and time to the top left of the screen
function drawScore() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000); //creates elaspsed time
  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}   Time: ${elapsed}s`, 20, 20); //prints both varibales
}

//similar function to drawScore() but establishes lives to the right side of the screen
function drawLives() {
  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`Lives: ${lives}`, width - 20, 20); //prints the variable for lives
}

//starting shape class from the ball game project
class Shape {
  constructor(x, y, velX = 0, velY = 0) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

//evil circle class established from the ball game project but changed to fit project needs
class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 5, 5);
    this.color = 'white'; //evil circle color
    this.size = 15; //evil circle size
    this.barrelAngle = -Math.PI / 2; //starting angle for barrel
    this.barrelSpeed = 0.1; //barrel rotation speed

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      this.barrelAngle = Math.atan2(
        e.clientY - rect.top - this.y,
        e.clientX - rect.left - this.x
      );
    });

    canvas.addEventListener('mousedown', () => { if (!gameOver) shoot(); }); //event listener for the space bar, when pressed down it will fire a shot 
  
  }

  //establishes move, rotating barrel keys commands
  move() {
    if (keys.a) this.x -= this.velX;
    if (keys.d) this.x += this.velX;
    if (keys.w) this.y -= this.velY;
    if (keys.s) this.y += this.velY;
    if (keys.q) this.barrelAngle -= this.barrelSpeed;
    if (keys.e) this.barrelAngle += this.barrelSpeed;
    this.barrelAngle %= Math.PI * 2;

    //makes sure the evil circle stays on the screen
    if (this.x + this.size > width) this.x = width - this.size;
    if (this.x - this.size < 0) this.x = this.size;
    if (this.y + this.size > height) this.y = height - this.size;
    if (this.y - this.size < 0) this.y = this.size;
  }
  //this function actually draws the circle
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color; //fill color
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); //circle
    ctx.fill(); //fill shape with color
    const len = this.size * 2; // creates barrel length

    //barrel placement 
    const ex = this.x + Math.cos(this.barrelAngle) * len; 
    const ey = this.y + Math.sin(this.barrelAngle) * len;
    
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4; //line size for barrel
    ctx.moveTo(this.x, this.y); //centers the circle 
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  //this is similar to what we made in the ball game project, whenever the enemy projectile hits the evil circle live count decrements
  collisionDetect(enemyProjectiles) {
    for (const p of enemyProjectiles) {
      if (!p.exists) continue;
      const dx = this.x - p.x;
      const dy = this.y - p.y;

      // if projectile overlaps then decrement a life, if lives = 0 then game is over
      if (Math.hypot(dx, dy) < this.size + p.size) {
        p.exists = false;
        lives--;
        if (lives <= 0) gameOver = true;
      }
    }
  }
}

//class for creating the projectiles, smaller yellow circles
class Projectile extends Shape {
  constructor(x, y, velX, velY, size = 6, color = 'white') {
    super(x, y, velX, velY);
    this.size = size;
    this.color = color;
    this.exists = true;
  }

  //draw fucntion for the projectile
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  //this fucntion handles the movement of the projectile on its path, if it hits a border it deletes
  update() {
    this.x += this.velX;
    this.y += this.velY;
    //if border than delete
    if (
      this.x - this.size < 0 ||
      this.x + this.size > width ||
      this.y - this.size < 0 ||
      this.y + this.size > height
    ) this.exists = false;
  }
}

//class for handling the enemy squares that shoot projectiles
class Enemy extends Shape {
  constructor(x, y, size = 20, color = 'red') {
    super(x, y);
    this.size = size;
    this.color = color;
    this.exists = true;
    
    //timer for how fast they shoot
    this.shootTimer = random(120, 240);
    //timer for new shooting angle
    this.moveTimer = random(30, 120);

    //random movement
    this.velX = random(-2, 2);
    this.velY = random(-2, 2);
  }
  //draw functionality for visual
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size,
      this.y - this.size,
      this.size * 2,
      this.size * 2
    );
  }

  //this function takes the position of the evil circle and updates the shoot angle and path for a projectile to hit
  update(enemyProjectiles, evilCircle) {
    if (!this.exists) return;
    
    //if timer expires, restart and movement direction
    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.moveTimer = random(30, 120);
      this.velX = random(-2, 2);
      this.velY = random(-2, 2);
    }

    //movement
    this.x += this.velX;
    this.y += this.velY;

    //keeps enemey within frame
    if (this.x - this.size < 0 || this.x + this.size > width) this.velX *= -1;
    if (this.y - this.size < 0 || this.y + this.size > height) this.velY *= -1;

    //when timer hits 0 fire the projectile towards the player
    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shootTimer = random(120, 240);
      const speed = 4;
      const dx = evilCircle.x - this.x;
      const dy = evilCircle.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;

      //shoot new projectile with caluclated angle at a speed towardn player
      enemyProjectiles.push(
        new Projectile(
          this.x,
          this.y,
          (dx / dist) * speed,
          (dy / dist) * speed,
          6,
          'yellow'
        )
      );
    }
  }
}

//Creates Bigger Yellow Circle objectives that must be touched 
class YellowCircleObjective extends Shape {
  constructor(x, y, size = 15, scoreValue = 500) {
    super(x, y);
    this.size = size;
    this.scoreValue = scoreValue;
    this.exists = true;
  }
  //draws the circle to visbile
  draw() {
    if (!this.exists) return;
    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  //if played overlaps the circle increase score and delete the circle
  update(player) {
    if (!this.exists) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    if (Math.hypot(dx, dy) < this.size + player.size) {
      this.exists = false;
      score += this.scoreValue;
    }
  }
}

//creates purple triangle objectives that spawn enemies and have health
class PurpleTriangleObjective extends Shape {
  //basic starting values, like health and spawning time
  constructor(x, y, size = 20, health = 5, spawnInterval = 5000) {
    super(x, y);
    this.size = size;
    this.health = health;
    this.hitsTaken = 0;
    this.exists = true;
    this.spawnInterval = spawnInterval;
    this._lastSpawn = Date.now();
  }

  //draws the purple triangle to visbile
  draw() {
    if (!this.exists) return;
    ctx.beginPath();
    ctx.fillStyle = 'purple';
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x - this.size, this.y + this.size);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.closePath();
    ctx.fill();
  }

  //if exists then spawn enemies at rate and with random 1-3 enemies
  update() {
    if (!this.exists) return;
    
    //if spawntimer is exceeded, spawn enemies and restart the timer
    if (Date.now() - this._lastSpawn >= this.spawnInterval) {
      this._lastSpawn = Date.now();
      const num = random(1, 3);
      const offset = 60;
      
      //generates 1-3 enemeies 
      for (let i = 0; i < num; i++) {
        let ex = this.x + random(-offset, offset);
        let ey = this.y + random(-offset, offset);
        ex = Math.min(Math.max(ex, 20), width - 20);
        ey = Math.min(Math.max(ey, 20), height - 20);
        enemies.push(new Enemy(ex, ey));
      }
    }
  }
  //if the object still exists increment hit count if hit until the hitcount exceeds total health
  takeHit() {
    if (!this.exists) return;
    this.hitsTaken++;
    if (this.hitsTaken >= this.health) this.exists = false;
  }
}

//function that spawns the yellow objectives at a random position
function spawnYellowObjective() {
  const margin = 50;
  return new YellowCircleObjective(
    random(margin, width - margin),
    random(margin, height - margin)
  );
}

//function for spawning enemies, the red squares
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(
      new Enemy(
        random(20, width - 20),
        random(20, height - 20)
      )
    );
  }
}

//starting variables and arrays for game
const evilCircle = new EvilCircle(width / 2, height / 2);
const playerProjectiles = []; 
const enemyProjectiles = [];
const enemies = [];
const objectives = [];

//if level 1 spawn a yellow objective
let yellowObj = currentLevel === 1 ? spawnYellowObjective() : null;

//if level is 3 then spawn purple objectives
let purpleObjs = [];
if (currentLevel === 3) {
  const m = 60;
  //3 purple objectives at random positions and with proper rates for health, size and spawning
  for (let i = 0; i < 3; i++) {
    purpleObjs.push(
      new PurpleTriangleObjective(
        random(m, width - m),
        random(m, height - m),
        20,
        5,
        5000
      )
    );
  }
}

//spawns 3-5 enemies 
spawnEnemies(random(3, 5)); //inital enemies
setInterval(() => { if (!gameOver) spawnEnemies(random(3, 5)); }, 15000); //repeat spawns after 15 seconds

//shoot function that releases projectiles from the players barrel angle, with delay between shots
function shoot() {
  const now = Date.now();
  if (now - lastShotTime < shotDelay) return;
  lastShotTime = now;
  const speed = 10;
  const ang = evilCircle.barrelAngle;
  const sx = evilCircle.x + Math.cos(ang) * evilCircle.size;
  const sy = evilCircle.y + Math.sin(ang) * evilCircle.size;
  playerProjectiles.push(
    new Projectile(sx, sy, Math.cos(ang) * speed, Math.sin(ang) * speed)
  );
}

//submits all leaderboard data to leaderboard at specific level recieved
function submitLeaderboardData(name, level, finalScore, elapsed) {
  const id = Date.now().toString();
  fetch("https://pd8riz0m4b.execute-api.us-east-2.amazonaws.com/items", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, score: finalScore, time: elapsed, level })
  }).catch(() => {});
}

//final loop for continuing game as long as it is not designated over and calling fucntions for game start
function loop() {
  //if game over is true create the game overscreen with score and buttons to home and leaderboard and submits the data
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'red';
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const final = score + elapsed * 3;
    ctx.fillText(`Final Score: ${final}`, width / 2, height * 0.4);
    submitLeaderboardData(
      localStorage.getItem('playerName') || 'Anonymous',
      currentLevel,
      final,
      elapsed
    );
    menu.style.display = 'flex';
    return;
  }

  menu.style.display = 'none';
  ctx.drawImage(bg, 0, 0, width, height);

  //draws lives and score
  drawScore();
  drawLives();

  //level 1 produces yellow objectives
  if (currentLevel === 1 && yellowObj) {
    yellowObj.update(evilCircle);
    if (!yellowObj.exists) yellowObj = spawnYellowObjective();
    yellowObj.draw();
  }

  //level 3 produces purple objectives
  if (currentLevel === 3) {
    purpleObjs.forEach(t => {
      t.update();
      t.draw();
    });
  }

  //move, shoot, and collison functionality 
  evilCircle.move();
  if (keys[' ']) shoot();
  evilCircle.draw();
  evilCircle.collisionDetect(enemyProjectiles);

  //
  playerProjectiles.forEach((p, i) => {
    if (!p.exists) { playerProjectiles.splice(i, 1); return; }
    p.draw();
    p.update();
    //collision with purple objects here 
    if (currentLevel === 3) {
      purpleObjs.forEach(t => {
        if (
          t.exists &&
          Math.hypot(p.x - t.x, p.y - t.y) < p.size + t.size
        ) {
          t.takeHit();
          p.exists = false;
        }
      });
    }
    //if enemy is removed/ killed, gain 100 to score
    enemies.forEach(e => {
      if (
        e.exists &&
        Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size
      ) {
        e.exists = p.exists = false;
        score += 100;
      }
    });
  });

  //draw enemeies, update movement and attack
  enemies.forEach(e => {
    if (!e.exists) return;
    e.update(enemyProjectiles, evilCircle);
    e.draw();
  });

  //draw projectiles for enemies and movement
  enemyProjectiles.forEach((p, i) => {
    if (!p.exists) { enemyProjectiles.splice(i, 1); return; }
    p.draw();
    p.update();
  });

  requestAnimationFrame(loop);
}

loop();
