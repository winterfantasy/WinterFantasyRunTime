//Start Menu State
//

var StartMenuState = {
    create: createStartMenu
};

var fof = null;
var moreGamesButton = null;

//
function createStartMenu() {
    game.input.onDown.add(goFullScreen, this);

    prevGameState = 'start_menu_state';

    level_n = game.rnd.integerInRange(1, 5).toString();

    //world and camera
    game.world.setBounds(0, 0, 654, 980);
    game.camera.x = 10;
    game.camera.y = 10;

    //
    game.add.sprite(0, 0, 'bg_level_' + level_n);
    createIslets(level_n);
    CreateHero(playerData.currentHeroIdx);

    fof = game.add.sprite(game.world.centerX, 115 - game.world.height, 'atlas_gui', 'fof');
    fof.anchor.set(0.5);


    //
    soundButton = createSoundButton();
    moreGamesButton = createMoreGamesButton();
    playButton = createPlayButton(buttonPlayClickSM);
    heroHeadButton = createHeroHeadButton(buttonHeroHeadClickSM);

    //
    game.add.tween(fof).to({ y: 115 }, 200, Phaser.Easing.Elastic.Out, true);
}

//
function createMoreGamesButton() {
    var btn = game.add.button(game.world.centerX - 200, game.world.height + 100, 'atlas_gui', buttonMoreGamesClick, this, 'btn_moregames_normal', 'btn_moregames_normal', 'btn_moregames_pressed', 'btn_moregames_normal');
    btn.anchor.set(0.5);
    if (sfx_button_pressed) btn.setDownSound(sfx_button_pressed);
    game.add.tween(btn).to({ y: game.world.height - 100 }, 200, Phaser.Easing.Elastic.Out, true);
    return btn;
}

//
function buttonPlayClickSM() {
    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    //game.scale.startFullScreen(false);    
    leaveStartMenu('play_state');
}

//
function buttonHeroHeadClickSM() {
    leaveStartMenu('select_hero_state');
}

//
function leaveStartMenu(nextState) {
    game.add.tween(soundButton).to({ y: 60 - game.world.height }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(moreGamesButton).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(playButton).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(heroHeadButton).to({ y: game.world.height + 100 }, 200, Phaser.Easing.Linear.None, true);

    game.add.tween(fof).to({ y: 115 - game.world.height }, 200, Phaser.Easing.Linear.None, true).onComplete.add(function () { game.state.start(nextState); });
}