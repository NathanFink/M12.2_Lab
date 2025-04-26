//window constraints
const canvas = document.querySelector("canvas");
const ctx    = canvas.getContext("2d");
const width  = (canvas.width  = window.innerWidth);
const height = (canvas.height = window.innerHeight);

//starter variables
let lives    = 3;
let score    = 0;
let gameOver = false;

//helper function
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//creates an area in the top right to display a live count
function drawLives() {
  ctx.fillStyle    = 'white';
  ctx.font         = '20px sans-serif';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`Lives: ${lives}`, width - 20, 20);
}

//creates an area in the top left to display a score accumulated
function drawScore() {
  ctx.fillStyle    = 'white';
  ctx.font         = '20px sans-serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, 20, 20);
}

class Shape {
  constructor(x, y, velX = 0, velY = 0) {
    this.x    = x;
    this.y    = y;
    this.velX = velX;
    this.velY = velY;
  }
}

// Creates the evil circle that will be shot out of our movable character
class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.color       = 'white';
    this.size        = 15;
    this.barrelAngle = -Math.PI / 2;
    this.barrelSpeed = 0.2;

    window.addEventListener("keydown", e => {
      if (gameOver) return;
      switch (e.key) {
        case "a": this.x -= this.velX; break;
        case "d": this.x += this.velX; break;
        case "w": this.y -= this.velY; break;
        case "s": this.y += this.velY; break;
        case "q": this.barrelAngle -= this.barrelSpeed; break; //moves the barrel left
        case "e": this.barrelAngle += this.barrelSpeed; break; //oves the barrell right
        case " ": shoot(); break; //pressing space bar will shoot a circle
      }
      this.barrelAngle %= Math.PI * 2;
    });

    canvas.addEventListener("mousedown", () => {
      if (!gameOver) shoot(); // a mouse click will also shoot a evil circle
    });
  }

  //creates a circle with the barrell for the user to control
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 3;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();

    const len = this.size * 2;
    const ex  = this.x + Math.cos(this.barrelAngle) * len;
    const ey  = this.y + Math.sin(this.barrelAngle) * len;
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 4;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  //checks the bound of the window 
  checkBounds() {
    if (this.x + this.size > width)  this.x = width  - this.size;
    if (this.x - this.size < 0)      this.x = this.size;
    if (this.y + this.size > height) this.y = height - this.size;
    if (this.y - this.size < 0)      this.y = this.size;
  }

  //if the projectiles hit the side of the window they will delete 
  collisionDetect() {
    for (const p of enemyProjectiles) {
      if (!p.exists) continue;
      const dx = this.x - p.x;
      const dy = this.y - p.y;
      if (Math.hypot(dx, dy) < this.size + p.size) {
        p.exists = false;
        lives--;
        if (lives <= 0) gameOver = true;
      }
    }
  }
}

// creates the projectilce to ove in a direction 
class Projectile extends Shape {
  constructor(x, y, velX, velY, size = 6, color = 'white') {
    super(x, y, velX, velY);
    this.size   = size;
    this.color  = color;
    this.exists = true;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  //updates the projectile for movement
  update() {
    this.x += this.velX;
    this.y += this.velY;
    if (
      this.x - this.size < 0 ||
      this.x + this.size > width ||
      this.y - this.size < 0 ||
      this.y + this.size > height
    ) {
      this.exists = false;
    }
  }
}

// creates the square enemy that moves about randomly
class Enemy extends Shape {
  constructor(x, y, size = 20, color = 'red') {
    super(x, y);
    this.size        = size;
    this.color       = color;
    this.exists      = true;
    this.shootTimer  = random(120, 240);
    this.moveTimer   = random(30, 120);
    this.velX        = random(-2, 2);
    this.velY        = random(-2, 2);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
  }

  //handles the movement and shooting, always shoots toward the player but shoots slowly compared to the player
  update() {
    if (!this.exists) return;

    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.moveTimer = random(30, 120);
      this.velX = random(-2, 2);
      this.velY = random(-2, 2);
    }
    this.x += this.velX;
    this.y += this.velY;
    if (this.x - this.size < 0 || this.x + this.size > width)  this.velX *= -1;
    if (this.y - this.size < 0 || this.y + this.size > height) this.velY *= -1;

    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shootTimer = random(120, 240);
      this.shoot();
    }
  }

  shoot() {
    const speed = 4;
    const dx    = evilCircle.x - this.x;
    const dy    = evilCircle.y - this.y;
    const dist  = Math.hypot(dx, dy) || 1;
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

// INitialize
const evilCircle        = new EvilCircle(width / 2, height / 2);
const playerProjectiles = [];
const enemyProjectiles  = [];
const enemies           = [];

// spawns enemies within certain areas, 3-5 at one time that loops every 15 seconds
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    const size = 20;
    const x    = random(size, width - size);
    const y    = random(size, height - size);
    enemies.push(new Enemy(x, y, size));
  }
}

spawnEnemies(random(3, 5));
setInterval(() => {
  if (!gameOver) spawnEnemies(random(3, 5));
}, 15000);

//shoot method for the svil circle projectiles that defeat enemies and/or lose lives
function shoot() {
  const speed = 10;
  const ang   = evilCircle.barrelAngle;
  const startX = evilCircle.x + Math.cos(ang) * evilCircle.size;
  const startY = evilCircle.y + Math.sin(ang) * evilCircle.size;
  playerProjectiles.push(
    new Projectile(
      startX,
      startY,
      Math.cos(ang) * speed,
      Math.sin(ang) * speed,
      6,
      'white'
    )
  );
}

function loop() {
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle    = 'red';
    ctx.font         = '60px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', width / 2, height / 2 - 30);
    ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 40);
    return;
  }

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, width, height);

  drawScore();
  drawLives();

  evilCircle.draw();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();

  playerProjectiles.forEach(p => {
    if (!p.exists) return;
    p.draw();
    p.update();
    enemies.forEach(e => {
      if (e.exists && Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size) {
        e.exists = false;
        p.exists = false;
        score   += 100;
      }
    });
  });
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    if (!playerProjectiles[i].exists) playerProjectiles.splice(i, 1);
  }

  enemies.forEach(e => {
    if (e.exists) {
      e.draw();
      e.update();
    }
  });

  enemyProjectiles.forEach(p => {
    if (!p.exists) return;
    p.draw();
    p.update();
  });
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    if (!enemyProjectiles[i].exists) enemyProjectiles.splice(i, 1);
  }

  requestAnimationFrame(loop);
}

loop();
