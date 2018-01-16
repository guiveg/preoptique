/*
   Copyright 2015-2017, Guillermo Vega-Gorgojo
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

$(document).ready(function() {
	// initialize state
	Session = new session();

	// session log
	Session.initLog();
	
	// CREATE AHUS DATA PROVIDER OBJECT
	Adata = new AhusDataProvider(parameters.sparqlBase, parameters.httpMethod,
		function(jqXHR, status, errorThrown) {
		   	console.log("ERROR!!!!\n"+status+"\n+"+errorThrown);
		});
		
	// CREATE AHUS REPORT PROVIDER OBJECT
	Adocs = new AhusDocProvider(parameters.textEngine,
		function(jqXHR, status, errorThrown) {
		   	console.log("ERROR!!!!\n"+status+"\n+"+errorThrown);
		});

	// AUTHORIZATION ROUTINE
	checkAuthorization();

	// handler for logout
	$('body').on("click", '.logout', function(event) {						
		sessionStorage.removeItem("authorized");
		sessionStorage.removeItem("username");
		window.location.reload();
	});
	
	// handler for patients
	$('body').on("click", '.patient', function(event) {
		showPatient($(this).attr("uri"));
	});
});


// PATIENT LIST
function createPatientList(show) {
	// request patient list and create markup when done
	Adata.getData('listPatients', {}, function(datos) {
		// create array of patients
		var patientA = new Array();
		// include each patient in the array
		$.each(datos.results.bindings, function(i, ditem) {
			var patient = new Object();
			patient.puri = ditem.patient.value;
			patient.pname = ditem.name.value;
			patientA.push(patient);
		});

		// create markup of the patient list

		// data object for the mustache template
		var data = {
			"patients": patientA,
			"logout": dict.logout,
			"title": dict.patients, //" Patients"
			"filter": dict.filter //"Filter..."
		};

		// prepare template
		var template =
			'<div data-url="n" data-role="page" id="patients" class="page" data-theme="b"> \
				<div data-role="header" data-id="myheader" data-position="fixed" > \
					<h1>{{title}}</h1> \
					<a href="#" class="ui-btn-right logout" data-inline="false" data-role="button" \
							data-icon="power">{{logout}}</a> \
				</div> \
				<div data-role="content"> \
					<ul data-role="listview" data-inset="true" data-theme="c" \
						data-divider-theme="c" data-filter="true" \
						data-filter-placeholder={{filter}}> \
							{{#patients}} \
								<li class="patient" uri="{{puri}}"><a href="#"><h2>{{pname}}</h2></a></li> \
							{{/patients}} \
					</ul> \
				</div> \
			</div>';

		// generate the mark-up
		var content = $(Mustache.render(template, data));
		//append it to the page container
		content.appendTo($.mobile.pageContainer);
		
		if (show) {		
			$.mobile.pageContainer.pagecontainer("change", "#patients", {
				transition : 'none'
			});		
		}		
	});
}


// GO TO PATIENT LIST
function init() {
	if (window.location.href.split("/gui/index.html").length>1 
		&& window.location.href.split("/gui/index.html")[1].length>0) {		
		// obtain new url
		var newurl = window.location.href.split("/gui/index.html")[0]+"/gui/index.html";
		// reload page		
		window.location = newurl;
		return;
	}
	// show patient list page
	createPatientList(true);
}


// SESSION TIME OUT
function initSessionTimeout() {
	console.log("Init session time out routine");
	var idleTime = 0;
	// increment idleTime and check session timeout each minute
	var interval = setInterval(function(){
		idleTime++;
		console.log("Idle time: "+idleTime);		
		if (idleTime > parameters.sessionTimeout) {
			// session time out!
			console.log("Session time out!");						
			sessionStorage.removeItem("authorized");
			sessionStorage.removeItem("username");
			clearInterval(interval); // not really necessary, since the page is reloaded
			window.location.reload();	
		}	
	}, 60000);
    // reset the idle timer on mouse movement or keypress
    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });
}


// AUTHORIZATION
function checkAuthorization() {
	if (sessionStorage.getItem("authorized") !== null) {
		// init session timeout routine
		initSessionTimeout();
		// go to next step
		init();
	}
	else {
		// create authentication form
		var content = '<div id="loginHeader" data-role="header" data-id="loginHeader" data-position="fixed"> \
				<h1>'+dict.welcome+'!</h1> \
			</div> \
			<div class="ui-content" role="main"> \
				<form id="login_form"> \
					<label for="user">'+dict.user+':</label> \
					<input type="text" name="user" id="login_user" /><br> \
					<label for="password">'+dict.password+':</label> \
					<input type="password" name="password" id="login_password" /><br> \
					<button id="login_submit" type="submit">'+dict.login+'</button> \
				</form> \
			</div>';
		//append the html markup to the page container (JQMobile 1.4)
		$('#signin').html(content);
		$('#signin').enhanceWithin();
					
		// send credentials...
		$("#login_submit").click(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: parameters.cerberus,
				data: $("#login_form").serialize(),
				success: function(data, textStatus, jqXHR) {
					//console.log(jqXHR.status);
					//validate the response here, set variables... whatever needed
					if (jqXHR.status == 200) {				
						// authorized!
						console.log("Authorized!");						
						sessionStorage.setItem("authorized", true);
						// los datos son el nombre de usuario
						sessionStorage.setItem("username", data);					
						authorizedScreen();
					}
				},
				error: function(jqXHR) { // server couldn't be reached or other error 
					console.log("Error!!!");
					//console.log(jqXHR.status);
					if (jqXHR.readyState == 0) {
						// Network error (i.e. connection refused, access denied due to CORS, etc.)
						console.log("Network error");						
						$('#loginHeader h1').html(dict.networkError);
						
						// potential security breach...
						// grant access in case of no network access
						sessionStorage.setItem("authorized", true);
						// los datos son el nombre de usuario
						sessionStorage.setItem("username", "Ahus user");				
						authorizedScreen();						
					}
					else if (jqXHR.readyState == 4) {
						// HTTP error
						if (jqXHR.status == 401) {					
							// not authorized!
							console.log("Not authorized!");
							$('#loginHeader h1').html(dict.notAuthorized);
						}
					}					
				}
			});
		});
	}
}

function authorizedScreen() {
	// authorized screen
	var content = '<div data-role="header" data-id="myheader" data-position="fixed"> \
			<h1>'+dict.welcome+', '+sessionStorage.getItem("username")+'!</h1> \
		</div> \
		<div class="ui-content" role="main"> \
			<h2>'+dict.authorized+'</h2><br> \
			<button id="auth_continue">'+dict.continue+'</button> \
		</div>';
	//append the html markup to the page container (JQMobile 1.4)
	$('#signin').html(content);
	$('#signin').enhanceWithin();
	
	// init session timeout routine
	initSessionTimeout();
			
	// continue...
	$('#auth_continue').on('click', function(event) {
		// go to next step
		init();
	});
}


// DATES AND TIMESTAMPS
function getDatetime(datetime) {
	var date = new Date(datetime);
	if (date.toJSON() == null)
		return null;
	// take into account the timezone offset (see http://stackoverflow.com/questions/11382606/javascript-date-tojson-dont-get-the-timezone-offset)
	date.setHours( date.getHours()+(date.getTimezoneOffset()/-60) );
	var cad = date.toJSON().split("T")[0];
	var time = date.toJSON().split("T")[1];
	cad += ' '+time.split(":")[0]+':'+time.split(":")[1];
	return cad;
}

function getDate(datetime) {
	var date = new Date(datetime);
	if (date.toJSON() == null)
		return null;	
	// take into account the timezone offset (see http://stackoverflow.com/questions/11382606/javascript-date-tojson-dont-get-the-timezone-offset)
	date.setHours( date.getHours()+(date.getTimezoneOffset()/-60) );
	return date.toJSON().split("T")[0];
}


// SIMPLE LOGGING
function initLog() {
	$.ajax({
		dataType : "json",
		url : parameters.geoipservice,
		success : function(loc) {
			var mes = "Ahus Pilot II\nIP: " + loc.ip + " - Country: " + loc.country_name + " - Region: " + loc.region_name + " - City: " + loc.city;
			Session.log("NEW SESSION", mes, "SUCCESS");
		},
		error : function() {
			var mes = "Ahus Pilot II\nGeolocation service unavailable (!)";
			Session.log("NEW SESSION", mes, "WARNING");
		}
	});
}

function log(type, mes, status) {
	newmes = mes.replace(/\n/g, "\n      ");
	var message = Session.sessionId + " " + type + "\nStatus: " + status + "\nInfo: " + newmes;
	if (parameters.locallog)
		console.log(message);
	if (parameters.remotelog) {
		$.ajax({
			type : "POST",
			url : parameters.logservice,
			data : message,
			error : function() {
				parameters.remotelog = false;
			} //disable remote login if not available
		});
	}
}

// new object ID
function newObjectId() {
	// generate new ID: 5 digits of the Session.objectId
	var newid = Session.objectId + '';
	while (newid.length < 5) {
        newid = '0' + newid;
    }
	// increment object id
	Session.objectId++;
	// return new id
	return newid;
}

// SESSION DATA
function session() {
	// session id
	this.sessionId = "S-" + (new Date().getTime());
	// generate object id (between 0 and 999
	this.objectId = Math.floor(Math.random()*1000);
	// log
	this.initLog = initLog;
	this.log = log;
	// data from the triplestore
	this.data = [];
}