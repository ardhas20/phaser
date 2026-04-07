import {Player} from '../gameObjects/Player.js'

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

    this.player = new Player(this,100,450);
    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();
}

    update() {
        if(this.cursors.left.isDown){
            this.player.moveLeft();
        }
        else if(this.cursors.right.isDown){
            this.player.moveRight();
        }

        else{
            this.player.idle();
        
        }

          if(this.cursors.up.isDown){
            this.player.jump();
        }
          

       
    }

}
