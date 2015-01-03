/****************************************************************************
 Cocos2d-html5 show case : Moon Warriors

 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 @Authors:
 Programmer: Shengxiang Chen (闄堝崌鎯�, Dingping Lv (鍚曞畾骞�, Ricardo Quesada
 Effects animation: Hao Wu (鍚存槉)
 Quality Assurance: Sean Lin (鏋楅『)
 ****************************************************************************/

/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "../../frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */
 var ax=0;
 var ay=0;
 var az=0;
 function changeTog(data) {
    var raw = new Int8Array(data);
    return raw[0] / 64;
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
        			alert("SensorTag:" + arg.deviceAddress + " is disconnect,Click to reconnect.");
        			newDevice.connect(function (arg) {
        				alert("SensorTag:" + arg.deviceAddress + " is reconnected successfully.");
        			}, function () {
        				newDevice.dispatchEvent("devicedisconnected");
        			});
        		});
        		if (newDevice.deviceAddress == "BC:6A:29:AB:7C:DE") {
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
        
cc.game.onStart = function(){
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(480,720,cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    cc.director.setProjection(cc.Director.PROJECTION_2D);

    if (cc.sys.isNative) {
        var searchPaths = jsb.fileUtils.getSearchPaths();
        searchPaths.push('script');
        if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_OSX) {
            searchPaths.push("res");
            searchPaths.push("src");
        }
        jsb.fileUtils.setSearchPaths(searchPaths);
    }
    //load resources
    cc.LoaderScene.preload(g_mainmenu, function () {
        cc.director.runScene(SysMenu.scene());
    }, this);
};

cc.game.run();