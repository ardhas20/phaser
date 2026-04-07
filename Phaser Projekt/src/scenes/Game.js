export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }

 create ()
{
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');
}

    update(time) {

          

       
    }

}
