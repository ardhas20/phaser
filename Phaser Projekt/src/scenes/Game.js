import { Player } from '../gameObjects/Player.js';
import { Guard } from '../gameObjects/Guard.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.gameOver = false;
        this.hazardTimer = null;

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

        // 🎨 GLOBAL TEXT STYLE (ADD THIS ONCE)
this.textStyle = {
    fontSize: '32px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6,
    align: 'center'
};

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
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
}).setScrollFactor(0);

        // ⭐ homeworks
        this.homeworks = this.physics.add.group();
        this.physics.add.collider(this.homeworks, this.platforms);
        this.physics.add.overlap(this.player, this.homeworks, this.collectHomework, null, this);

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
// 🧑 KARL (WIN TRIGGER)
this.karl = new Guard(this, 2700, 450, 'karl');
this.karl.setVisible(false);
this.karl.body.enable = false;

this.physics.add.overlap(this.player, this.karl, () => {
    this.showMessage("Congratulations Paul.\nYou gathered all the homework!");
    this.endGame(true);
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

    }

    // =========================
    // ⭐ homeworks
    // =========================
    spawnHomework(positions) {
        positions.forEach(pos => {
            const homework = this.homeworks.create(pos.x, pos.y, 'homework');
            homework.setBounce(0.3);
        });
    }

    collectHomework(player, homework) {
        homework.destroy();
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
    // Phase 1 → go to Phase 2
    if (this.phase === 1) {
        if (this.homework >= this.requiredHomework) {
            this.nextPhase();
        } else {
            this.showMessage("NOT ENOUGH HOMEWORK");
        }
    }

    // Phase 2 → go to Phase 3 (THIS IS THE IMPORTANT PART)
    else if (this.phase === 2) {
        if (this.homework >= this.requiredHomework) {
            this.nextPhase();
        } else {
            this.showMessage("COLLECT ALL HOMEWORK");
        }
    }
}

nextPhase() {
    this.phase++;
    this.clearLevel();

    // PHASE 2
    if (this.phase === 2) {
        this.requiredHomework = 5;
        this.homework = 0;

        this.guard.setTexture('sidita');
        this.guard.setPosition(1850, 500);

        this.startPhase2();
        this.spawnFallingHazards();

        this.showMessage("PART 2");
    }

    // PHASE 3 (KARL)
    else if (this.phase === 3) {
        this.guard.setVisible(false);
        this.guard.body.enable = false;

        if (this.hazardTimer) {
            this.hazardTimer.remove();
            this.hazardTimer = null;
        }

        // ✅ SHOW KARL LIKE A NORMAL GUARD
        this.karl.setVisible(true);
        this.karl.body.enable = true;
        this.karl.setPosition(2700, 500);

        this.showMessage("Go talk to Karl");
    }

    this.updateUI();
}

    clearLevel() {
        this.homeworks.clear(true, true);
        this.enemies.clear(true, true);
    }

    // =========================
    // 🧩 PHASES
    // =========================
    startPhase1() {
        this.spawnHomework([
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
    this.spawnHomework([
        { x: 1600, y: 200 },
        { x: 1750, y: 220 },
        { x: 1900, y: 200 },
        { x: 2050, y: 220 },
        { x: 2200, y: 200 }
    ]);

}


    // =========================
    // UI / END
    // =========================
    updateUI() {
        this.uiText.setText(
            `Homework: ${this.homework}/${this.requiredHomework} | Lives: ${this.lives} | Phase: ${this.phase}`
        );
    }
    showMessage(text) {
    const msg = this.add.text(400, 200, text, this.textStyle)
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.time.delayedCall(1500, () => msg.destroy());
}

endGame(win) {
    this.gameOver = true;

    // stop player input physics
    this.physics.pause();

    const text = win
        ? 'CONGRATS YOU WIN 🎉'
        : 'YOU LOST ❌';

    // IMPORTANT: create text AFTER pause safely
    this.time.delayedCall(10, () => {
        this.add.text(400, 300, text + "\nPress SPACE to restart", this.textStyle)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(999);
    });
}
spawnFallingHazards() {
    const textures = ['laptop', 'pultteiler', 'bag'];

    this.hazardTimer = this.time.addEvent({
        delay: 1800, // slower spawn
        loop: true,
        callback: () => {

            // only run in phase 2
            if (this.phase !== 2) return;

            // ONLY SIDITA AREA
            const x = Phaser.Math.Between(1750, 1950);
            const texture = Phaser.Utils.Array.GetRandom(textures);
            const obj = this.fallingHazards.create(x, 0, texture);

            obj.setScale(1.2); // bigger
            obj.setAngularVelocity(150); // spin

            obj.setVelocityY(120); // slower fall

            // 💀 remove after 2 seconds
            this.time.delayedCall(2000, () => {
                if (obj) obj.destroy();
            });
        }
    });
}
}