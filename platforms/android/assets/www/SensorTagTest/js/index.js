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

var interval_notify_index = "";
var interval_scan_index = "";
var scan_timestamp = 0;

var app = {

    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
        app.bindUIEvents();

    },
    
    bindCordovaEvents: function() {
		document.addEventListener('deviceready',app.onDeviceReady,false);
        document.addEventListener('bcready', app.onBCReady, false);
		document.addEventListener('adddevice2ui', app.addDevice2UI, false);
    },
    
	onDeviceReady : function(){
		var _ = window._ = cordova.require("org.underscorejs.underscore");
	},
	    
    onBCReady: function() {
		jQuery.ajaxSetup({isLocal: true});
		BC.bluetooth.addEventListener("bluetoothstatechange",app.onBluetoothStateChange);
		BC.bluetooth.addEventListener("newdevice",app.addNewDevice);
		if(!BC.bluetooth.isopen){
			if(API !== "ios"){
				BC.Bluetooth.OpenBluetooth(function(){

				});
			}else{					
				alert("Please open your bluetooth first.");
			}
		}else{
			//BC.Bluetooth.StartScan();
		}
    },
	
	onDeviceDisconnected: function(arg){
		alert("SensorTag:"+ arg.deviceAddress +" is disconnect");
		$.mobile.changePage("index.html","slideup");
	},
	
    bindUIEvents: function(){
    	$('#scanOnOff').change(app.startORstopScan);
    },
    
    device_page: function(deviceAddress){
    	app.device = BC.bluetooth.devices[deviceAddress];
		BC.Bluetooth.StopScan();
		var scanOnOff = $("#scanOnOff");
		scanOnOff[0].selectedIndex = 0;
		scanOnOff.slider("refresh");
		app.device.connect(function(){
			$.mobile.changePage("sensorTagTest.html","slideup");
		},function(){alert("connect the SensorTag: "+ deviceAddress +" error!")});
    },
    
    startORstopScan: function(){
		var state = $("#scanOnOff").val();
		if(state == 1){
			$("#user_view").html("");
			BC.Bluetooth.StartScan("LE");
			scan_timestamp = new Date().getTime();
			interval_scan_index = window.setInterval(app.displayScanResult, 1000);
		}else if(state == 0){
			BC.Bluetooth.StopScan();
			if(interval_scan_index){
				window.clearInterval(interval_scan_index);
			}
		}
    },
	
	displayScanResult: function(){
		_.each(BC.bluetooth.devices,function(device){
		//if the device is sensortag
			if(scan_timestamp < device.advTimestamp && app.notOnUI(device) && device.deviceName == "SensorTag"){
				var viewObj	= $("#user_view");
				var liTplObj=$("#li_tpl").clone();
				$("a",liTplObj).attr("onclick","app.device_page('"+device.deviceAddress+"')");
				liTplObj.show();
				for(var key in device){
					if(key == "isConnected"){
						if(device.isConnected){
							$("[dbField='"+key+"']",liTplObj).html("YES");
						}
						$("[dbField='"+key+"']",liTplObj).html("NO");
					}else{
						$("[dbField='"+key+"']",liTplObj).html(device[key]);
					}
				}	

				viewObj.append(liTplObj);
				viewObj.listview("refresh");
			}
		});
	},
	
	notOnUI: function(device){
		var length = $("#user_view li").length;
		for(var i = 0; i < length; i++){
			var liTplObj = $("#user_view li")[i];
			var deviceAddr = $("[dbField='deviceAddress']",liTplObj).html();
			if(deviceAddr == device.deviceAddress){
				return false;
			}
		}
		return true;
	},
	
	onBluetoothStateChange : function(){
		if(BC.bluetooth.isopen){
			alert("your bluetooth has been opened successfully.");
			var scanOnOff = $("#scanOnOff");
			scanOnOff[0].selectedIndex = 0;
			scanOnOff.slider("refresh");
		}else{
			alert("bluetooth is closed!");
			BC.Bluetooth.OpenBluetooth(function(){alert("opened!");});
		}
	},
	
	addNewDevice: function(s){
		var newDevice = s.target;
		newDevice.addEventListener("devicedisconnected",app.onDeviceDisconnected);
	},
	
	deviceViewInit: function(){
		$("#deviceName").html(app.device.deviceName);
		$("#deviceAddress").html(app.device.deviceAddress);
		var isconnect = app.device.isConnected;
	},
	
	accelerometerTest: function(){
		app.showLoader("Loading...");
		this.subscribeAccelerometer();
	},
	
	subscribeAccelerometer: function(){
		var sensortag = app.device;
		sensortag.prepare(function(){
			var beginNotifyChar = sensortag.services[4].characteristics[0];
			var enableChar = sensortag.services[4].characteristics[1];
			var frequencyChar = sensortag.services[4].characteristics[2];
			
			enableChar.write("Hex","01",function(){
				frequencyChar.write("Hex","0a",function(){
					$.mobile.changePage("accelerometerTest.html","slideup");
					//app.hideLoader();
					beginNotifyChar.subscribe(function(data){
						var x = app.changeTog(data.value.value.slice(0,1));
						var y = app.changeTog(data.value.value.slice(1,2));
						var z = app.changeTog(data.value.value.slice(2,3));
						document.getElementById('x').innerHTML = x;
						document.getElementById('y').innerHTML = y;
						document.getElementById('z').innerHTML = -z;
						document.getElementById('raw').innerHTML = data.value.getHexString();
					});
				},function(){
					alert("write to enable char error");
				});
			},function(){
				alert("write to enable char error");
			});
			
		},function(){alert("read SensorTag ATT table error!");});
	},
	
	changeTog : function(data){
		var raw = new Int8Array(data);
		return raw[0]/64;
	},
	
	goBackHome : function(){
		app.device.disconnect(function(){
			$.mobile.changePage("index.html","slideup");
		},function(){alert("can not disconnect the SensorTag!");});
	},
	
	showLoader : function(message) {
		$.mobile.loading('show', {
			text: message, 
			textVisible: true, 
			theme: 'a',        
			textonly: false,   
			html: ""           
		});
	},

	hideLoader : function(){
		$.mobile.loading('hide');
	},

};
