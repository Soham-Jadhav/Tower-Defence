const tileSize = 64;

function spawnEnemies(spawnCount) {
    for (let i = 0; i < spawnCount; i++) {
        const xOffset = i * 150 + 150;

        enemies.push(new Orc({
            position: {
                x: pathPoints[0].x - xOffset,
                y: pathPoints[0].y
            },
            width: 100,
            height: 100
        }));
    }
}