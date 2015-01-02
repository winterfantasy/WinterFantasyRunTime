/*
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var start = false;
var first = true;
var prex = 0;
var prey = 0;
var prez = 0;

function changeTog(data) {
    var raw = new Int8Array(data);
    return raw[0] / 64;
}

var app = {
	data : {},
    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
		var defaultName = new Date().getTime();
		$('#samplingName').val(defaultName);
		app.initData();
    },
    
    bindCordovaEvents: function() {
		//document.addEventListener('deviceready',app.onDeviceReady,false);
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
                                    	if(start){
                                    	    var x = changeTog(data.value.value.slice(0, 1))*9.81;
	                                        var y = changeTog(data.value.value.slice(1, 2))*9.81;
	                                        var z = changeTog(data.value.value.slice(2, 3))*9.81;
	                                        
	                                        document.getElementById('x').innerHTML = x;
											document.getElementById('y').innerHTML = y;
											document.getElementById('z').innerHTML = z;	
	
											var timestamp = new Date().getTime();
											app.data.x.push([timestamp,x]);
											app.data.y.push([timestamp,y]);
											app.data.z.push([timestamp,z]);
                                    	}
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
    },
    
	onDeviceReady : function(){
		navigator.accelerometer.watchAcceleration(
	    // success handler
	    function (evt) {
			/*if(first){
				first = false;
			}else{
				var deltax = evt.x - prex;
				var deltay = evt.y - prey;
				var deltaz = evt.z - prez;
				var D = Math.sqrt(deltax*deltax + deltay*deltay + deltaz*deltaz);
				*/
	
				if(start){
					document.getElementById('x').innerHTML = evt.x;
					document.getElementById('y').innerHTML = evt.y;
					document.getElementById('z').innerHTML = evt.z;	
					var timestamp = new Date().getTime();
					app.data.x.push([timestamp,evt.x]);
					app.data.y.push([timestamp,evt.y]);
					app.data.z.push([timestamp,evt.z]);
				}
				
				/*if(D < 1){
					first = true;
				}
			}
			prex = evt.x;
			prey = evt.y;
			prez = evt.z;*/
		},
	
	    // error handler
	    function (e) {
	      alert("accel fail (" + e.name + ": " + e.message + ")");
	    },
	
	    // options: update every 100ms
	    { frequency: 33 }
	  );
	},
	
	startSampling : function(){
		if($('#samplingName').val() == ""){
			alert("please enter the sampling name");
			return;
		}
		$("#startSampling").hide();
		$("#stopSampling").show();
		start = true;
		app.initData();
		app.data.startTime = new Date().getTime();
	},
	
	stopSampling : function(){
		$("#startSampling").show();
		$("#stopSampling").hide();
		$("#showThisData").show();
		$("#saveData").show();
		$("#deleteLastOne").show();
		start = false;
		app.data.stopTime = new Date().getTime();
	},
	
	showThisData : function(){
		app.stopSampling();
		//alert(JSON.stringify(app.data));
		$.mobile.changePage("showData.html","slideup");
	},
	
	deleteLastOne : function(){
		app.initData();
	},
	
	clearDataAndBack : function(){
		window.history.go(-1);
		app.initData();
	},
	
	initData : function(){
		if($('#samplingName').val() == ""){
			alert("please enter the sampling name");
			return;
		}
		
		app.data = {};
		app.data.x = [];
		app.data.y = [];
		app.data.z = [];
		app.data.name = $('#samplingName').val();
		$("#showThisData").hide();
		$("#saveData").hide();
		$("#deleteLastOne").hide();
	},
	
	saveData : function(){
		$.post("http://192.168.3.1:8000/saveSample.php",JSON.stringify(app.data),function(result){
			if(result == "success"){
				alert("data saved successfully");
			}
		});
	},
};
