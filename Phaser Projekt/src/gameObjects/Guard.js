export class Guard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'marilda') {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.body.allowGravity = false;

        this.setScale(1.2);
    }
}