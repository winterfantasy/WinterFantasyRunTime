//Select Hero State
//

var SelectHeroState = {
    create: createSelectHero,
    update: updateSelectHero
};

//
var textHeroes = null;
var textTotal = null;
var textHeroName = null;
var textLock = null;
var buttonArrowLeft = null;
var buttonArrowRight = null;
var buttonSelect = null;
var stripe = null;
var heroes = null;
var distBetweenHeroes = 120;
var isSliding = false;
var isRolling = false;
var stripeAnchor = null;
var strings = null;
var currentHeroIdx = 0;

//
var lockHeroScore = [0, 100, 150, 200, 250, 300, 350];
var lockHeroTotal = [0, 1000, 2000, 3500, 5000, 7000, 10000];

//
function createSelectHero()
{
    strings = game.cache.getJSON('strings');

    currentHeroIdx = playerData.currentHeroIdx;

    //
    var bg = game.add.sprite(0, 0, 'bg_gui');    

    //
    createHeroesStripe();

    //
    soundButton = createSoundButton();
    backButton = createBackButton(buttonBackClickSH);
    buttonArrowLeft = createArrowButton(game.world.centerX - 200);
    buttonArrowLeft.dxStripe = distBetweenHeroes;
    buttonArrowRight = createArrowButton(game.world.centerX + 200);
    buttonArrowRight.scale.x = -1.0;
    buttonArrowRight.dxStripe = -distBetweenHeroes;
    buttonSelect = createSelectButton();    

    //text
    textHeroes = createText(game.world.centerX, 100 - game.world.height, 32);
    textHeroes.fill = '#ff8c00';
    textHeroes.stroke = '#000000';
    textHeroes.strokeThickness = 3;
    textHeroes.scale.set(3.0);    
    textHeroes.text = strings.heroes_title;

    textBest = createText(game.world.centerX - 150, 250 - game.world.height, 32);
    textBest.text = strings.best + '\n' + playerData.bestScore.toString();

    textTotal = createText(game.world.centerX + 150, 250 - game.world.height, 32);
    textTotal.text = strings.total + '\n' + playerData.totalScore.toString();    

    textHeroName = createText(game.world.centerX, 360 - game.world.height, 32);
    textHeroName.fill = '#ff8c00';
    textHeroName.stroke = '#000000';
    textHeroName.strokeThickness = 3;
    textHeroName.text = strings.hero_names[currentHeroIdx];

    textLock = createText(game.world.centerX, game.world.height - 300, 22);

    //
    game.add.tween(textHeroes).to({ y: 100 }, 200, Phaser.Easing.Elastic.Out, true);
    game.add.tween(textBest).to({ y: 250 }, 200, Phaser.Easing.Elastic.Out, true);
    game.add.tween(textTotal).to({ y: 250 }, 200, Phaser.Easing.Elastic.Out, true);
    game.add.tween(textHeroName).to({ y: 360 }, 200, Phaser.Easing.Elastic.Out, true).onComplete.add(function() { textLock.text = strings.unlocked; });

    //
    //
    if(game.device.desktop)
    {
        var cursors = game.input.keyboard.createCursorKeys();
        cursors.left.onDown.add(rollLeftDesktop);
        cursors.right.onDown.add(rollRightDesktop);
    }
    else
    {
        game.input.onDown.add(onDownEventSelect, this);
        game.input.onUp.add(onUpEventSelect, this);
    }

    isSliding = false;
    isRolling = false;

    playerData.unlockedNextHero = false;
}

//
function onDownEventSelect()
{
    isSliding = true;
    tapStartPoint.x = game.input.activePointer.x;   
}

function onUpEventSelect()
{
    isSliding = false;
}

//
function rollLeftDesktop()
{
    if(!isRolling) buttonArrowClick(buttonArrowLeft); 
}

function rollRightDesktop()
{
    if(!isRolling) buttonArrowClick(buttonArrowRight);
}

//
function updateSelectHero()
{
    if(isSliding)
    {
        var distSlideX = game.input.activePointer.x - tapStartPoint.x;
        if(distSlideX > 60)
        {
            if(!isRolling)
            {
                buttonArrowClick(buttonArrowLeft);
                tapStartPoint.x = game.input.activePointer.x;
            }
        }
        else if(distSlideX < -60)
        {
            if(!isRolling)
            {
                buttonArrowClick(buttonArrowRight);
                tapStartPoint.x = game.input.activePointer.x;
            }
        }
    }
}

//
function createArrowButton(x)
{
    var btn = game.add.button(x, game.world.height + 100, 'atlas_gui', buttonArrowClick, this, 'btn_back_normal', 'btn_back_normal', 'btn_back_pressed', 'btn_back_normal');
    btn.anchor.set(0.5);
    if(sfx_button_pressed) btn.setDownSound(sfx_button_pressed);
    game.add.tween(btn).to({ y: game.world.height - 100 }, 200, Phaser.Easing.Elastic.Out, true);
    return btn;
}

function createSelectButton()
{
    var btn = game.add.button(game.world.centerX, game.world.height + 100, 'atlas_gui', buttonSelectClick, this, 'btn_select_normal', 'btn_select_normal', 'btn_select_pressed', 'btn_select_normal');
    btn.anchor.set(0.5);
    if(sfx_button_pressed) btn.setDownSound(sfx_button_pressed);
    game.add.tween(btn).to({ y: game.world.height - 100 }, 200, Phaser.Easing.Elastic.Out, true);
    return btn;
}

//
function buttonArrowClick(button)
{
    isRolling = true;
    textHeroName.visible = false;
    textLock.visible = false;
    buttonSelect.inputEnabled = false;

    game.add.tween(stripeAnchor).to({ x: stripeAnchor.x + button.dxStripe }, 100, Phaser.Easing.Linear.None, true).onUpdateCallback(rollHeroesStripe);
    game.add.tween(heroes.getAt(currentHeroIdx).scale).to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None, true);

    if(button.dxStripe < 0)
    {        
        if(++currentHeroIdx > 6) currentHeroIdx = 0;
    }
    else
    {
        if(--currentHeroIdx < 0) currentHeroIdx = 6;
    }
    
    game.add.tween(heroes.getAt(currentHeroIdx).scale).to({ x: 1.5, y: 1.5 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(rollEnd);
}

//
function rollEnd()
{
    isRolling = false;

    textHeroName.text = strings.hero_names[currentHeroIdx];
    textHeroName.visible = true;

    if(playerData.heroes[currentHeroIdx] == 1)
    {
        textLock.text = strings.unlocked;
        buttonSelect.setFrames('btn_select_normal', 'btn_select_normal', 'btn_select_pressed', 'btn_select_normal');
        buttonSelect.inputEnabled = true;
    }
    else
    {
        textLock.text = strings.lock_text[0]
            + lockHeroScore[currentHeroIdx].toString()
            + strings.lock_text[1]
            + strings.lock_text[2]
            + lockHeroTotal[currentHeroIdx].toString()
            + strings.lock_text[3];
            
        buttonSelect.setFrames('btn_select_bw', 'btn_select_bw', 'btn_select_bw', 'btn_select_bw');
    }

    textLock.visible = true;   

    if(sfx_switch_anything) sfx_switch_anything.play();
}

//
function buttonSelectClick()
{
    if(playerData.heroes[currentHeroIdx] == 1)
    {
        playerData.currentHeroIdx = currentHeroIdx;
        buttonBackClickSH();
    }
}

//
function createHeroesStripe()
{
    stripe = game.add.sprite(game.world.centerX, game.world.centerY - game.world.height, 'atlas_gui', 'stripe');
    stripe.scale.setTo(10.5, 6);
    stripe.anchor.set(0.5);

    //
    var heroFrames = new Array(7);

    heroFrames[0] = 'pa_idle_1';
    heroFrames[1] = playerData.heroes[1] === 1 ? 'newbie_idle_1' : 'newbie_bw';
    heroFrames[2] = playerData.heroes[2] === 1 ? 'robo_idle_1' : 'robo_bw';
    heroFrames[3] = playerData.heroes[3] === 1 ? 'sg_idle_1' : 'sg_bw';
    heroFrames[4] = playerData.heroes[4] === 1 ? 'vampire_idle_1' : 'vampire_bw';
    heroFrames[5] = playerData.heroes[5] === 1 ? 'knight_idle_1' : 'knight_bw';
    heroFrames[6] = playerData.heroes[6] === 1 ? 'panda_idle_1' : 'panda_bw';

    heroes = game.add.group();    
    stripeAnchor = new Phaser.Point(0, game.world.centerY);
    for(var i = 0; i < 7; i++)
    {
        var hero = heroes.create(0, game.world.centerY, 'atlas_gui', heroFrames[i]);
        hero.offset = i * distBetweenHeroes;
        hero.x = stripeAnchor.x + hero.offset;
        hero.anchor.set(0.5);
        if(currentHeroIdx === i) hero.scale.set(1.5);        
    }

    var offset = game.world.centerX - heroes.getAt(currentHeroIdx).x;
    stripeAnchor.x += offset;
    rollHeroesStripe();
    rollHeroesStripe();

    heroes.y -= game.world.height;

    //
    game.add.tween(heroes).to({ y: 0 }, 200, Phaser.Easing.Elastic.Out, true);
    game.add.tween(stripe).to({ y: game.world.centerY }, 200, Phaser.Easing.Elastic.Out, true);
}

//
function rollHeroesStripe()
{
    for(var i = 0; i < 7; ++i)
    {
        var hero = heroes.getAt(i);
        hero.x = stripeAnchor.x + hero.offset;

        if(hero.x > game.world.width + distBetweenHeroes) hero.offset -= 7 * distBetweenHeroes;
        else if(hero.x < -distBetweenHeroes) hero.offset += 7 * distBetweenHeroes;
    }
}

//
function buttonBackClickSH()
{
    textLock.visible = false;

    game.add.tween(textHeroes).to({ y: 100 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(textBest).to({ y: 250 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(textTotal).to({ y: 250 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(textHeroName).to({ y: 360 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(buttonArrowLeft).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(buttonArrowRight).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(buttonSelect).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(soundButton).to({ y: 60 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(heroes).to({ y: -game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(stripe).to({ y: game.world.centerY - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    
    game.add.tween(backButton).to({ y: 60 - game.world.height }, 200, Phaser.Easing.Linear.None, true).onComplete.add(function() { game.state.start(prevGameState); });

    if(game.device.localStorage) localStorage.setItem('fistsoffrenzysavegame', JSON.stringify(playerData));
}

//
function checkUnlockHeroes(score)
{
    for(var i = 0; i < 7; i++)
    {
        if(playerData.heroes[i] == 0)
        {
            if(lockHeroScore[i] <= score || lockHeroTotal[i] <= playerData.totalScore)
            {
                playerData.heroes[i] = 1;
                playerData.unlockedNextHero = true;
            }
        }
    }
}