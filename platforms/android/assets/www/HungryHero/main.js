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
        					alert('connected');
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

/**
 * main.js发布后固定不变，负责处理资源更新工作的基础
 */
cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(1024, 768, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
	
	var failCount = 0;
    var maxFailCount = 1;   //最大错误重试次数

    /**
     * 自动更新js和资源
     */
	var AssetsManagerLoaderScene = cc.Scene.extend({
		_am:null,
		_progress:null,
		_percent:0,
		run:function(){
			if (!cc.sys.isNative) {
                //html5必须先预加载，否则plist之类的就无效了
                var that = this;
                cc.loader.loadJs(["src/resource.js"], function(){
                    cc.loader.load(resources, that.loadGame);
                });
				return;
			}
            else {
                //这里特殊跳过所有更新逻辑
                this.loadGame();
                return;
            }

			var layer = new cc.Layer();
			this.addChild(layer);
			this._progress = new cc.LabelTTF.create("update 0%", "Arial", 12);
			this._progress.x = cc.winSize.width / 2;
			this._progress.y = cc.winSize.height / 2 + 50;
			layer.addChild(this._progress);

			var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");

			this._am = new jsb.AssetsManager("res/project.manifest", storagePath);
			this._am.retain();

			if (!this._am.getLocalManifest().isLoaded())
			{
				cc.log("Fail to update assets, step skipped.");
				this.loadGame();
			}
			else
			{
				var that = this;
				var listener = new cc.EventListenerAssetsManager(this._am, function(event) {
					switch (event.getEventCode()){
						case cc.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
							cc.log("No local manifest file found, skip assets update.");
							that.loadGame();
							break;
						case cc.EventAssetsManager.UPDATE_PROGRESSION:
							that._percent = event.getPercent();
							cc.log(that._percent + "%");
							var msg = event.getMessage();
							if (msg) {
								cc.log(msg);
							}
							break;
						case cc.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
						case cc.EventAssetsManager.ERROR_PARSE_MANIFEST:
							cc.log("Fail to download manifest file, update skipped.");
							that.loadGame();
							break;
						case cc.EventAssetsManager.ALREADY_UP_TO_DATE:
                            cc.log("ALREADY_UP_TO_DATE.");
                            that.loadGame();
                            break;
						case cc.EventAssetsManager.UPDATE_FINISHED:
							cc.log("Update finished.");
							that.loadGame();
							break;
						case cc.EventAssetsManager.UPDATE_FAILED:
							cc.log("Update failed. " + event.getMessage());
                            failCount++;
							if (failCount < maxFailCount)
							{
								that._am.downloadFailedAssets();
							}
							else
							{
								cc.log("Reach maximum fail count, exit update process");
                                failCount = 0;
								that.loadGame();
							}
							break;
						case cc.EventAssetsManager.ERROR_UPDATING:
							cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
							that.loadGame();
							break;
						case cc.EventAssetsManager.ERROR_DECOMPRESS:
							cc.log("ERROR_DECOMPRESS. " + event.getMessage());
							that.loadGame();
							break;
						default:
							break;
					}
				});

				cc.eventManager.addListener(listener, 1);
				this._am.update();
				cc.director.runScene(this);
			}

            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event) {
                    if (keyCode == cc.KEY.back) {
                        cc.director.end();
                    }
                }}, this);

			this.schedule(this.updateProgress, 0.5);
		},

		loadGame:function(){
            //jsList是jsList.js的变量，记录全部js。
			cc.loader.loadJs(["src/jsList.js"], function(){
				cc.loader.loadJs(jsList, function(){
					Game.start();
				});
			});
		},

		updateProgress:function(dt){
			this._progress.string = "update " + this._percent + "%";
		},

		onExit:function(){
			cc.log("AssetsManager::onExit");

			this._am.release();
			this._super();
		}
	});

	var scene = new AssetsManagerLoaderScene();
	scene.run();
};
cc.game.run();