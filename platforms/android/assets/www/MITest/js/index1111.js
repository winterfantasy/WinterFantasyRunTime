/*
	Copyright 2013-2014, JUMA Technology

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

var app = {

    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
    },
    
    bindCordovaEvents: function() {
		document.addEventListener('deviceready',app.onDeviceReady,false);
        document.addEventListener('bcready', app.onBCReady, false);
       // document.addEventListener("backbutton", function(){alert("32641");}, false);
    },
    
	onDeviceReady : function(){
		var BC = window.BC = cordova.require("org.bcsphere.bcjs");
		var _ = window._ = cordova.require("org.underscorejs.underscore");		
	},
	
	onBCReady : function(){

	},
	
	write : function(){
		var device = new BC.Device({deviceAddress:"D0:39:72:A5:EE:90",type:"BLE"});
		device.connect(function(){
			device.discoverServices(function(){
				var service = device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("fff1")[0];
					character.write("Hex","1",function(data){
						alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},
};
