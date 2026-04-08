import { Player } from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.gameOver = false;

        // 🌍 BIG WORLD
        this.physics.world.setBounds(0, 0, 2000, 600);

        // 🌄 BACKGROUND (doesn't move)
        this.add.tileSprite(0, 0, 2000, 600, 'sky')
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // 🧱 PLATFORMS
        this.platforms = this.physics.add.staticGroup();

        // ground (full level)
        for (let x = 0; x < 2000; x += 400) {
            this.platforms.create(x, 568, 'ground')
                .setScale(2)
                .refreshBody();
        }

        // floating platforms (Mario style)
        this.platforms.create(400, 400, 'ground');
        this.platforms.create(800, 300, 'ground');
        this.platforms.create(1200, 350, 'ground');
        this.platforms.create(1600, 250, 'ground');

        // 👤 PLAYER
        this.player = new Player(this, 100, 450);
        this.physics.add.collider(this.player, this.platforms);

        // 🎥 CAMERA FOLLOW (Mario style)
        this.cameras.main.setBounds(0, 0, 2000, 600);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(100, 50);

        // 🎮 INPUT
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // ⭐ STARS
        this.stars = this.physics.add.group();
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // 💣 BOMBS
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // 🏁 GOAL (END)
        this.goal = this.physics.add.staticImage(1900, 500, 'star')
            .setScale(1.5)
            .refreshBody();

        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // 🧾 SCORE UI (fixed to camera)
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '28px',
            fill: '#000'
        }).setScrollFactor(0);

        // ⭐ STAR SPAWN LOOP
        this.spawnDelay = 2500;
        this.spawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnStar,
            callbackScope: this,
            loop: true
        });

        this.bombSpawningEnabled = true;

        this.scheduleStarRush();
    }

    update() {
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.scene.restart();
            }
            return;
        }

        const speed = 200;

        if (this.cursors.left.isDown && !this.cursors.right.isDown) {
            this.player.setVelocityX(
                Phaser.Math.Linear(this.player.body.velocity.x, -speed, 0.2)
            );
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown && !this.cursors.left.isDown) {
            this.player.setVelocityX(
                Phaser.Math.Linear(this.player.body.velocity.x, speed, 0.2)
            );
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(
                Phaser.Math.Linear(this.player.body.velocity.x, 0, 0.2)
            );

            if (Math.abs(this.player.body.velocity.x) < 5) {
                this.player.anims.play('turn');
            }
        }

        if (this.cursors.up.isDown) {
            this.player.jump();
        }
    }

    // ⭐ STAR SPAWN (POP EFFECT)
    spawnStar() {
        if (this.stars.countActive(true) > 5) return;

        const x = Phaser.Math.Between(50, 1950);
        const y = Phaser.Math.Between(50, 500);

        const star = this.stars.create(x, y, 'star');

        star.setScale(0);
        star.setBounce(0.4);
        star.setCollideWorldBounds(true);

        this.tweens.add({
            targets: star,
            scale: 1,
            duration: 300,
            ease: 'Back.Out'
        });
    }

    collectStar(player, star) {
        star.destroy();

        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);

        if (this.bombSpawningEnabled) {
            this.spawnBomb();
        }
    }

    spawnBomb() {
        if (this.bombs.countActive(true) > 5) return;

        const x = Phaser.Math.Between(50, 1950);
        const bomb = this.bombs.create(x, 0, 'bomb');

        bomb.setBounce(1);
        bomb.setVelocity(
            Phaser.Math.Between(-150, 150),
            Phaser.Math.Between(50, 120)
        );
        bomb.setCollideWorldBounds(true);

        this.fadeAndDestroy(bomb, 5000);
    }

    fadeAndDestroy(obj, delay) {
        this.time.delayedCall(delay - 1000, () => {
            this.tweens.add({
                targets: obj,
                alpha: 0,
                duration: 1000,
                onComplete: () => obj.destroy()
            });
        });
    }

    // ⭐ STAR RUSH EVENT
    scheduleStarRush() {
        const delay = Phaser.Math.Between(15000, 25000);

        this.time.delayedCall(delay, () => {
            this.startStarRush();
            this.scheduleStarRush();
        });
    }

    startStarRush() {
        this.bombSpawningEnabled = false;

        const text = this.add.text(400, 300, 'STAR RUSH', {
            fontSize: '48px',
            fill: '#ffff00'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.addEvent({
            delay: 200,
            callback: () => {
                const x = Phaser.Math.Between(50, 1950);
                const y = Phaser.Math.Between(50, 300);

                const star = this.stars.create(x, y, 'star');
                star.setScale(0);

                this.tweens.add({
                    targets: star,
                    scale: 1,
                    duration: 200
                });
            },
            repeat: 25
        });

        this.time.delayedCall(5000, () => {
            text.destroy();
            this.stars.clear(true, true);
            this.bombSpawningEnabled = true;
        });
    }

    // 💀 GAME OVER
    hitBomb(player, bomb) {
        this.gameOver = true;

        this.physics.pause();

        player.setTint(0xff0000);
        player.anims.play('turn');

        this.add.text(400, 300, 'GAME OVER\nPRESS ENTER', {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
    }

    // 🏁 WIN
    reachGoal(player, goal) {
        this.gameOver = true;

        this.physics.pause();

        this.add.text(400, 300, 'YOU WIN 🎉\nPRESS ENTER', {
            fontSize: '32px',
            fill: '#0f0',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
    }
}