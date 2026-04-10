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
        // 🌍 BASIC
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('laptop', 'assets/laptop.png');
this.load.image('pultteiler', 'assets/pultteiler.png');
this.load.image('bag', 'assets/bag.png');

        // 👤 PLAYER
        this.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        // 😈 ENEMY STUDENTS
        this.load.image('ergit', 'assets/ergit.png');
        this.load.image('eriseld', 'assets/eriseld.png');
        this.load.image('gani', 'assets/gani.png');
        this.load.image('eni', 'assets/eni.png');
        this.load.image('ajsi', 'assets/ajsi.png');

        this.load.image('gesart', 'assets/gesart.png');
        this.load.image('lea', 'assets/lea.png');
        this.load.image('tea', 'assets/tea.png');
        this.load.image('hera', 'assets/hera.png');
        this.load.image('sidrit', 'assets/sidrit.png');

        this.load.image('ardita', 'assets/ardita.png');
        this.load.image('ermi', 'assets/ermi.png');
        this.load.image('erisa', 'assets/erisa.png');
        this.load.image('glejdi', 'assets/glejdi.png');
        this.load.image('nedit', 'assets/nedit.png');

        this.load.image('marilda', 'assets/marilda.png');
this.load.image('sidita', 'assets/sidita.png');
this.load.image('karl', 'assets/karl.png');
    }

    create() {
        this.scene.start('Game');
    }
}