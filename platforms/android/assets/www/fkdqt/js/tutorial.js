//Tutorial
//
var keysArrow = null;
var hand = null;
var stepsTutorial = null;
var textTutorial = null;
var idxStepTutorial = 0;
var showNextStepTutorial = null;

//
function checkTutorial()
{
    if(!isDoneTutorial) createTutorial();
}

//
function createTutorial()
{
    strings = game.cache.getJSON('strings');

    //
    textTutorial = createText(game.world.centerX, game.world.centerY + 200, 32);   
    stepsTutorial = new Array(4);    

    //
    if(game.device.desktop)
    {
        keysArrow = new Array(4);
        keysArrow[0] = game.add.sprite(game.world.centerX - 120, 900, 'atlas_play', 'ka_left');        
        keysArrow[1] = game.add.sprite(game.world.centerX + 120, 900, 'atlas_play', 'ka_right');
        keysArrow[2] = game.add.sprite(game.world.centerX, 800, 'atlas_play', 'ka_up');
        keysArrow[3] = game.add.sprite(game.world.centerX, 900, 'atlas_play', 'ka_down');
        for(var i = 0; i < 4; i++) keysArrow[i].anchor.set(0.5);
        showNextStepTutorial = showNextStepTutorialDesktop;

    }
    else
    {
        hand = game.add.sprite(0, 0, 'atlas_play', 'hand');
        hand.anchor.set(0.5);
        hand.angle = 180;
        hand.scale.x = -1.0;
        hand.tStart = new Array(4);
        hand.tTarget = new Array(4);
        hand.tStart[0] = new Phaser.Point(game.world.centerX + 70, 870);
        hand.tTarget[0] = new Phaser.Point(game.world.centerX - 70, 870);
        hand.tStart[1] = new Phaser.Point(game.world.centerX - 70, 870);
        hand.tTarget[1] = new Phaser.Point(game.world.centerX + 70, 870);
        hand.tStart[2] = new Phaser.Point(game.world.centerX + 100, 870);
        hand.tTarget[2] = new Phaser.Point(game.world.centerX + 100, 800);
        hand.tStart[3] = new Phaser.Point(game.world.centerX + 100, 800);
        hand.tTarget[3] = new Phaser.Point(game.world.centerX + 100, 870);        
        hand.tTween = null;
        showNextStepTutorial = showNextStepTutorialMobile;
    }

    //
    idxStepTutorial = 0;
    nextStepTutorial();
}

//
function showNextStepTutorialDesktop()
{
    textTutorial.text = strings.tutorial_desktop[idxStepTutorial];
    for(var i = 0; i < 4; i++) keysArrow[i].alpha = 0.5;
    keysArrow[idxStepTutorial].alpha = 1.0;
}

//
function showNextStepTutorialMobile()
{
    textTutorial.text = strings.tutorial[idxStepTutorial];
    
    hand.x = hand.tStart[idxStepTutorial].x;
    hand.y = hand.tStart[idxStepTutorial].y;
    if(hand.tTween && hand.tTween.isRunning) hand.tTween.stop();
    hand.tTween = game.add.tween(hand).to(hand.tTarget[idxStepTutorial], 500, Phaser.Easing.Linear.None, true, 400, Number.MAX_VALUE);

    if(idxStepTutorial === 2) hand.angle = 90;
}

//
function nextStepTutorial()
{
    if(idxStepTutorial === 4) doneTutorial();
    else
    {
        var e = spawnEnemy(idxStepTutorial);
        var rv = e.path[2];
        if(e.body.velocity.y === 0) e.x = rv;
        else e.y = rv;
        becomeNeighbor(e);

        showNextStepTutorial();

        ++idxStepTutorial;
    }
}

//
function doneTutorial()
{    
    isDoneTutorial = true;
    game.time.events.add(500, function() { game.state.restart(); });    
}