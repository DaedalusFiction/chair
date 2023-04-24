// Variables for the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Key input handling
const keyState = {};
document.addEventListener("keydown", (event) => {
    keyState[event.code] = true;
});
document.addEventListener("keyup", (event) => {
    keyState[event.code] = false;
});

let score = 0;

// Player object
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    rotation: 0,
    rotationSpeed: 0.05,
    weapon: {
        length: 30,
        angle: 0,
        spinning: false,
    },
    pushOffForce: 0.15,
    pullInForce: 0.25,
};

let keys = {
    left: false,
    right: false,
    down: false,
};

document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
        keys.left = true;
    }
    if (event.code === "ArrowRight") {
        keys.right = true;
    }
    if (event.code === "ArrowDown") {
        keys.down = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") {
        keys.left = false;
    }
    if (event.code === "ArrowRight") {
        keys.right = false;
    }
    if (event.code === "ArrowDown") {
        keys.down = false;
    }
});

// Update player rotation
function updatePlayerRotation() {
    if (keyState["ArrowLeft"]) {
        player.rotation -= player.pushOffForce;
    }
    if (keyState["ArrowRight"]) {
        player.rotation += player.pushOffForce;
    }
    if (keyState["ArrowDown"]) {
        player.rotationSpeed += player.pullInForce;
    } else {
        player.rotationSpeed = 0.05;
    }
    player.rotation %= 2 * Math.PI;
}

// Draw the player
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    // Draw player body (office chair)
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();

    // Draw weapon (sword or bat)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -player.weapon.length);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
}
// Zombie objects
const zombies = [];
const zombieSpeed = 1;

// Create a new zombie
function spawnZombie() {
    const angle = Math.random() * 2 * Math.PI;
    const x = canvas.width / 2 + (canvas.width / 2) * Math.cos(angle);
    const y = canvas.height / 2 + (canvas.height / 2) * Math.sin(angle);

    zombies.push({
        x: x,
        y: y,
        angle: angle,
        speed: zombieSpeed,
    });
}

// Update zombie positions
function updateZombies() {
    for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i];
        zombie.x += zombie.speed * Math.cos(zombie.angle);
        zombie.y += zombie.speed * Math.sin(zombie.angle);
    }
}

// Draw zombies
function drawZombies() {
    for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i];

        ctx.beginPath();
        ctx.arc(zombie.x, zombie.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "green";
        ctx.fill();
    }
}

// Collision detection
function checkCollisions() {
    const weaponEndX =
        player.x + player.weapon.length * Math.sin(player.rotation);
    const weaponEndY =
        player.y - player.weapon.length * Math.cos(player.rotation);

    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        const dx = weaponEndX - zombie.x;
        const dy = weaponEndY - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            zombies.splice(i, 1);
        }
    }
}
// Keyboard input handling
let leftKeyDown = false;
let rightKeyDown = false;
let downKeyDown = false;

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        leftKeyDown = true;
    } else if (event.key === "ArrowRight") {
        rightKeyDown = true;
    } else if (event.key === "ArrowDown") {
        downKeyDown = true;
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
        leftKeyDown = false;
    } else if (event.key === "ArrowRight") {
        rightKeyDown = false;
    } else if (event.key === "ArrowDown") {
        downKeyDown = false;
    }
});

function handleInput() {
    if (leftKeyDown) {
        player.rotation -= player.rotationSpeed;
    }
    if (rightKeyDown) {
        player.rotation += player.rotationSpeed;
    }
    if (downKeyDown) {
        player.rotationSpeed *= 1.03;
    } else {
        player.rotationSpeed *= 0.98;
    }
    player.rotationSpeed = Math.min(
        Math.max(player.rotationSpeed, player.minRotationSpeed),
        player.rotationSpeed
    );
}

// Spawning zombies
let spawnInterval = 1000;
let lastSpawnTime = performance.now();

function shouldSpawnZombie(currentTime) {
    if (currentTime - lastSpawnTime >= spawnInterval) {
        lastSpawnTime = currentTime;
        return true;
    }
    return false;
}
function spawnZombie() {
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * canvas.width * 0.5;
    const y = Math.sin(angle) * canvas.height * 0.5;
    const zombie = {
        x,
        y,
        rotation: angle + Math.PI,
        speed: 1,
    };
    zombies.push(zombie);
}

function moveZombies() {
    for (const zombie of zombies) {
        zombie.x += Math.cos(zombie.rotation) * zombie.speed;
        zombie.y += Math.sin(zombie.rotation) * zombie.speed;
    }
}

function update() {
    if (keys.left) {
        player.angle -= player.rotationSpeed;
    }
    if (keys.right) {
        player.angle += player.rotationSpeed;
    }
    if (keys.down) {
        player.rotationSpeed = player.boostedRotationSpeed;
    } else {
        player.rotationSpeed = player.normalRotationSpeed;
    }

    updateZombies();
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    updatePlayerRotation();
    drawPlayer();
    zombies.forEach((zombie) => {
        zombie.draw(ctx);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
