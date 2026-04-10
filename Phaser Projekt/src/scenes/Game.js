import { Player } from '../gameObjects/Player.js';
import { Guard } from '../gameObjects/Guard.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.gameOver = false;

        // 🌍 WORLD
        this.physics.world.setBounds(0, 0, 3000, 600);

        this.add.tileSprite(0, 0, 3000, 600, 'sky')
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // 🧱 PLATFORMS
        this.platforms = this.physics.add.staticGroup();

        for (let x = 0; x < 3000; x += 400) {
            this.platforms.create(x, 568, 'ground')
                .setScale(2)
                .refreshBody();
        }

        this.platforms.create(400, 400, 'ground');
        this.platforms.create(800, 300, 'ground');
        this.platforms.create(1200, 350, 'ground');
        this.platforms.create(1600, 250, 'ground');
        this.platforms.create(2000, 350, 'ground');
        this.platforms.create(2400, 300, 'ground');

        // 👤 PLAYER
        this.player = new Player(this, 100, 450);
        this.physics.add.collider(this.player, this.platforms);

        // 🎥 CAMERA
        this.cameras.main.setBounds(0, 0, 3000, 600);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // 🎮 INPUT
        this.cursors = this.input.keyboard.createCursorKeys();

        // ❤️ STATS
        this.lives = 3;
        this.homework = 0;

        // 🔢 PHASE SYSTEM
        this.phase = 1;
        this.requiredHomework = 5;

        // 🧾 UI
        this.uiText = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#000'
        }).setScrollFactor(0);

        // ⭐ STARS
        this.stars = this.physics.add.group();
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // 😈 ENEMIES
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);
        this.fallingHazards = this.physics.add.group();
        this.physics.add.collider(this.fallingHazards, this.platforms);

this.physics.add.overlap(this.player, this.fallingHazards, (player, hazard) => {
    hazard.destroy();
    this.damagePlayer();
});

        // 🧍 GUARD
this.guard = new Guard(this, 900, 500, 'marilda');
        this.physics.add.overlap(this.player, this.guard, this.checkGuard, null, this);

        // 🔄 RESTART
        this.input.keyboard.on('keydown-SPACE', () => this.scene.restart());
        this.input.keyboard.on('keydown-ENTER', () => this.scene.restart());

        this.startPhase1();
        this.updateUI();

        // 💣 BOMB SYSTEM
this.bombs = this.physics.add.group();

this.lastBombTime = 0;
this.bombCooldown = 500; // 0.5 sec

this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

// collision: bombs vs enemies (students)
this.physics.add.overlap(this.bombs, this.enemies, (bomb, enemy) => {
    enemy.setVelocityY(300);
    enemy.setAlpha(0);
    enemy.destroy();

    bomb.destroy();
});
    }

    update() {
        if (this.gameOver) return;

        const speed = 200;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown) {
            this.player.jump();
        }

        // 💣 SHOOT BOMB
if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
    const now = this.time.now;

    if (now - this.lastBombTime > this.bombCooldown) {
        this.shootBomb();
        this.lastBombTime = now;
    }
}
    }

    // =========================
    // ⭐ STARS
    // =========================
    spawnStars(positions) {
        positions.forEach(pos => {
            const star = this.stars.create(pos.x, pos.y, 'star');
            star.setBounce(0.3);
        });
    }

    collectStar(player, star) {
        star.destroy();
        this.homework++;
        this.updateUI();
    }

    // =========================
    // 😈 ENEMIES (FIXED)
    // =========================
    spawnEnemy(x, y, texture) {
        const enemy = this.enemies.create(x, y, texture);

        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1, 0);
        enemy.setVelocityX(80); // fixed speed

        return enemy;
    }

    // ❌ NO STOMP LOGIC
    handleEnemyCollision(player, enemy) {
        this.damagePlayer();
    }

    damagePlayer() {
        this.lives--;

        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());

        this.updateUI();

        if (this.lives <= 0) {
            this.endGame(false);
        }
    }

    // =========================
    // 🧍 GUARD / PHASE
    // =========================
    checkGuard() {
    if (this.homework >= this.requiredHomework) {
        this.nextPhase();
    } else {
        this.showMessage("NOT ENOUGH HOMEWORK");
    }

    }

    nextPhase() {
    this.phase++;
    this.clearLevel();

    if (this.phase === 2) {
        this.requiredHomework = 10;

        this.guard.setTexture('sidita');   // ✅ PHASE 2 GUARD
        this.guard.setPosition(1850, 500);

        this.startPhase2();
        this.showMessage("PART 2");
    }
    else if (this.phase === 3) {
        this.requiredHomework = 20;

        this.guard.setTexture('karl');     // ✅ PHASE 3 GUARD
        this.guard.setPosition(2700, 500);

        this.startBoss();
        this.showMessage("BOSS FIGHT");
    }
    else {
        this.endGame(true);
    }

    this.updateUI();
}

    clearLevel() {
        this.stars.clear(true, true);
        this.enemies.clear(true, true);
    }

    // =========================
    // 🧩 PHASES
    // =========================
    startPhase1() {
        this.spawnStars([
            { x: 300, y: 200 },
            { x: 600, y: 200 },
            { x: 900, y: 200 },
            { x: 1200, y: 200 },
            { x: 1500, y: 200 }
        ]);

        const textures = [
            'ergit','eriseld','gani','eni','ajsi',
            'gesart','lea','tea','hera','sidrit',
            'ardita','ermi','erisa','glejdi','nedit'
        ];

        // ✅ ALL 15 spawn (no random)
        textures.forEach((texture, i) => {
            this.spawnEnemy(400 + i * 180, 0, texture);
        });
    }

    startPhase2() {
    // 📍 spread out near Sidita area
    this.spawnStars([
        { x: 1600, y: 200 },
        { x: 1750, y: 220 },
        { x: 1900, y: 200 },
        { x: 2050, y: 220 },
        { x: 2200, y: 200 }
    ]);

    this.spawnFallingHazards();
}


    startBoss() {
        this.showMessage("BOSS FIGHT");
    }

    // =========================
    // UI / END
    // =========================
    updateUI() {
        this.uiText.setText(
            `Stars: ${this.homework}/${this.requiredHomework} | Lives: ${this.lives} | Phase: ${this.phase}`
        );
    }

    showMessage(text) {
        const msg = this.add.text(400, 200, text, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(1500, () => msg.destroy());
    }

    endGame(win) {
        this.gameOver = true;
        this.physics.pause();

        const text = win
            ? 'CONGRATS YOU WIN 🎉'
            : 'YOU LOST ❌';

        this.add.text(400, 300, text + "\nPress SPACE to restart", {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
    }

    shootBomb() {
    const bomb = this.bombs.create(this.player.x, this.player.y, 'bomb');

    bomb.setScale(0.5);

    bomb.setVelocityX(this.player.flipX ? -300 : 300);
    bomb.setVelocityY(-150);

    bomb.setBounce(0.3);
    bomb.setCollideWorldBounds(true);

    this.time.delayedCall(500, () => {
        if (bomb) bomb.destroy();
    });
}
spawnFallingHazards() {
    const textures = ['laptop', 'pultteiler', 'bag'];

    this.time.addEvent({
        delay: 1200, // ⬅️ slower spawn (not too many)
        loop: true,
        callback: () => {
            // 📍 SIDITA AREA ONLY
            const x = Phaser.Math.Between(1700, 2000);

            const texture = Phaser.Utils.Array.GetRandom(textures);

            const obj = this.fallingHazards.create(x, 0, texture);

            obj.setScale(1); // bigger

            obj.setVelocityY(80); // slower fall

            obj.setAngularVelocity(120); // spin

            // ⏱️ disappear after 2 seconds
            this.time.delayedCall(2000, () => {
                if (obj) obj.destroy();
            });
        }
    });
}
}