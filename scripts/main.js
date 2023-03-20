var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var box;
var bombs;
var platforms;
var cursors;
var score = 0;

var scoreText;
var starCollected = 0;
var starScoreText;
var colors = [0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x4b0082, 0xee82ee];
var currentColorIndex = 0;
var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg', 'assets/bg.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('box', 'assets/spawn.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{

    this.add.image(400, 300, 'bg');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    platforms.setTint(0xff4500);
    
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

  
    cursors = this.input.keyboard.createCursorKeys();

    box = this.physics.add.group({
        key: 'box',
        repeat: 0,
        setXY: { x: Math.random() * game.config.width - 10, y: Math.random() * game.config.height - 70, stepX: 40 }
    });
    box.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

 
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    starScoreText = this.add.text(16, 40, 'Stars Collected: 0', { fontSize: '32px', fill: '#000' });

    this.lostTextBox = this.add.text(400, 250, 'You lost\nScore: 0', {
        fontSize: '32px',
        fill: '#00CED1',
        align: 'center'
        });
    this.lostTextBox.setOrigin(0.5);
    this.lostTextBox.visible = false;      
    

 
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(box, platforms);
    this.physics.add.collider(bombs, platforms);

 
    this.physics.add.overlap(player, box, collectStar, playerColors, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

   
    score += 10;
    starCollected += 1;
    scoreText.setText('Score: ' + score);
    starScoreText.setText('Stars Collected: ' + starCollected);

    if (starCollected % 5 === 0) {
       
        player.setScale(player.scaleX + 0.1, player.scaleY + 0.1);
    }

    if (box.countActive(true) === 0)
    {

        box.children.iterate(function (child) {
            child.enableBody(true, Math.random() * game.config.width - 10, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}


function hitBomb (player, bomb)
{
    this.physics.pause();

    player.disableBody(true,true);
    this.lostTextBox.setText('Game Over!\nScore: ' + score + '\nStar Collected: '+ starCollected);
    this.lostTextBox.visible = true;
    }
function playerColors(){
    
      player.setTint(colors[currentColorIndex]);
      currentColorIndex = (currentColorIndex + 1) % colors.length;
}