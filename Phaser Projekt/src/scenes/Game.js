import { Player } from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.gameOver = false;

        // 🌍 WORLD
        this.physics.world.setBounds(0, 0, 2000, 600);

        this.add.tileSprite(0, 0, 2000, 600, 'sky')
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // 🧱 PLATFORMS
        this.platforms = this.physics.add.staticGroup();

        for (let x = 0; x < 2000; x += 400) {
            this.platforms.create(x, 568, 'ground')
                .setScale(2)
                .refreshBody();
        }

        this.platforms.create(400, 400, 'ground');
        this.platforms.create(800, 300, 'ground');
        this.platforms.create(1200, 350, 'ground');
        this.platforms.create(1600, 250, 'ground');

        // 👤 PLAYER = TEACHER
        this.player = new Player(this, 100, 450);
        this.physics.add.collider(this.player, this.platforms);

        // 🎥 CAMERA
        this.cameras.main.setBounds(0, 0, 2000, 600);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // 🎮 INPUT
        this.cursors = this.input.keyboard.createCursorKeys();

        // ❤️ LIVES
        this.lives = 3;

        // 📚 HOMEWORK
        this.homework = 0;
        this.requiredHomework = 10;

        // ⏰ TIME
        this.timeLeft = 60;

        // 🧾 UI
        this.uiText = this.add.text(16, 16,
            `Homework: 0/${this.requiredHomework} | Lives: 3 | Time: 60`,
            { fontSize: '20px', fill: '#000' }
        ).setScrollFactor(0);

        // ⭐ GOOD STUDENTS
        this.goodStudents = this.physics.add.group();
        this.physics.add.collider(this.goodStudents, this.platforms);
        this.physics.add.overlap(this.player, this.goodStudents, this.collectHomework, null, this);

        // 😈 BAD STUDENTS
        this.badStudents = this.physics.add.group();
        this.physics.add.collider(this.badStudents, this.platforms);
        this.physics.add.collider(this.player, this.badStudents, this.hitBadStudent, null, this);

        // 🏁 HEADMASTER
        this.goal = this.physics.add.staticImage(1900, 500, 'star');
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // SPAWN LOOPS
        this.time.addEvent({ delay: 2000, callback: this.spawnGoodStudent, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 3000, callback: this.spawnBadStudent, callbackScope: this, loop: true });

        // ⏰ TIMER LOOP
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.updateUI();

                if (this.timeLeft <= 0) {
                    this.endGame(false);
                }
            },
            loop: true
        });
    }

    update() {
        if (this.gameOver) return;

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

    // ⭐ GOOD STUDENT (gives homework)
    spawnGoodStudent() {
        const x = Phaser.Math.Between(100, 1900);
        const student = this.goodStudents.create(x, 0, 'star');

        student.setBounce(0.3);
        student.setCollideWorldBounds(true);
    }

    collectHomework(player, student) {
        student.destroy();
        this.homework++;

        this.updateUI();
    }

    // 😈 BAD STUDENT (damage)
    spawnBadStudent() {
        const x = Phaser.Math.Between(100, 1900);
        const bad = this.badStudents.create(x, 0, 'bomb');

        bad.setBounce(1);
        bad.setVelocity(Phaser.Math.Between(-100, 100), 50);
        bad.setCollideWorldBounds(true);
    }

    hitBadStudent(player, bad) {
        bad.destroy();

        this.lives--;

        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());

        this.updateUI();

        if (this.lives <= 0) {
            this.endGame(false);
        }
    }

    // 🧾 UI UPDATE
    updateUI() {
        this.uiText.setText(
            `Homework: ${this.homework}/${this.requiredHomework} | Lives: ${this.lives} | Time: ${this.timeLeft}`
        );
    }

    // 🏁 FINISH
    reachGoal() {
        if (this.homework >= this.requiredHomework) {
            this.endGame(true);
        } else {
            this.endGame(false);
        }
    }

    // 🎬 END GAME
    endGame(win) {
        this.gameOver = true;
        this.physics.pause();

        let text = win
            ? 'YOU WIN 🎉\nHomework delivered!'
            : 'YOU LOST ❌';

        this.add.text(400, 300, text, {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
    }
}