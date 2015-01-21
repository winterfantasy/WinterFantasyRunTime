
var ax = [];
var ay = [];
var az = [];
var prex = 0;
var prey = 0;
var prez = 0;

setInterval(function(){
	var xx = ax.shift();
	var zz = az.shift();
	if(xx > 0.3 && prex < 0.3){
		punchDownDesktop();
	}else if(xx < -0.3 && prex > -0.3){
		punchUpDesktop();
	}else if(zz > 0.3 && prez < 0.3){
		punchRightDesktop();
	}else if(zz < -0.3 && prez > -0.3){
		punchLeftDesktop();
	}
	prex = xx;
	prez = zz;
},25);

function changeTog(data) {
    //var raw = new Int8Array(data);
    //return raw[0] / 64;
	
	var dv = new DataView(data);
	var raw = dv.getUint16(0,true);
	raw = raw << 2;
	dv.setUint16(0,raw,true);
	var value = dv.getInt16(0,true);
	return value/400;
}

document.addEventListener('bcready', function () {
        	BC.bluetooth.addEventListener("bluetoothstatechange", function () {
        		if (BC.bluetooth.isopen) {
        			alert("your bluetooth has been opened successfully.");
        		} else {
        			alert("bluetooth is closed!");
        			BC.Bluetooth.OpenBluetooth(function () { alert("opened!"); });
        		}
        	});
        	BC.bluetooth.addEventListener("newdevice", function (arg) {
        		var newDevice = arg.target;
        		newDevice.addEventListener("devicedisconnected", function (arg) {
        			alert("MI:" + arg.deviceAddress + " is disconnect,Click to reconnect.");
        			newDevice.connect(function (arg) {
        				alert("MI:" + arg.deviceAddress + " is reconnected successfully.");
        			}, function () {
        				newDevice.dispatchEvent("devicedisconnected");
        			});
        		});
        		/*if (newDevice.deviceAddress == "BC:6A:29:AB:7C:DE") {
        			sensorTag = newDevice;
        			BC.Bluetooth.StopScan();
        			newDevice.connect(function () {
        				sensorTag.prepare(function () {
        					var beginNotifyChar = sensorTag.services[4].characteristics[0];
        					var enableChar = sensorTag.services[4].characteristics[1];
        					var frequencyChar = sensorTag.services[4].characteristics[2];

        					enableChar.write("Hex", "01", function () {
        						frequencyChar.write("Hex", "03", function () {
        							beginNotifyChar.subscribe(function (data) {
        								ax = changeTog(data.value.value.slice(0, 1));
        								ay = changeTog(data.value.value.slice(1, 2));
        								az = changeTog(data.value.value.slice(2, 3));
        								//ay = -ay;
										console.log(ax+"////"+ay);
        							});
        						}, function () {
        							alert("write to enable char error");
        						});
        					}, function () {
        						alert("write to enable char error");
        					});
        				}, function () {
        					alert("read SensorTag ATT table error!");
        				});
        			}, function () {
        				alert("connect the SensorTag BC:6A:29:AB:7C:DE error");
        			});
        		}*/
				
				if (newDevice.deviceAddress == "88:0F:10:4C:21:9B") {
        			BC.Bluetooth.StopScan();
        			newDevice.connect(function () {
        				newDevice.prepare(function () {
							setTimeout(function(){
								newDevice.services[2].characteristics[2].subscribe(function(){
									//alert(1);
								}
							)},50);
							setTimeout(function(){
								newDevice.services[2].characteristics[5].subscribe(function(){
									//alert(2);
								}
							)},250);			
							setTimeout(function(){
								newDevice.services[2].characteristics[6].subscribe(function(){
									//alert(3);
								}
							)},450);
							setTimeout(function(){
								newDevice.services[2].characteristics[11].subscribe(function(){
									//alert(4);
								}
							)},650);
							setTimeout(function(){
								var time = 0;
								newDevice.services[2].characteristics[13].subscribe(function(data){
									if(data.value.getHexString().length < 25){
										return;
									}
									if(data.value.value.byteLength == 20){
										ax.push(changeTog(data.value.value.slice(2,4))/10);
										ay.push(changeTog(data.value.value.slice(4,6))/10);
										az.push(changeTog(data.value.value.slice(6,8))/10);
										ax.push(changeTog(data.value.value.slice(8,10))/10);
										ay.push(changeTog(data.value.value.slice(10,12))/10);
										az.push(changeTog(data.value.value.slice(12,14))/10);
										ax.push(changeTog(data.value.value.slice(14,16))/10);
										ay.push(changeTog(data.value.value.slice(16,18))/10);
										az.push(changeTog(data.value.value.slice(18,20))/10);
									}
								}
							)},850);
							
							setTimeout(function(){
								newDevice.services[2].characteristics[3].write("Hex","D168C4280118AA420036383339363035323900AF",function(){
									newDevice.services[2].characteristics[4].write("Hex","1201",function(){
										//alert("start listening success.");
									},function(){
										alert("write error!!!");
									})
								},function(){
									alert("write error!!!");
								}
							)},1050);
						}, function () {
        					alert("read MI ATT table error!");
        				});
        			}, function () {
        				alert("connect MI error");
        			});
				}
        	});

        	if (!BC.bluetooth.isopen) {
        		BC.Bluetooth.OpenBluetooth(function () {
        			BC.Bluetooth.StartScan("LE");
        		});
        	} else {
        		BC.Bluetooth.StartScan("LE");
        	}
        }, false);
//Play State
//
var PlayState = {
    create: createPlay,
    update: updatePlay
};

var hero = null;
var currentScore = 0;
var prevCurrentScore = 0;
var tapStartPoint = { x: 0, y: 0 };
var isSwipe = false;
var isSpellingSuperPower = false;

var neighborLeft = null;
var neighborTop = null;
var neighborRight = null;
var neighborBottom = null;

var centerPoint = null;

var level_n = 1;

//
function createPlay()
{
    prevGameState = 'play_state';

    //world and camera
    game.world.setBounds(0, 0, 654, 980);
    game.camera.x = 10;
    game.camera.y = 10;
    centerPoint = new Phaser.Point(game.world.centerX, game.world.centerY);

    //bg    
    game.add.sprite(game.world.centerX, game.world.centerY, 'bg_level_' + level_n).anchor.set(0.5);      

    //
    createIslets(level_n);

    //
    if(isDoneTutorial) CreateKillsCounter();
    else game.add.sprite(game.world.centerX, game.world.centerY, 'tutorial_dark_layer').anchor.set(0.5);  

    //enemies
    CreateEnemies(10);

    //hero    
    hero = CreateHero(playerData.currentHeroIdx);
    createPunchParticles();

    //
    CreateRageBar();

    //controls
    if(game.device.desktop)
    {
        var cursors = game.input.keyboard.createCursorKeys();
        cursors.left.onDown.add(punchLeftDesktop);
        cursors.right.onDown.add(punchRightDesktop);
        cursors.up.onDown.add(punchUpDesktop);
        cursors.down.onDown.add(punchDownDesktop);
    }
    else
    {
        game.input.onDown.add(onDownEventPlay, this);
        game.input.onUp.add(onUpEventPlay, this);
    }

    //
    currentScore = 0;
    prevCurrentScore = 0;    
    isSwipe = false;
    isSpellingSuperPower = false;

    neighborLeft = null;
    neighborTop = null;
    neighborRight = null;
    neighborBottom = null;

    //
    checkTutorial();    
}

//
function updatePlay()
{
    if(isSwipe) swipe();
    updateRage();
}

//
function swipe()
{
    var distSwipeX = game.input.activePointer.x - tapStartPoint.x;
    var distSwipeY = game.input.activePointer.y - tapStartPoint.y;
    var absDistSwipeX = Math.abs(distSwipeX);
    var absDistSwipeY = Math.abs(distSwipeY);
    
    if(Math.max(absDistSwipeX, absDistSwipeY) > 60)
    {       
        if(absDistSwipeX > absDistSwipeY)
        {
            if(distSwipeX > 0) punchRight();           
            else punchLeft();                       
        }
        else
        {
            if(distSwipeY > 0) punchDown();          
            else punchUp();           
        }

        isSwipe = false;
    }
}

//
function onDownEventPlay(event)
{
    if(!isSpellingSuperPower)
    {
        isSwipe = true;
        tapStartPoint.x = game.input.activePointer.x;
        tapStartPoint.y = game.input.activePointer.y;
    }
}

//
function onUpEventPlay(event)
{
    isSwipe = false;   
}

//
function punchLeft()
{
    hero.animations.play('punch_left');
    firePunchEffect(Math.PI);
    if(neighborLeft)
    {        
        punchToEnemy(neighborLeft);
        neighborLeft = null;
        addRage();
        cameraShake(-10, 0);
    }
}

function punchUp()
{
    hero.animations.play('punch_up');
    firePunchEffect(Math.PI * -0.5);
    if(neighborTop)
    {        
        punchToEnemy(neighborTop);
        neighborTop = null;
        addRage();
        cameraShake(0, -10);
    }
}

function punchRight()
{
    hero.animations.play('punch_right');
    firePunchEffect(0);
    if(neighborRight)
    {        
        punchToEnemy(neighborRight);
        neighborRight = null;
        addRage();
        cameraShake(10, 0);
    }
}

function punchDown()
{
    hero.animations.play('punch_down');
    firePunchEffect(Math.PI * 0.5);
    if(neighborBottom)
    {        
        punchToEnemy(neighborBottom);
        neighborBottom = null;
        addRage();
        cameraShake(0, 10);
    }
}

//
function punchLeftDesktop()
{
    if(!isSpellingSuperPower) punchLeft();
}

function punchUpDesktop()
{
    if(!isSpellingSuperPower) punchUp();
}

function punchRightDesktop()
{
    if(!isSpellingSuperPower) punchRight();
}

function punchDownDesktop()
{
    if(!isSpellingSuperPower) punchDown();
}

//camera shake
function cameraShake(dx, dy)
{
    game.camera.x += dx;
    game.camera.y += dy;
    game.add.tween(game.camera).to({ x: 10, y: 10 }, 200, Phaser.Easing.Bounce.Out, true) //Bounce.Out Linear.None,
}

//islets
function createIslets(level_n)
{
    var group = game.add.group();

    group.create(100, 310, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(168, 340, 'atlas_play', 'islet_b_' + level_n).anchor.setTo(0.5);
    group.create(150, 160, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(560, 670, 'atlas_play', 'islet_b_' + level_n).anchor.setTo(0.5);
    group.create(588, 359, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(460, 370, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(500, 720, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(480, 760, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(490, 880, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);
    group.create(90, 740, 'atlas_play', 'islet_b_' + level_n).anchor.setTo(0.5);
    group.create(160, 820, 'atlas_play', 'islet_b_' + level_n).anchor.setTo(0.5);
    group.create(150, 650, 'atlas_play', 'islet_l_' + level_n).anchor.setTo(0.5);

    game.add.tween(group).to({ x: 0.0, y: 8.0 }, 2000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true)
}