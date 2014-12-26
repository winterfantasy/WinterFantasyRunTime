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
		document.addEventListener('deviceready',app.onDeviceReady,false);
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
