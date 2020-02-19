import Phaser from "phaser";
let gameScene = new Phaser.Scene('Game');

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 1500},
            debug: false
        }
    },
    scene: [gameScene]
};

var game = new Phaser.Game(config);

var dragon;
var dragon2;
var getCoin;
var map;
var coins;
var player;
var cursors;
var groundLayer;
let lavaLayer;
var text;
let winText;
var score = 0;
let bombs;
let bombDropped = false;
let timer = 0;
let chest;
let chests;
let particles;
let emitter;
let fire;
let isPaused = false;
let keyObjP;
let keyObjR;
let pauseOnce = false;
let currentLevel = 0;
let currentMap;

setInterval(function() {
    timer++;
}, 1000)

gameScene.preload = function() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map0', 'assets/map0.json');
    this.load.tilemapTiledJSON('map1', 'assets/map1.json');
    this.load.tilemapTiledJSON('map2', 'assets/map2.json');
    this.load.tilemapTiledJSON('map3', 'assets/map3.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'assets/newTiles.png', {frameWidth: 64, frameHeight: 64});

    this.load.image('coin', 'assets/coinGold.png');

    this.load.image('background', 'assets/tonys_assets/castleBackground.jpg')
    // player animations
    this.load.atlas('player', 'assets/useKnight.png', 'assets/player.json');
    this.load.image('bomb', '../assets/fire.png');
    this.load.image('chest', '../assets/chest.png');
    this.load.image('dragon', '../assets/dragons.png');
}

gameScene.create = function() {
    // load the map 
    if(currentLevel == 0) {
        map = this.make.tilemap({key: 'map0'});
    } else if(currentLevel == 1) {
        map = this.make.tilemap({key: 'map1'});
    } else if(currentLevel == 2) {
        map = this.make.tilemap({key: 'map2'});
    } else if(currentLevel == 3) {
        map = this.make.tilemap({key: 'map3'});
    }
    // add a background image //
    let background = this.add.sprite(0, 0, 'background');

    background.setOrigin(0,0).setScale(3.75);
    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('Tile Layer 1', groundTiles, 0, 0);
    // lavaLayer = map.createStaticLayer('lava', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    // lavaLayer.setCollisionByExclusion([-1]);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(200, 200, 'player');
    player.tint = Math.random() * 0xffffff;
    player.setCollideWorldBounds(true); // don't go out of the map  

    // dragons = this.physics.add.group()
    
    // //create the dragon #1 

    // dragon = dragons.create(1100, 250, 'dragon');
    // dragon.setScale(0.40,0.40);
    // dragon.setCollideWorldBounds(true);
    // // dragon.body.setSize(dragon.width-20, dragon.height-15);
    // this.physics.add.collider(groundLayer, dragon);

    // //dragon #2
    // dragon2 = dragons.create(3000,250, 'dragon');
    // dragon2.setScale(0.40, 0.40);
    // dragon2.setCollideWorldBounds(true);
    // this.physics.add.collider(groundLayer, dragon2);

    // create dragons that fly 
    dragon = this.add.group({
        key: 'dragon',
        repeat: 4,
        setXY: {
            x: 1200,
            y: 400,
            stepX: 300,
            stepY: 160
        }
    });

    Phaser.Actions.ScaleXY(dragon.getChildren(), -0.8, -0.8);
    

    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width-35, player.height-8);
    
    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);
    // this.physics.add.collider(lavaLayer, player, hitBomb);

       // player walk animation
       this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 3, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });
    // swings sword when down arrow is held
    this.anims.create({
        key: 'swing',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_swing', start: 1, end: 5, zeroPad: 1}),
        frameRate: 10,
    });
    
    //jump animation
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNames('player',  {prefix: 'p1_jump', start: 1, end: 4, zeroPad: 0}),
        frameRate: 10,
        repeat: -1
    
    });

    Phaser.Actions.Call(dragon.getChildren(), function(enemy){
        enemy.speed = Math.random() * 2 + 1;
    }, this);

    cursors = this.input.keyboard.createCursorKeys();

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 150, 
        setXY: {x: 151, y: 0, stepX: 125}
    });

    // coins.enableBody = true();
    // getCoin = coins.create(Math.floor((Math.random() * 100 + 1)* 7 ), 0, 'coin');


    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);

    // scoreText = this.add.text(1, 575, 'score: 0', { fontSize: '16px', fill: '#000'});

    //Bombs
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, groundLayer);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //chest
    chests = this.physics.add.group();
    chest = chests.create(6200, 600, 'chest');
    chest.body.setSize(100,100);

    //dragon 
    // dragons = this.physics.add.group();
    // dragon = dragons.create(20,550, 'dragon');
    // dragon.body.setSize(100,100);

    this.physics.add.collider(player, chest, winLevel, null, this);
    this.physics.add.collider(chest, groundLayer);

    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.collider(groundLayer, coins);
    //Particles
    particles = this.add.particles('bomb');

    emitter = particles.createEmitter({
        // frame: 'yellow',
        radial: false,
        x: 0,
        y: 0,
        lifespan: 1000,
        speedX: { min: 200, max: 400 },
        quantity: 1,
        gravityY: -50,
        scale: { start: 0.6, end: 0, ease: 'Power3' },
        blendMode: 'ADD'
    });

    //Pause functionality
    keyObjP = gameScene.input.keyboard.addKey('P');
    keyObjR = gameScene.input.keyboard.addKey('R');
    keyObjP.on('down', function(event) {
        console.log("pause");
        gameScene.scene.pause();
        isPaused = true;
    });
    keyObjR.on('down', function(event) {
        console.log("unpause");
        gameScene.scene.resume();
        isPaused = false;
    });
}

function hitBomb (player, bomb) {
    // this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn')
    gameScene.gameOver();
}

function collectCoin (player, coin){
    coin.disableBody(true, true);

    score += 1;
    text.setText('Score: ' + score);

    if (coins.countActive(true) === 0){
        coins.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true)
        });
    }
}

function winLevel(player, chest) {
    // player.setTint(0xffd700);
    // winText = this.add.text(400, 300, 'YOU WON!!!!', {
    //     fontSize: '50px',
    //     fill: '#ff0000',
    // });
    // winText.setScrollFactor(0);
    currentLevel ++;
    gameScene.scene.restart();
}

gameScene.update = function(time, delta) {
    // if (timer % 2 === 0 && timer % 1 === 0 && bombDropped == false){
    //     player.tint = Math.random() * 0xffffff;
    // }
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-500);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }  else if (cursors.down.isDown)
    {
        player.anims.play('swing', true);
    } else if (cursors.right.isDown)
    {
        player.body.setVelocityX(500);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    } 
    // jump 
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-820); 
    }
    if(timer % 5 === 0 && bombDropped === false) {
        var x = (Math.random() * player.x + 400) + player.x - 400;
        var y = player.y-300;

        var bomb = bombs.create(x, y, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);  
        bombDropped = true;
        emitter.startFollow(bomb);

    }
    if(bombDropped === true && timer % 6 === 0 && timer % 5 !== 0) {
        bombDropped = false;
    }
    let dragon2 = dragon.getChildren();
    let numDragon = dragon2.length;


    for(let i = 0; i < numDragon; i++){

        dragon2[i].y += dragon2[i].speed;

        if(dragon2[i].y >= 700 && dragon2[i].speed > 0){
            dragon2[i].speed *= -1;
        } else if (dragon2[i].y <= 200 && dragon2[i].speed < 0){
            dragon2[i].speed *= -1;
        }
        if(Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), dragon2[i].getBounds())){
            this.gameOver();
        }
    }
}
gameScene.gameOver = function() {
    this.cameras.main.shake(500);
    this.time.delayedCall(250, function() {
        this.cameras.main.fade(250);
    }, [], this);

    this.time.delayedCall(500, function() {
        this.scene.restart();
    }, [], this);
}

// export function resetGame () {
//     reset = function() {
//         game.scene.restart();
//     }
// }

