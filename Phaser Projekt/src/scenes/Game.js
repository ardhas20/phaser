import { Player } from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.gameOver = false;
        this.level50Triggered = false;

        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.player = new Player(this, 100, 450);
        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // ⭐
        this.stars = this.physics.add.group();
        this.physics.add.collider(this.stars, this.platforms);

        // 💣
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // SCORE
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '28px',
            fill: '#000'
        });

        // SPAWN CONTROL
        this.spawnDelay = 2500;

        this.spawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnStar,
            callbackScope: this,
            loop: true
        });

        // 🚨 RED WARNING ZONE (hidden)
        this.warningZone = this.add.rectangle(600, 300, 400, 600, 0xff0000)
            .setAlpha(0)
            .setDepth(10);
    }

    update() {
        // ⏎ restart
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.scene.restart();
            }
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.moveLeft();
        }
        else if (this.cursors.right.isDown) {
            this.player.moveRight();
        }
        else {
            this.player.idle();
        }

        if (this.cursors.up.isDown) {
            this.player.jump();
        }
    }

    // ⭐ SPAWN
    spawnStar() {
        if (this.stars.countActive(true) > 3) return;

        const x = Phaser.Math.Between(50, 750);
        const star = this.stars.create(x, 0, 'star');

        star.setBounce(0.6);
        star.setCollideWorldBounds(true);
    }

    // ⭐ COLLECT
    collectStar(player, star) {
        star.destroy();

        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);

        // LEVEL 50 EVENT
        if (this.score >= 50 && !this.level50Triggered) {
            this.level50Triggered = true;
            this.triggerBombRain();
        }

        if (this.score % 5 === 0) {
            this.increaseDifficulty();
        }

        this.spawnBomb();
    }

    // 📈 DIFFICULTY
    increaseDifficulty() {
        if (this.spawnDelay > 1000) {
            this.spawnDelay -= 300;

            this.spawnEvent.remove(false);

            this.spawnEvent = this.time.addEvent({
                delay: this.spawnDelay,
                callback: this.spawnStar,
                callbackScope: this,
                loop: true
            });
        }
    }

    // 💣 NORMAL BOMB
    spawnBomb() {
        const x = Phaser.Math.Between(50, 750);
        const type = Phaser.Math.Between(0, 1);

        const bomb = this.bombs.create(x, 0, 'bomb');
        bomb.setCollideWorldBounds(true);

        if (type === 0) {
            bomb.setBounce(1);
            bomb.setVelocity(
                Phaser.Math.Between(-200, 200),
                Phaser.Math.Between(50, 150)
            );
        } else {
            bomb.setBounce(0.2);
            bomb.setVelocity(0, 100);
        }

        // 💣 AUTO DELETE AFTER 5s
        this.time.delayedCall(5000, () => {
            if (bomb.active) bomb.destroy();
        });
    }

    // 🚨 LEVEL 50 EVENT
    triggerBombRain() {
        // flash warning
        this.tweens.add({
            targets: this.warningZone,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 5
        });

        // after 2 sec → bomb rain
        this.time.delayedCall(2000, () => {

            const rainEvent = this.time.addEvent({
                delay: 200,
                callback: () => {

                    const x = Phaser.Math.Between(400, 800); // right side zone

                    const bomb = this.bombs.create(x, 0, 'bomb');
                    bomb.setBounce(0.5);
                    bomb.setVelocity(0, 200);
                    bomb.setCollideWorldBounds(true);

                    // auto delete
                    this.time.delayedCall(4000, () => {
                        if (bomb.active) bomb.destroy();
                    });

                },
                repeat: 15 // ~3 seconds
            });

        });
    }

    // 💣 GAME OVER
    hitBomb(player, bomb) {
        this.gameOver = true;

        this.physics.pause();

        player.setTint(0xff0000);
        player.anims.play('turn');

        this.add.text(400, 300, 'PRESS ENTER TO RESTART', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}