class Sprite {
    constructor({ position, imageSrc, frames, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.frames = {
            max: frames.max,
            current: 0,
            elapsed: 0,
            hold: 3
        };
        this.offset = offset;
    }

    draw() {
        const cropWidth = this.image.width / this.frames.max;
        const crop = {
            position: {
                x: cropWidth * this.frames.current,
                y: 0
            },
            width: cropWidth,
            height: this.image.height
        };

        context.drawImage(
            this.image,
            crop.position.x,
            crop.position.y,
            crop.width,
            crop.height,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            crop.width,
            crop.height
        );
    }

    update(){
        this.draw();

        if (this.frames.elapsed % this.frames.hold === 0) {
            this.frames.current++;

            if (this.frames.current >= this.frames.max) {
                this.frames.current = 0;
            }
        }

        this.frames.elapsed++;
    }
};

class Orc extends Sprite {
    constructor({
        position = {
            x: 0,
            y: 0
        },
        width = 100,
        height = 100,
        radius = 50
    }) {
        super({
            position: position,
            imageSrc: './../assets/orc.png',
            frames: {
                max: 7
            }
        });
        this.velocity = {
            x: 1,
            y: 0
        };
        this.width = width;
        this.height = height;
        this.waypointIdx = 0;
        this.radius = radius;
        this.health = 100;
        this.speed = 3;
    }

    draw() {
        super.draw();
        // context.fillStyle = 'red';
        // // context.fillRect(this.position.x, this.position.y, this.width, this.height);

        // context.beginPath();
        // context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, this.radius, 0, Math.PI * 2);
        // context.fill();
        // context.closePath();

        // Health bar
        context.fillStyle = 'red';
        context.fillRect(this.position.x, this.position.y - 15, this.width, 10);
        context.fillStyle = 'green';
        context.fillRect(this.position.x, this.position.y - 15, (this.health / 100) * this.width, 10);
    }

    update() {
        this.draw();
        super.update();

        const waypoint = pathPoints[this.waypointIdx];
        const xDistance = waypoint.x - (this.position.x + this.width / 2);
        const yDistance = waypoint.y - (this.position.y + this.height / 2);
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (
            Math.abs(Math.round(this.position.x + (this.width / 2)) - Math.round(waypoint.x)) < Math.abs(this.velocity.x) &&
            Math.abs(Math.round(this.position.y + (this.height / 2)) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) &&
            this.waypointIdx < pathPoints.length - 1
        ) {
            this.waypointIdx++;
        }
    }
};

class PlacementTile {
    constructor({
        position,
        width = 64,
        height = 64
    }) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = 'rgba(255, 255, 255, 0.08)';
        this.isOccupied = false;
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(mouse) {
        this.draw();

        if (
            mouse.x >= this.position.x &&
            mouse.x < this.position.x + this.width &&
            mouse.y >= this.position.y &&
            mouse.y < this.position.y + this.height
        ) {
            // console.log('collusion');
            this.color = 'green';
        }
        else {
            this.color = 'rgba(255, 255, 255, 0.08)';
        }
    }
};

class Building extends Sprite {
    constructor({
        position,
        width = tileSize * 2,
        height = tileSize,
    }) {
        super({
            position: position,
            imageSrc: './../assets/tower.png',
            frames: {
                max: 19
            },
            offset: {
                x: 0,
                y: -80
            }
        });
        this.width = width;
        this.height = height;
        this.projectiles = [];
        this.range = 250;
        this.target = null;
    }

    draw() {
        super.draw();
        // context.fillStyle = 'blue';
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);

        // context.beginPath()
        // context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, this.range, 0, Math.PI * 2);
        // context.fillStyle = 'rgba(0, 0, 255, 0.2)';
        // context.fill();
        // context.closePath();
    }

    update() {
        this.draw();

        if(
            this.target || 
            (
                !this.target && 
                this.frames.current !== 0
            )
        ){
            super.update();
        }

        if(
            this.target && 
            this.frames.current === 6 &&
            this.frames.elapsed % this.frames.hold === 0
        ){
            this.shoot();
        }
    }

    shoot(){
        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.position.x + this.width / 2 - 20,
                    y: this.position.y + this.height / 2 - 110
                },
                enemy: this.target
            })
        );
    }
};

class Projectile extends Sprite {
    constructor({
        position,
        radius = 10,
        color = 'yellow',
        enemy
    }) {
        super({
            position: position,
            imageSrc: './../assets/projectile.png',
            frames: {
                max: 1
            }
        });
        // this.position = position;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.radius = radius;
        this.color = color;
        this.enemy = enemy;
        this.speed = 5;
        // this.image = new Image();
        // this.image.src = './../assets/projectile.png';
    }

    // draw() {
    //     context.drawImage(this.image, this.position.x, this.position.y);

    //     // context.beginPath();
    //     // context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    //     // context.fillStyle = this.color;
    //     // context.fill();
    //     // context.closePath();
    // }

    update() {
        this.draw();
        super.update();

        const angle = Math.atan2(
            this.enemy.position.y + this.enemy.height / 2 - this.position.y,
            this.enemy.position.x + this.enemy.width / 2 - this.position.x
        );

        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
};