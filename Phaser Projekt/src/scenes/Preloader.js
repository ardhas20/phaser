export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.image(512, 384, 'background');

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png'); // IMPORTANT NAME
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');

        this.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        });
    }

    create() {
        this.scene.start('Game');
    }
}