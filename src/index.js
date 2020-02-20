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
let instructions;
let swinging;
let music;
let coinsAnimationStart = false;
let coinImg;
let background;

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
    this.load.image('thankyou', 'assets/thankyou.jpg');
    // player animations
    this.load.atlas('player', 'assets/useKnight.png', 'assets/player.json');
    this.load.atlas('coinSpin', 'assets/coinSheet.png', 'assets/coinSheet.json');
    this.load.image('bomb', '../assets/fire.png');
    this.load.image('chest', '../assets/chest.png');
    this.load.image('dragon', '../assets/dragons.png');
    //Audio
    this.load.audio('die', '../assets/die.mp3');
    this.load.audio('coin', '../assets/coin.mp3');
    this.load.audio('chest', '../assets/chest.wav');
    this.load.audio('bounce', '../assets/bounce.wav');
    this.load.audio('mainSong', '../assets/mainSong.mp3');
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
    if(currentLevel === 0 || currentLevel === 1 || currentLevel === 2 || currentLevel === 3) {
        background = this.add.sprite(0, 0, 'background');
    } else if(currentLevel === 4) {
        background = this.add.sprite(0, 0, 'thankyou', {repeat: true})
    }

    background.setOrigin(0,0).setScale(3.75);
    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('Tile Layer 1', groundTiles, 0, 0);
    if(currentLevel > 0 && currentLevel < 3) {
        lavaLayer = map.createDynamicLayer('lava', groundTiles, 0, 0);
        lavaLayer.setCollisionByExclusion([-1]);
    }
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(200, 200, 'player');
    player.tint = Math.random() * 0xffffff;
    player.setCollideWorldBounds(true); // don't go out of the map  

    // create dragons that fly 
    dragon = this.add.group({
        key: 'dragon',
        repeat: 3,
        setXY: {
            x: 1300,
            y: 600,
            stepX: 1000,
            stepY: 0
        }
    });

    Phaser.Actions.ScaleXY(dragon.getChildren(), -0.9, -0.9);
    
    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width-35, player.height-8);
    
    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);
    if(currentLevel > 0 && currentLevel < 3) {
        this.physics.add.collider(lavaLayer, player, hitBomb, null, this);
    }

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
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('coinSpin', {prefix: 'spirte', start: 0, end: 5 }),
        frameRate: 16,
        repeat: -1
    });

    Phaser.Actions.Call(dragon.getChildren(), function(enemy){
        enemy.speed = Math.random() * 2 + 1;
    }, this);

    cursors = this.input.keyboard.createCursorKeys();

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 30, 
        setXY: {x: 300, y: 0, stepX: 300}
    });

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    text = this.add.text(20, 20, '0', {
        fontSize: '40px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);
    instructions = this.add.text(800, 570, 'R: Restart Level', {
        fontSize: '20px',
        fill: '#ffffff'
    })
    instructions.setScrollFactor(0);

    //Bombs
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, groundLayer, bombBounce, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //chest
    chests = this.physics.add.group();
    chest = chests.create(6200, 200, 'chest');
    chest.body.setSize(100,100);


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
        score = 0;
        music.stop();
        gameScene.gameOver();
    });
    
    //music
    music = gameScene.sound.add('mainSong', {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0
    })
    music.play();    
}

//coin animation
function coinAnimation(items, key, startFrame) {
    for (var i = 0; i < items.length; i++)
    {
        items[i].anims.play(key, startFrame);
    }

    return items;
};

function hitBomb () {
    player.setTint(0xff0000);
    score = 0;
    player.anims.play('turn');
    gameScene.gameOver();
}

function collectCoin (player, coin){
    coin.disableBody(true, true);
    gameScene.sound.play('coin');

    score += 1;
    text.setText('Score: ' + score);

    if (coins.countActive(true) === 0){
        coins.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true)
        });
    }
}

function winLevel(player, chest) {
    music.stop();
    gameScene.physics.pause();
    gameScene.sound.play('chest');
    gameScene.cameras.main.fade(250);
    currentLevel ++;

    gameScene.time.delayedCall(250, function() {
        gameScene.scene.restart();
    }, [], gameScene);
}

function bombBounce(player, bomb) {
    gameScene.sound.play('bounce');
}

gameScene.update = function(time, delta) {
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
            hitBomb(null, this);
        }
    }
    gameScene.anims.play('spinCoin', coins);
}
gameScene.gameOver = function() {
    music.stop();
    gameScene.sound.play('die');
    this.cameras.main.shake(500);
    this.time.delayedCall(250, function() {
        this.cameras.main.fade(250);
    }, [], this);

    this.time.delayedCall(500, function() {
        this.scene.restart();
    }, [], this);
}

