const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const gameOver = document.getElementById('gameOver');
const heartsDisplay = document.getElementById('heartsDisplay');
const coinsDisplay = document.getElementById('coinsDisplay');

canvas.width = 1280;
canvas.height = 768;

const windowWidthOffset = (window.innerWidth - canvas.width) / 2;
const windowHeightOffset = (window.innerHeight - canvas.height) / 2;

context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.onload = () => {
    animate();
}
image.src = './../assets/gameMap2.png';

let placementTiles = [];
let enemies = [];
let buildings = [];
let explosions = [];

let mouse = {
    x: undefined,
    y: undefined
};

let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100;
let animationId;

spawnEnemies(enemyCount);

const placementTilesData2d = [];

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2d.push(placementTilesData.slice(i, i + 20));
}

for (let i = placementTilesData2d.length - 1; i >= 0; i--) {
    const row = placementTilesData2d[i];

    for (let j = row.length - 1; j >= 0; j--) {
        const symbol = row[j];

        if (symbol === 14) {
            // Add building
            placementTiles.push(new PlacementTile({
                position: {
                    x: j * tileSize,
                    y: i * tileSize
                }
            }));
        }
        else {

        }
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);

    context.drawImage(image, 0, 0);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        enemy.update();

        if (enemy.position.y + enemy.height / 2 < 0) {
            hearts--;
            heartsDisplay.innerText = hearts.toString().padStart(2, '0');
            enemies.splice(i, 1);

            if (hearts <= 0) {
                console.log('Game Over!!! Reload to play again.');

                cancelAnimationFrame(animationId);
                gameOver.style.display = 'flex';
            }
        }
    }

    // Animate explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];

        if (explosion.frames.current === explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
        else {
            explosion.update();
        }
    }

    // Track number of enemies
    if (enemies.length <= 0) {
        enemyCount += 2;
        spawnEnemies(enemyCount);
    }

    for (let i = placementTiles.length - 1; i >= 0; i--) {
        const tile = placementTiles[i];

        tile.update(mouse);
    }

    for (let i = buildings.length - 1; i >= 0; i--) {
        const building = buildings[i];

        building.update();

        building.target = null;
        const validEnemies = enemies.filter(enemy => {
            const distance = Math.hypot(
                (enemy.position.x + enemy.width / 2) - (building.position.x + building.width / 2),
                (enemy.position.y + enemy.height / 2) - (building.position.y + building.height / 2)
            );

            return (distance < enemy.radius + building.range);
        });
        building.target = validEnemies[0];

        for (let j = building.projectiles.length - 1; j >= 0; j--) {
            const projectile = building.projectiles[j];

            projectile.update();

            const distance = Math.hypot(
                projectile.enemy.position.x + projectile.enemy.width / 2 - projectile.position.x,
                projectile.enemy.position.y + projectile.enemy.height / 2 - projectile.position.y
            );

            // Projectile hits an Orc
            if (distance < projectile.enemy.radius + projectile.radius) {
                building.projectiles.splice(j, 1);

                // Decrease enemy health / enemy removal
                if (projectile.enemy.health - 20 >= 0) {
                    projectile.enemy.health -= 20;

                    if (projectile.enemy.health <= 0) {
                        const enemyIndex = enemies.findIndex((enemy) => {
                            return projectile.enemy === enemy;
                        });

                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                            coins += 20;
                            coinsDisplay.innerHTML = coins;
                        }
                    }
                }

                explosions.push(new Sprite({
                    position: {
                        x: projectile.position.x,
                        y: projectile.position.y
                    },
                    imageSrc: './../assets/explosion.png',
                    frames: {
                        max: 4
                    }
                }));
            }
        }
    }
}

canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.isOccupied && coins >= 50) {
        coins -= 50;
        coinsDisplay.innerHTML = coins;
        buildings.push(new Building({
            position: activeTile.position
        }));

        activeTile.isOccupied = true;
        buildings.sort((a, b) => {
            return -(a.position.y - b.position.y);
        });
    }
});

addEventListener('mousemove', (event) => {
    mouse.x = event.clientX - windowWidthOffset;
    mouse.y = event.clientY - windowHeightOffset;

    activeTile = null;
    for (let i = placementTiles.length - 1; i >= 0; i--) {
        const tile = placementTiles[i];

        if (
            mouse.x >= tile.position.x &&
            mouse.x < tile.position.x + tile.width &&
            mouse.y >= tile.position.y &&
            mouse.y < tile.position.y + tile.height
        ) {
            activeTile = tile;
            break;
        }
    }
});
