export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0);

        this.speed = 80;
        this.setVelocityX(this.speed);
    }

    update() {
        // turn at walls
        if (this.body.blocked.left) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
        }
        else if (this.body.blocked.right) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
        }
    }
}