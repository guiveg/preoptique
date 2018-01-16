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

function gatherLatestInnkomstDocs(pdata, callback, failfunc) {
	// obtain latest Innkomst doc if any
	var qdata = {
			wt: 'json',
			fq: ['pid:'+getFirstItem(pdata, "literals", "http://data.ahus.no/rd/personid"), 'dtype:innkomst'],
			//fq: 'dtype:innkomst',
			fl: 'did,status_text,dtype,avdid,OPPRETTETTID', //  return did, text, doc type, department, timestamp and measure value/info
			q: '*:*', // ask about the documents with a specific measure
			rows: 10,
			sort: 'score desc, OPPRETTETTID desc'
		};	

	// request docs with measures
	var req = Adocs.getDocs(qdata, function(datos) {
		// log		
		Session.log("REPORTS", qdata.fq+" - "+qdata.q, "SUCCESS");
		
		// get the latest Innkomst doc if any
		pdata.latestInnkomst = null;
		if ( datos.response.docs.length > 0 ) {
			// this is the doc
			var doc = datos.response.docs[0];			
			// format timestamp			
			if (doc.OPPRETTETTID != undefined)
				doc.OPPRETTETTID = getDatetime(doc.OPPRETTETTID);
			// store it
			pdata.latestInnkomst = doc;
		}
		// done
		if (callback) callback();
	}, failfunc);
	
	return req;
}

function gatherAllCriticalInfoDocs(pdata, callback, failfunc) {
	// requests
	var requests = [];	
	// extract critical info from the documents
	var pars = ["allergy", "smoking"];
	_.each(pars, function(par) {
		requests.push(gatherMeasureDocs(par, false, pdata, null, failfunc));
	});
	// process callback if included
	if (callback !== undefined) {
		// when all calls are ready we call the callback
		var defer = $.when.apply($, requests);
		defer.done(callback);
	}
	return requests;
}

function gatherAllMeasureDocs(pdata, callback, failfunc) {
	// requests
	var requests = [];	
	// extract each measure from the documents
	var measures = ["asa", "blood_pulse", "body_temperature", "body_weight", "body_height", "bmi", "blood_pressure"];
	_.each(measures, function(meas) {
		requests.push(gatherMeasureDocs(meas, true, pdata, null, failfunc));
	});
	// process callback if included
	if (callback !== undefined) {
		// when all calls are ready we call the callback
		var defer = $.when.apply($, requests);
		defer.done(callback);
	}
	return requests;
}

function gatherMeasureDocs(measure, ismeasure, pdata, callback, failfunc) {
	// initialization of measures from documents
	if (pdata.docMeasures == undefined)
		pdata.docMeasures = {};
	if (pdata.docMeasures.docs == undefined)
		pdata.docMeasures.docs = [];
	// special case
	if (measure === "blood_pressure") {
		pdata.docMeasures.blood_pressure_high = [];
		pdata.docMeasures.blood_pressure_low = [];
	}
	else
		pdata.docMeasures[measure] = [];
		
	var mval = ismeasure? measure+'_value' : measure+'_status';
		
	
	// get documents with some measures
	var qdata = {
			wt: 'json',
			fq: 'pid:'+getFirstItem(pdata, "literals", "http://data.ahus.no/rd/personid"),
			fl: 'did,status_text,dtype,avdid,OPPRETTETTID,'+measure+'_info,'+mval, //  return did, text, doc type, department, timestamp and measure value/info
			q: measure+'_info:*', // ask about the documents with a specific measure
			rows: 10000000, // no limit
			sort: 'score desc, OPPRETTETTID desc'
		};				
	
	// request docs with measures
	var req = Adocs.getDocs(qdata, function(datos) {
		// log		
		Session.log("REPORTS", qdata.fq+" - "+qdata.q, "SUCCESS");
		
		// get list of dids and include documents in pdata.docMeasures.docs
		var dids = []
		_.each( datos.response.docs, function (doc) {
			// get did
			dids.push(doc.did);
			// include the doc if not existing
			if (_.find(pdata.docMeasures.docs, function(el) { return el.did === doc.did; }) == undefined) {
				// include the document found
				pdata.docMeasures.docs.push(doc);				
			}
			// get the values and snippets
			for (var i=0; i<doc[mval].length; i++) {
				var value = doc[mval][i];
				var snippet = doc[measure+'_info'][i];
				// only continue if there are values in both fields
				if (value != undefined && snippet != undefined) {
					// special case for blood_pressure
					if (measure === "blood_pressure" && value.split("/").length == 2) {
						var val1 = value.split("/")[0].replace(/[^0-9-,\.]/g, ''); // just get the numbers, commas and dots
						var val2 = value.split("/")[1].replace(/[^0-9-,\.]/g, ''); // just get the numbers, commas and dots
						// continue if the measures are ok
						if (!isNaN(parseFloat(val1)) && !isNaN(parseFloat(val2))) {
							val1 = parseFloat(val1);
							val2 = parseFloat(val2);
							var objm1 = {
								did: doc.did,
								measure: val1,
								snippet: snippet								
							};
							pdata.docMeasures.blood_pressure_high.push(objm1);
								var objm2 = {
								did: doc.did,
								measure: val2,
								snippet: snippet								
							};
							pdata.docMeasures.blood_pressure_low.push(objm2);
						}					
					}
					else { // normal case
						var objm = {
							did: doc.did,
							measure: value,
							snippet: snippet								
						};
						pdata.docMeasures[measure].push(objm);					
					}			
				}
			}
		});
		// done
		if (callback) callback();
	}, failfunc);
						
	return req;
}


function gatherPatientDocs(pdata, callback, failfunc) {	
	// init documents in the patient object
	pdata.docs = [];
	
	// prepare query data object if it does not exists
	if (pdata.docQuery == undefined) {
		pdata.docQuery = {
			wt: 'json',
			fq: 'pid:'+getFirstItem(pdata, "literals", "http://data.ahus.no/rd/personid"),
			fl: 'did,status_text,dtype,avdid,OPPRETTETTID', // return did, text, doc type, department and timestamp
			q: '*:*',
			rows: 10, // always 10
			sort: 'score desc, OPPRETTETTID desc'
		};
		
		// init userQuery object
		pdata.userQuery = {};
		pdata.userQuery.query = "";
		pdata.userQuery.doctype = "";
		pdata.userQuery.mindate = null;
		pdata.userQuery.maxdate = null;
		pdata.userQuery.disabledSelected = true;
	}
	
	// get info about the document types and min/max timestamp the first time
	if (pdata.docInfo == undefined) {
		pdata.docInfo = {};		
		// modify the query object to gather the required info in the same query
		pdata.docQuery.stats = "on";
		pdata.docQuery['stats.field'] = "OPPRETTETTID";		
		pdata.docQuery.facet = "on";
		pdata.docQuery['facet.field'] = "dtype";
	}
	else { // remove facets and stats from the query object
		delete pdata.docQuery.stats;
		delete pdata.docQuery['stats.field'];
		delete pdata.docQuery.facet;
		delete pdata.docQuery['facet.field'];		
	}
	
	// request documents of a patient
	var req = Adocs.getDocs(pdata.docQuery, function(datos) {
		// log		
		Session.log("REPORTS", pdata.docQuery.fq+" - "+pdata.docQuery.q, "SUCCESS");
		
		// include doc response data
		pdata.docResponse = {
			numFound: datos.response.numFound,
			start: datos.response.start		
		};
		
		// include stats if available
		if (datos.stats !== undefined && datos.stats.stats_fields.OPPRETTETTID !== undefined) {
			pdata.docInfo.min = datos.stats.stats_fields.OPPRETTETTID.min;
			pdata.docInfo.max = datos.stats.stats_fields.OPPRETTETTID.max;
		}
		
		// include dtype values if available
		if (datos.facet_counts !== undefined && datos.facet_counts.facet_fields.dtype !== undefined) {
			pdata.docInfo.dtype = [];
			var values = datos.facet_counts.facet_fields.dtype;
			for (var i=0; i<values.length/2; i++) {
				if (values[2*i+1] > 0)
					pdata.docInfo.dtype.push(values[2*i]);
			}
		} 
		
		// include documents in pdata	
		_.each( datos.response.docs, function ( doc ) {
			if (doc.status_text !== undefined) {
				// add a snippet of the document
				var textl = doc.status_text.length;
				var maxl = 60;
				if (textl>maxl)
					textl = maxl;
				doc.snippet = doc.status_text.substring(0, textl);
				if (textl==maxl)
					doc.snippet += "...";
			}

			// format timestamp			
			if (doc.OPPRETTETTID != undefined)
				doc.OPPRETTETTID = getDatetime(doc.OPPRETTETTID);
			
			// process highlighting of the doc (if available)
			if (datos.highlighting != undefined) {			
				doc.highlighting = datos.highlighting[doc.did];	
				if (doc.highlighting != undefined) {
					for (var key in doc.highlighting) {
						// substitute the snippet in case of the status_text field
						if (key === "status_text")
							doc.snippet = doc.highlighting[key];
						else // otherwise, substitute existing element
							doc[key] = doc.highlighting[key];
					}
				}
			}
			
			// include the document found
			pdata.docs.push(doc);
		});
		
		// callback
		callback();
	}, failfunc);
	
	// return request
	return req;
}

function getDocsMarkup(pdata) {
	// data object for the template
	var data = { 
        //"viewcolumns": dict.columnsToDisplay, //"Columns to display..."
		docelements: [dict.table.timestamp, dict.table.type, dict.table.department, dict.table.excerpt, dict.table.seedoc],
		docs: pdata.docs,
		docsError: pdata.docsError,
		//userQuery: pdata.userQuery.query,
		nopatdocs: dict.table.nopatdocs,
		patdocs: dict.table.patdocs,
		nodocrep: dict.table.nodocrep,
		//filter: dict.table.filter,
		//filterdocs: dict.table.filterdocs
    };    
    if (data.docsError == undefined) {
    	data.paging = pdata.docResponse.numFound > 10;
    	data.pages = Math.floor(pdata.docResponse.numFound/10) +1;
    	data.pageAct = Math.floor(pdata.docResponse.start/10) +1;
    	data.numFound = pdata.docResponse.numFound;
    }

	// prepare filter bar
	data.filterbar;
	data.querytext;
	if (pdata.docs !== undefined) {		
		var marg = 'style="margin-right: 15px;"';		
		// date filters
		if (pdata.docInfo.min !== undefined && pdata.docInfo.max !== undefined) {
			//console.log("Min date: "+getDate(pdata.docInfo.min));
			//console.log("Max date: "+getDate(pdata.docInfo.max));
			var min = getDate(pdata.docInfo.min);
			var max = getDate(pdata.docInfo.max);
			var minval = pdata.userQuery.mindate == null? "" : getDate(pdata.userQuery.mindate);
			var maxval = pdata.userQuery.maxdate == null? "" : getDate(pdata.userQuery.maxdate);
			data.filterbar = 
				'<div class="cellMini" '+marg+'><h4>Fra</h4></div> \
				<div class="cellMini" '+marg+'><input class="mindate" type="date" \
					value ="'+minval+'" min="'+min+'" max="'+max+'"></div> \
				<div class="cellMini" '+marg+'><h4>Til</h4></div> \
				<div class="cellMini" '+marg+'><input class="maxdate" type="date" \
					value ="'+maxval+'" min="'+min+'" max="'+max+'"></div>';
		}
		// document type filter if necessary
		if (pdata.docInfo.dtype !== undefined && pdata.docInfo.dtype.length > 1) {
			var dissel = pdata.userQuery.disabledSelected? "selected" : "";
			var allsel = (!pdata.userQuery.disabledSelected && pdata.userQuery.doctype === "")? "selected" : "";
			data.filterbar += 
				'<div class="cellMini" '+marg+'> \
					<select class="doctype" data-theme="c"> \
						<option value="" disabled '+dissel+' >'+dict.table.doctype+'</option> \
						<option value="" '+allsel+' >'+dict.table.alldocs+'</option>';
			_.each(pdata.docInfo.dtype, function(type) {
				var sel = pdata.userQuery.doctype === type? "selected" : "";
				data.filterbar += '<option value="'+type+'" '+sel+' >'+type+'</option>';
			});
			data.filterbar += 
					'</select> \
				</div>';
		}
		// text box and search button
		data.filterbar += 
			'<div style="width:300px;vertical-align:middle;display:inline-block;"> \
				<input class="query" placeholder="'+dict.table.filterdocs+'" value="'+pdata.userQuery.query+'" type="search"> \
			</div> \
			<a href="#" class="docsearch" style="display:inline-block;" \
				data-mini="true" data-inline="true" data-role="button" data-icon="search" data-theme="c">'
				+dict.table.filter+'</a>';
		
		// query text
		if (pdata.userQuery.mindate != null)
			data.querytext = "fra "+pdata.userQuery.mindate;
		if (pdata.userQuery.maxdate != null) {
			if (data.querytext == undefined)
				data.querytext = "";
			else
				data.querytext += " ";
			data.querytext += "til "+pdata.userQuery.maxdate;
		}
		if (pdata.userQuery.doctype !== "") {
			if (data.querytext == undefined)
				data.querytext = "";
			else
				data.querytext += "; ";
			data.querytext += dict.table.doctype.toLowerCase()+": "+pdata.userQuery.doctype;
		}
		if (pdata.userQuery.query !== "") {
			if (data.querytext == undefined)
				data.querytext = "";
			else
				data.querytext += "; ";
			data.querytext += dict.table.query.toLowerCase()+": "+pdata.userQuery.query;
		}		
	}	

	var template =
		'{{#docsError}}<h2>{{nodocrep}}</h2>{{/docsError}} \
	{{^docsError}} \
		{{^docs.length}} \
			<h2>{{nopatdocs}}{{#querytext}}&emsp;&emsp;&emsp;({{{querytext}}}){{/querytext}}</h2> \
			{{#querytext}} \
			<div> \
				{{{filterbar}}} \
			<\div> \
			{{/querytext}} \
		{{/docs.length}} \
		{{#docs.length}} \
			<h2>{{numFound}} {{patdocs}}{{#querytext}}&emsp;&emsp;&emsp;({{{querytext}}}){{/querytext}}</h2> \
			{{#paging}} \
			<div> \
				{{{filterbar}}} \
				<a href="#" style="float:right;" class="pageRight" data-role="button" data-mini="true" data-inline="true" data-icon="carat-r" data-iconpos="notext" data-theme="c" >Right</a> \
				<h3 style="float:right;">Side {{pageAct}} av {{pages}}</h3> \
				<a href="#" style="float:right;" class="pageLeft" data-role="button" data-mini="true" data-inline="true" data-icon="carat-l" data-iconpos="notext" data-theme="c" >Left</a> \
			<\div> \
			{{/paging}} \
			{{^paging}} \
			<div> \
				{{{filterbar}}} \
			<\div> \
			{{/paging}} \
			<table data-role="table" \
				class="ui-body-c ui-shadow ui-corner-all table-stripe ui-responsive" > \
				<thead> \
					<tr class="ui-bar-a"> \
						{{#docelements}} \
							<th var="{{.}}" data-priority="1">{{.}}</th> \
						{{/docelements}} \
					</tr> \
				</thead> \
				<tbody> \
					{{#docs}} \
						<tr> \
							<td>{{{OPPRETTETTID}}}</td> \
							<td>{{{dtype}}}</td> \
							<td>{{{avdid}}}</td> \
							<td><i>{{{snippet}}}</i></td> \
							<td><a href="#" did="{{did}}" data-role="button" data-icon="action" data-iconpos="notext" >Rapport</a></td> \
						</tr> \
					{{/docs}} \
				</tbody> \
			</table> \
		{{/docs.length}} \
	{{/docsError}}';
	
	return  Mustache.render(template, data);
}


function renderDoc(ddata) {
	processHighlighting(ddata);

	// generate document markup
	var template =
		'<div data-url="n" data-role="dialog" id="{{id}}" \
				 data-overlay-theme="c" data-theme="b" data-close-btn="none"> \
			<div data-role="header"> \
				<h1>{{{type}}}</h1> \
				<a href="#" class="closedialog ui-btn-right" data-role="button" \
					data-rel="back" data-iconpos="notext" data-icon="delete">close</a> \
			</div> \
			<div data-role="content"> \
				<ul> \
					{{#items}} \
						<li data-role="fieldcontain"> \
							<div class="left-block">{{itemName}}</div> \
							<div class="right-block">{{{itemValue}}}</div> \
							<div class="clear"></div> \
						</li> \
					{{/items}} \
				</ul> \
			</div> \
		</div>';	
				
	var data = {
		"id": "doc-"+ddata.did,
		"type": ddata.dtype,
		"items": [
			{"itemName": dict.table.department, "itemValue": ddata.avdid},
			{"itemName": dict.table.timestamp, "itemValue": ddata.OPPRETTETTID},
			{"itemName": dict.table.contents, "itemValue": ddata.status_text.replace("\n", "<br>")}
			]
	};
	
	// remove previous document page, just in case it was displayed before
	$("#"+data.id).remove();
		
	// generate page content
	var content = $(Mustache.render(template, data));
	
	// generate the mark-up	
	var content = $(Mustache.render(template, data));
	
	//append it to the page container
	content.appendTo($.mobile.pageContainer);
	$.mobile.pageContainer.pagecontainer("change", "#"+data.id, {
		transition : 'none'
	});
}

function processHighlighting(ddata) {
	// clear <em> and </em> tags
	if (ddata.author !== undefined)
		ddata.author = clearEmtags(ddata.author);
	if (ddata.title !== undefined)
		ddata.title = clearEmtags(ddata.title);  
	if (ddata.status_text !== undefined)
		ddata.status_text = clearEmtags(ddata.status_text);
	
	// include highlighting
	if (ddata.highlighting != undefined) {
		for (var key in ddata.highlighting) {
			// get highlighted string
			var cadhl = ddata.highlighting[key][0];
			// set the highlighted string in the document field
			var cadnohl = clearEmtags(cadhl);
			if (typeof ddata[key] === 'string')
				ddata[key] = ddata[key].replace(cadnohl, cadhl);
			else { // array
				for (var i = 0; i < ddata[key].length; i++) {
				    ddata[key][i] = ddata[key][i].replace(cadnohl, cadhl);
				}			
			}
		}
	}	
	else if (ddata.snippet != undefined) { // highlighting of snippet
		var newcad = "<em>"+ddata.snippet+"</em>";
		ddata.status_text = ddata.status_text.replace(ddata.snippet, newcad);
	}
}

function clearEmtags(cad) {
	if (typeof cad === 'string') {
		cad = cad.replace("<em>", "");
		cad = cad.replace("</em>", "");
	}
	else { // it's an array
		for (var i = 0; i < cad.length; i++) {
		    cad[i] = clearEmtags(cad[i]);
		}
	}
	return cad
}