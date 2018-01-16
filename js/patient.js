/*
   Copyright 2016-2017, Guillermo Vega-Gorgojo
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

function showPatient(uri) {
	// init view
	$.mobile.loading('show');

	// get patient data
	var pdata = _.find(Session.data, function(el) { return el.uri === uri; });

	// not available
	if (pdata === undefined) { // request the data for the patient
		gatherIndividualData(uri, function() {
			// get the data
			pdata = _.find(Session.data, function(el) { return el.uri === uri; });
			// set an id
			pdata.id = newObjectId();
			// check if it is a valid patient
			if (pdata.types === undefined || 
					_.find(pdata.types, function(el) { return el === "http://data.ahus.no/rd/pasient"; }) === undefined) {
				// go to the list patients page
				$.mobile.pageContainer.pagecontainer("change", "#patients", {
					transition : 'none'
				});
			}
			else {
				// render patient
				renderPatient(pdata); 		
			}
		});
	}
	else if (pdata.rendered == true) { // already rendered
		$.mobile.loading('hide');
		// existing results page
		$.mobile.changePage('#' + pdata.id, {
			transition : 'none'
		});
	}
	else { // data available, but not rendered
		// render patient
		renderPatient(pdata);
	}
}

function renderPatient(pdata) {
	// set the patient as rendered
	pdata.rendered = true;
	// hide the spinner
	$.mobile.loading('hide');
		
	var data = {
        "pinfo": dict.pinfo, // "Personal information"
        "logout": dict.logout,
    	"name": getFirstItem(pdata, "literals", "http://www.w3.org/2000/01/rdf-schema#label"), //"Olaf Gundar",
    	"image": getFirstItem(pdata, "outlinks", "http://data.ahus.no/rd/passfoto"),// "images/patient.png",
		"dict_image" : dict.image,
	    "dict_PatientPhoto" : dict.patientPhoto,
	    "rows": [
        	{ "cell0": dict.firstname, 
        		"cell1": getFirstItem(pdata, "literals", "http://xmlns.com/foaf/0.1/givenName"), //"Olaf",
        		"cell2": dict.surname, 
        		"cell3": getFirstItem(pdata, "literals", "http://xmlns.com/foaf/0.1/familyName")}, //"Gundar"},
        	{ "cell0": dict.nid, 
        		"cell1": getFirstItem(pdata, "literals", "http://data.ahus.no/rd/fodselsnr"), //"norwegian id",
        		"cell2": dict.birthdate, 
        		"cell3": getDate(getFirstItem(pdata, "literals", "http://data.ahus.no/rd/fodselsdato"))}, //"1991-10-24"}
        	{ "cell0": dict.gender, 
        		"cell1": getFirstItem(pdata, "literals", "http://xmlns.com/foaf/0.1/gender"), //"M",
        		"cell2": "", 
        		"cell3": ""}
        ]
    };
    // photo undefined?
    if (data.image === null || data.image === undefined)
    	data.image = "images/patient.png";

	var pinfoTemplate =
		'<div class="ui-grid-a"> \
			<div class="ui-block-a" style="width:140px;"> \
				<ul data-role="listview" data-inset="true" \
				 data-divider-theme="b" data-mini="true" > \
					<li data-role="list-divider">{{dict_image}}</li> \
					<center> \
					<img src="{{image}}" alt="{{dict_PatientPhoto}}" style="width:140px;"> \
					</center> \
				</ul> \
			</div> \
			<div class="ui-block-b" style="width:1%"></div> \
			<div class="ui-block-c float-right"> \
				<ul data-role="listview" class="facet" data-inset="true" \
				 data-mini="true"> \
					<li data-role="list-divider">{{pinfo}}</li> \
					{{#rows}} \
						<li data-role="fieldcontain"> \
							<div class="normal-block">{{cell0}}</div> \
							<div class="value-block">{{cell1}}</div> \
							<div class="normal-block">{{cell2}}</div> \
							<div class="value-block">{{cell3}}</div> \
							<div class="clear"></div> \
						</li> \
					{{/rows}} \
				</ul> \
			</div> \
		</div>';

    // now it can be reused in every page
    data.pinfoMarkup = Mustache.render(pinfoTemplate, data);
	
	// complete mark up for the patient page
	data.id = pdata.id,
	data.uri = pdata.uri,
	data.back = dict.back; // "Back"
	data.home = dict.home; // "Home"
	data.createoperation = dict.createoperation;
	data.tabOperation = dict.tabOperation;
	data.tabCritic = dict.tabCritic;
	data.tabProcesses = dict.tabProcesses;
	data.tabMeasures = dict.tabMeasures;
	data.tabReports = dict.tabReports;
	data.nocriticalinfo = dict.nocriticalinfo;
	
	/* TODO by default we go to the planned operation, but:
		- maybe there is no operation planned, what to do here?
		- is it possible for a patient to have several operations planned?
		- the initial screen with the list of patients may reflect which patients have operations planned
	*/
	
	// prepare template
	var template =
		'<div data-url="n" data-role="page" id="{{id}}" uri="{{uri}}" class="page" data-theme="b"> \
			<div data-role="header" data-id="myheader" data-position="fixed" > \
				<h1>{{name}}</h1> \
				<a href="#patients" class="ui-btn-left" data-inline="false" data-role="button" \
						data-icon="home">{{home}}</a> \
				<a href="#" class="ui-btn-right logout" data-inline="false" data-role="button" \
						data-icon="power">{{logout}}</a> \
			</div> \
			<div data-role="content"> \
				{{{pinfoMarkup}}} \
				<div class="clear"></div> \
				<div id="tabs-{{id}}" data-role="tabs"> \
					<div data-role="navbar"> \
						<ul> \
						  <li class="ptab"><a href="#operation" class="ui-btn-active">{{tabOperation}}</a></li> \
						  <li class="ptab"><a href="#critic">{{tabCritic}}</a></li> \
						  <li class="ptab"><a href="#processes">{{tabProcesses}}</a></li> \
						  <li class="ptab"><a href="#measures">{{tabMeasures}}</a></li> \
						  <li class="ptab"><a href="#reports">{{tabReports}}</a></li> \
						</ul> \
					</div> \
					<div id="operation" class="ui-content"> \
						<a href="#" class="operation" data-role="button" data-mini="true" data-inline="true" data-theme="e">{{createoperation}}</a> \
					</div> \
					<div id="critic" class="ui-content"> \
						<h2>{{nocriticalinfo}}</h2> \
					</div> \
					<div id="processes" class="ui-content"> \
						<h2>Pasientkontakter</h2> \
					</div> \
					<div id="measures" class="ui-content"> \
						<h2>Pasientmålinger og diagnostiske tester</h2> \
					</div> \
					<div id="reports" class="ui-content"> \
						<h2>Pasientrapporter</h2> \
					</div> \
				</div> \
			</div> \
		</div>';

	// generate the mark-up	
	var content = $(Mustache.render(template, data));
	
	//append it to the page container
	content.appendTo($.mobile.pageContainer);
	$.mobile.pageContainer.pagecontainer("change", "#"+data.id, {
		transition : 'none'
	});
	
	// disable critic info tab for now
	//$("#tabs-"+data.id).tabs("disable", 1 );
		
	// handler for the tabs to load the content under demand
	$("#tabs-"+data.id).tabs({
		activate: function(event, ui) {
			if (ui.newPanel.selector == "#measures") {
				if (pdata.hasMeasures === undefined) {			
					$.mobile.loading('show');							
					gatherPatientMeasures(pdata, function() {
						$.mobile.loading('hide');
						// there are measures (and rendered)
						pdata.hasMeasures = true;
						pdata.renderedMeasures = true;
						// set the new content...
						setMeasuresMarkup(data.id, pdata);					
					});		
				}
				else if (pdata.renderedMeasures === undefined) {
					pdata.renderedMeasures = true;
					// set the new content...
					setMeasuresMarkup(data.id, pdata);
				}				
       		}
       		if (ui.newPanel.selector == "#critic") {
				if (pdata.hasCritic === undefined) {			
					$.mobile.loading('show');							
					gatherAllCriticalInfoDocs(pdata, function() {
						$.mobile.loading('hide');
						// there is critic data (and rendered)
						pdata.hasCritic = true;
						pdata.renderedCritic = true;
						// set the new content...
						setCriticMarkup(data.id, pdata);					
					});		
				}
				else if (pdata.renderedCritic === undefined) {
					pdata.renderedCritic = true;
					// set the new content...
					setCriticMarkup(data.id, pdata);
				}				
       		}       		
       		if (ui.newPanel.selector == "#processes" && pdata.hasProcesses === undefined) {
				$.mobile.loading('show');
				gatherCollectionData('patientProcesses', pdata, function() {
					$.mobile.loading('hide');
					// there are processes...
					pdata.hasProcesses = true;
					// set the new content...
					setProcessesMarkup(data.id, pdata);
				});
       		}
       		if (ui.newPanel.selector == "#reports" && pdata.hasDocs === undefined)
				renderDocs(data.id, pdata);
    	}
	});
	
	// handler for the operationsmelding
	$("#tabs-"+data.id+" .operation").on("click", function(event) {
		$.mobile.loading('show');
		// prepare callback when all the data is gathered
		var callback = function() {
			$.mobile.loading('hide');
			pdata.hasMeasures = true;
			pdata.hasCritic = true;
			pdata.hasInnkomst = true;
			renderOperation(data.id, pdata);
			// handler for viewing the latest inkommst
			$("#tabs-"+data.id+" #operation a[did]").on("click", function(event) {
				// show doc
				renderDoc(pdata.latestInnkomst);
			});
		};		
		// make doc requests if necessary
		var docrequests = [];
		if (pdata.hasMeasures === undefined)
			docrequests = _.union(docrequests, gatherAllMeasureDocs(pdata));
		if (pdata.hasCritic === undefined)
			docrequests = _.union(docrequests, gatherAllCriticalInfoDocs(pdata));
		if (pdata.hasInnkomst === undefined)
			docrequests.push( gatherLatestInnkomstDocs(pdata) );
		var defer = $.when.apply($, docrequests);		
		// triplestore requests if necessary with the callback
		if (pdata.hasMeasures === undefined)
			gatherCollectionData('patientMeasures', pdata, function() {
				defer.done(callback);	
			});		
		else	// not necessary, just make the callback
			defer.done(callback);
	});
}

function gatherPatientMeasures(pdata, callback) {
	var datready = false;
	var docready = false;	
	// request measures from the triplestore
	gatherCollectionData('patientMeasures', pdata, function() {
		datready = true;
		if (docready == true) 
			callback();
	});
	// request measures from the docs
	gatherAllMeasureDocs(pdata, function() {
		docready = true;
		if (datready == true) 
			callback();	
	});
}


function renderDocs(id, pdata) {
	$.mobile.loading('show');
	delete pdata.docsError;
	gatherPatientDocs(pdata, function() {
		$.mobile.loading('hide');
		// there are documents...
		pdata.hasDocs = true;
		// set the new content...
		var dmarkup = getDocsMarkup(pdata);
		$("#tabs-"+id+" #reports").html( dmarkup );				
		$("#tabs-"+id+" #reports").enhanceWithin();
		// sorting
		//$("#tabs-"+data.id+" #reports").find("table").tablesorter( {sortList: [[0,1]]} );						
		
		// handler for viewing a document
		$("#tabs-"+id+" #reports a[did]").on("click", function(event) {
			// get did
			var did = $(this).attr("did");
			// get document data
			var ddata = _.find(pdata.docs, function(doc) { return doc.did.toString() === did.toString(); });
			// show doc
			renderDoc(ddata);
		});
		
		// support for paging
		var npages = Math.floor(pdata.docResponse.numFound/10) +1;
		var page = Math.floor(pdata.docResponse.start/10);
		if ( npages>0 && page==0 ) // disable left button
			$("#tabs-"+id+" #reports .pageLeft").addClass('ui-disabled');
		else if ( npages>0 && page==npages-1 )  // disable right button
			$("#tabs-"+id+" #reports .pageRight").addClass('ui-disabled');
		$("#tabs-"+id+" #reports .pageLeft").on("click", function(event) {
			// change query to ask for the prev page
			pdata.docQuery.start = pdata.docResponse.start - 10;
			if (pdata.docQuery.start < 0)
				pdata.docQuery.start = 0;
			// remove results and variable
			delete pdata.hasDocs;
			delete pdata.docs;				
			// ask for results again
			renderDocs(id, pdata);
			//$("#tabs-"+data.id+' a[href="#critic"]').click();
		});
		$("#tabs-"+id+" #reports .pageRight").on("click", function(event) {
			// change query to ask for the following page
			pdata.docQuery.start = pdata.docResponse.start + 10;
			// remove results and variable
			delete pdata.hasDocs;
			delete pdata.docs;				
			// ask for results again
			renderDocs(id, pdata);
		});
		
		// filter docs
		$("#tabs-"+id+" #reports .docsearch").on("click", function(event) {
			// get all the filters			
			var query = $("#tabs-"+id+" #reports .query").val();
			var mindate = $("#tabs-"+id+" #reports .mindate").val();
			var maxdate = $("#tabs-"+id+" #reports .maxdate").val();
			var doctype = $("#tabs-"+id+" #reports .doctype").find(":selected").val();
			// check if whitespace
			if (!/\S/.test(query)) {
				query = "";
				$("#tabs-"+id+" #reports .query").val("");
			}
			// format dates
			mindate = getDate(mindate);
			maxdate = getDate(maxdate);
			if (mindate == null)
				$("#tabs-"+id+" #reports .mindate").val("");
			if (maxdate == null)
				$("#tabs-"+id+" #reports .maxdate").val("");				
			// check if something has changed
			var changes = false;
			if (query !== pdata.userQuery.query || doctype !== pdata.userQuery.doctype 
				|| mindate !== pdata.userQuery.mindate || maxdate !== pdata.userQuery.maxdate) {
				// changes! set the new user query object
				pdata.userQuery.query = query;
				pdata.userQuery.doctype = doctype;
				pdata.userQuery.mindate = mindate;
				pdata.userQuery.maxdate = maxdate;
				// check if doctype is still disabled
				pdata.userQuery.disabledSelected = $("#tabs-"+id+" #reports .doctype").find(":selected").is(':disabled');
				// update the query and search results
				// fresh query
				delete pdata.docQuery.start;
				// set query parameter
				if (pdata.userQuery.query == "") {
					pdata.docQuery.q = '*:*';
					delete pdata.docQuery.hl;
					delete pdata.docQuery["hl.fl"]; 
				}
				else {
					pdata.docQuery.q = 'status_text:'+query;
					pdata.docQuery.hl = true;
					pdata.docQuery["hl.fl"] = '*';
				}
				// rest of parameters in the fq field
				pdata.docQuery.fq = [];
				// include pid
				pdata.docQuery.fq.push("pid:"+getFirstItem(pdata, "literals", "http://data.ahus.no/rd/personid"));
				// doc type
				if (pdata.userQuery.doctype !== "")
					pdata.docQuery.fq.push("dtype:"+pdata.userQuery.doctype);
				// dates
				if (pdata.userQuery.mindate != null || pdata.userQuery.maxdate != null) {
					var dfq = "OPPRETTETTID:[";
					if (pdata.userQuery.mindate == null)
						dfq += "*";
					else
						dfq += pdata.userQuery.mindate+"T00:00:00Z";
					dfq += " TO ";
					if (pdata.userQuery.maxdate == null)
						dfq += "*";
					else
						dfq += pdata.userQuery.maxdate+"T23:59:59Z";
					dfq += "]";
					pdata.docQuery.fq.push(dfq);
				}
				// filter docs!
				renderDocs(id, pdata);
			}
		});
		
		// adjust min-max dates
		$("#tabs-"+id+" #reports .mindate").focusin(function() {
			// get the value of the maxdate input
			var maxval = $("#tabs-"+id+" #reports .maxdate").val();
			maxval = getDate(maxval);
			// if not valid, get the maximum allowed
			if (maxval == null)
				maxval = getDate(pdata.docInfo.max);
			// set the max property
			$(this).attr("max", maxval);
		});
		$("#tabs-"+id+" #reports .maxdate").focusin(function() {
			// get the value of the mindate input
			var minval = $("#tabs-"+id+" #reports .mindate").val();
			minval = getDate(minval);
			// if not valid, get the minimum allowed
			if (minval == null)
				minval = getDate(pdata.docInfo.min);
			// set the max property
			$(this).attr("min", minval);
		});
		
		// detect enter key in input
		$("#tabs-"+id+" #reports input").keydown(function(e) {
    		if (e.keyCode == 13) {
	        	e.preventDefault();
	        	// click in the search button
	        	$("#tabs-"+id+" #reports .docsearch").click();
		    }
		});
		
	}, function() { // callback in case of error (basically render a list of 0 documents)
		$.mobile.loading('hide');		
		pdata.docsError = true;
		// set the new content...
		var dmarkup = getDocsMarkup(pdata);
		$("#tabs-"+id+" #reports").html( dmarkup );				
		$("#tabs-"+id+" #reports").enhanceWithin();				
	});
}


function renderOperation(id, pdata) {
	$("#tabs-"+id+" #operation").html( getOperationMarkup(pdata) );
	$("#tabs-"+id+" #operation").enhanceWithin();	
	// sparklines
	$('.sparkline').not( '[type="bmi"]' ).not( '[type="temp"]' ).sparkline('html', {
		type: 'line', 
		fillColor: null,
		lineColor: 'black',
		spotColor: 'red', 
		minSpotColor: 'blue',
		maxSpotColor: 'blue'});
	$('.sparkline[type="bmi"]').sparkline('html', {
		type: 'line', 
		fillColor: null,
		spotColor: 'red',
		lineColor: 'black',
		spotColor: 'red', 
		minSpotColor: 'blue',
		maxSpotColor: 'blue',
		normalRangeMin: 18.5, 
		normalRangeMax: 25});
	$('.sparkline[type="temp"]').sparkline('html', {
		type: 'line', 
		fillColor: null,
		spotColor: 'red',
		lineColor: 'black',
		spotColor: 'red', 
		minSpotColor: 'blue',
		maxSpotColor: 'blue',
		normalRangeMin: 36, 
		normalRangeMax: 37.5});
		
	// fill the form with existing value
	$("#tabs-"+id+" .import-free").on("click", function(event) {
		// get value
		var val = $(this).attr("value");
		// set the value in the form
		$(this).closest("li").find("input").val(val);
	});
	// fill the select option
	$("#tabs-"+id+" .import-select").on("click", function(event) {
		// get value
		var val = $(this).attr("value");
		// set the appropriate select option
		$(this).closest("li").find('select option[value="'+val+'"]').prop('selected', true);
		// refresh
		$(this).closest("li").find("select").selectmenu("refresh");
	});
		
	// go to measures
	$("#tabs-"+id+" .gotomeasures").on("click", function(event) {
		// go to measures
		$("#tabs-"+id+' a[href="#measures"]').click();
		
		// expand collapsible based on the "goto" atribute of the button
		var gototag = $(this).attr("goto");
		if (gototag === "bp_high" || gototag === "bp_low") gototag = "bp"; // special case!
		var collapsible =  $("#tabs-"+id+' .'+gototag).closest("div[data-role='collapsible']");
		collapsible.collapsible("expand");	
		
		// go to the collapsible
		var posicion = collapsible.offset().top;
    	$.mobile.silentScroll( posicion );
	});
		
	// go to critic
	$("#tabs-"+id+" .gotocritic").on("click", function(event) {
		// go to critic
		$("#tabs-"+id+' a[href="#critic"]').click();		
		
		// go to the right place
		var posicion = $("#tabs-"+id+' .'+$(this).attr("goto")).offset().top;
    	$.mobile.silentScroll( posicion );
	});
}

function setCriticMarkup(id, pdata) {
	$("#tabs-"+id+" #critic").html( getCriticalInfoMarkup(pdata) );
	$("#tabs-"+id+" #critic").enhanceWithin();
	// handler for viewing a document
	$("#tabs-"+id+" #critic a[did]").on("click", function(event) {
		// get did
		var did = $(this).attr("did");
		// get snippet
		var snippet = $(this).attr("snippet");
		// get document data
		var ddata = _.find(pdata.docMeasures.docs, function(doc) { return doc.did.toString() === did.toString(); });
		ddata.snippet = snippet;	
		// show doc
		renderDoc(ddata);
	});
}

function setProcessesMarkup(id, pdata) {
	$("#tabs-"+id+" #processes").html( getProcessListMarkup(pdata) );
	$("#tabs-"+id+" #processes").enhanceWithin();					
	// handler for processes
	$("#tabs-"+id+" .process").on("click", function(event) {
		// set the new content...
		$("#tabs-"+id+" #processes").html( getProcessMarkup($(this).attr("uri")) );
		$("#tabs-"+id+" #processes").enhanceWithin();
		// handler for back2processes
		$("#tabs-"+id+" .back2processes").on("click", function(event) {			
			setProcessesMarkup(id, pdata);
		});
	});
}

function setMeasuresMarkup(id, pdata) {
	$("#tabs-"+id+" #measures").html( getMeasuresMarkup(pdata) );			
	// render the measure charts and hide				
	var cdata = getCharts(pdata);
	_.each(cdata, function(ch) {
		var ctx = $("#"+ch.id);
		new Chart(ctx, ch.chart);
		var lictx = ctx.closest("li");
		lictx.hide();
		// handler for the charts/data
		var ul = $("#"+ch.id).closest("ul");
		ul.prev(".chart").on("click", function(event) {
			// switch 
			if (lictx.is(":visible")) {
				lictx.nextAll().show();
				lictx.hide();
				$(this).buttonMarkup({ icon: "gear" });
				$(this).text(dict.seechart);
			}
			else {
				lictx.nextAll().hide();								
				lictx.show();
				$(this).buttonMarkup({ icon: "bars" });
				$(this).text(dict.seedata);
			}
		});
	});		
	// reconstruct
	$("#tabs-"+id+" #measures").enhanceWithin();
	
	// handler for viewing a document
	$("#tabs-"+id+" #measures a[did]").on("click", function(event) {
		// get did
		var did = $(this).attr("did");
		// get snippet
		var snippet = $(this).attr("snippet");
		// get document data
		var ddata = _.find(pdata.docMeasures.docs, function(doc) { return doc.did.toString() === did.toString(); });
		ddata.snippet = snippet;	
		// show doc
		renderDoc(ddata);
	});
}