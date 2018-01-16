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

function getProcessMarkup(pruri) {
	// get process object
	var prdata = _.find(Session.data, function(el) { return el.uri === pruri; });
	// get diagnoses (if any)
	var diagnoses = getListObjects(prdata, "outlinks", "http://data.ahus.no/rd/begrunnetI");
	diagnoses = formatMeasures(getDataMeasurements(diagnoses, "http://www.w3.org/2000/01/rdf-schema#label", "http://data.ahus.no/rd/diagnosedato"));
	// get episodes and activities (if any)
	var items = getListObjects(prdata, "inlinks", "http://purl.obolibrary.org/obo/BFO_0000050");
	var episodes = _.filter(items, function(it) {
		return _.contains(it.subtypes, "http://data.ahus.no/rd/omsorgsepisode");
	});
	var activities = _.filter(items, function(it) {
		return _.contains(it.subtypes, "http://data.ahus.no/rd/omsorgsaktivitet");
	});
	// format episodes and activities
	var feps = formatProcessList(episodes);
	var facts = formatProcessList(activities);
	// assign formatted activities to formatted episodes
	_.each(episodes, function(ep) {
		// find the activities
		var lacts = getListUris(ep, "inlinks", "http://purl.obolibrary.org/obo/BFO_0000050");
		// assign formatted activities to the formatted episode
		var fep = _.find(feps, function(el) { return el.uri === ep.uri;} );
		fep.activities = _.filter(facts, function(fact) { return _.contains(lacts, fact.uri); });	
		//fep.activities = _.filter(facts, function(fact) { return _.find(lacts, function(ela) {return ela.uri === fact.uri;}) !== undefined; });	
	});	
	// data object
	var data = {
		"back2processes": dict.back2processes,
		"processinfo": dict.processinfo,
		"diaheading": dict.diagnoses, // "Diagnoses"
		"diagnoses": diagnoses,
		"epactinfo": dict.epactinfo,
		"labelname": dict.labelname,
		"labelstart": dict.labelstart,
		"labelend": dict.labelend,
		"unfinished": dict.unfinished,
		"prname": getFirstItem(prdata, "literals", "http://www.w3.org/2000/01/rdf-schema#label"),
		"start": getFirstItem(prdata, "literals", "http://data.ahus.no/rd/starttidspunkt"),
		"end": getFirstItem(prdata, "literals", "http://data.ahus.no/rd/sluttidspunkt"),
		"episodes": feps,
		"labelactivities": dict.labelactivities,
		"datetimeFunction": function () {
			return function(val, render) {
			    return getDatetime(render(val));
				}
			}
    };
    	
	// template
	var template =
		'<a href="#" class="back2processes" data-role="button" data-mini="true" data-inline="true" data-icon="back" data-theme="c">{{back2processes}}</a> \
		<ul data-role="listview" data-inset="true" data-mini="true"> \
			<li data-role="list-divider" data-theme="a">{{processinfo}}</li> \
			<li data-role="fieldcontain"> \
				<div class="left-block">{{labelname}}</div> \
				<div class="right-block">{{prname}}</div> \
				<div class="clear"></div> \
			</li> \
			<li data-role="fieldcontain"> \
				<div class="normal-block">{{labelstart}}</div> \
				<div class="value-block">{{#datetimeFunction}}{{start}}{{/datetimeFunction}}</div> \
				<div class="normal-block">{{labelend}}</div> \
				{{#end}} \
					<div class="value-block">{{#datetimeFunction}}{{end}}{{/datetimeFunction}}</div> \
				{{/end}} \
				{{^end}} \
					<div class="value-block">{{unfinished}}</div> \
				{{/end}} \
				<div class="clear"></div> \
			</li> \
		</ul> \
		{{#diagnoses.length}}\
			<ul data-role="listview" data-inset="true" data-mini="true"> \
		 		<li data-role="list-divider" data-theme="a">{{diaheading}}</li> \
		 		{{#diagnoses}} \
					<li>{{#datetimeFunction}}{{timestamp}}{{/datetimeFunction}} \
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{value}}</li> \
				{{/diagnoses}} \
			</ul> \
		{{/diagnoses.length}}\
		{{#episodes.length}}\
			<ul data-role="listview" data-inset="true" data-mini="true" > \
				<li data-role="list-divider" data-theme="a">{{epactinfo}}</li> \
				<li> \
				{{#episodes}} \
					<div data-role="collapsible" data-theme="c"> \
						<h4>{{{displabel}}}</h4> \
						<h4>{{label}}</h4> \
						{{#activities.length}} \
							<ul data-role="listview" data-inset="true" data-mini="true" > \
								<li data-role="list-divider" data-theme="a" >{{labelactivities}}</li> \
								{{#activities}} \
									<li>{{{displabel}}}</li> \
								{{/activities}} \
							</ul> \
						{{/activities.length}} \
					</div> \
				{{/episodes}} \
				</li> \
			</ul> \
		{{/episodes.length}}';
	
	// return markup
	return Mustache.render(template, data);	
}

function getProcessListMarkup(pdata) {
	// get processes
	var processes = getListObjects(pdata, "inlinks", "http://data.ahus.no/rd/harPasient");
	// filter out the episodes and activities that use the same property, i.e. just get the processes
	processes = _.filter(processes, function(pr) {
		return _.contains(pr.subtypes, "http://data.ahus.no/rd/omsorgsprosess");
	});
	var data = {
		"hasProcesses": (processes.length > 0),
		"processes": formatProcessList(processes)
    };	
	// template
	var template =
		'{{#hasProcesses}} \
			<h2>Pasientkontakter</h2> \
			<ul data-role="listview" data-inset="true" data-mini="true"> \
				<li data-role="list-divider" data-theme="a">'+dict.patientprocesses+'</li> \
				{{#processes}} \
				{{#end}} \
					<li class="process canceled" data-theme="c" uri="{{uri}}"><a href="#"><h2>{{{displabel}}}</h2></a></li> \
				{{/end}} \
				{{^end}} \
					<li class="process" data-theme="e" uri="{{uri}}"><a href="#"><h2>{{{displabel}}}</h2></a></li> \
				{{/end}} \
				{{/processes}} \
			</ul> \
		{{/hasProcesses}} \
		{{^hasProcesses}} \
			<h2>Ikke pasientkontakter</h2> \
		{{/hasProcesses}}';
	
	// return markup
	return Mustache.render(template, data);
}

function formatProcessList(list) {
	var output = [];
	// include data from each process
	_.each(list, function(el) {
		var item = { "uri": el.uri,
			"label": getFirstItem(el, "literals", "http://www.w3.org/2000/01/rdf-schema#label"),
			"start": getFirstItem(el, "literals", "http://data.ahus.no/rd/starttidspunkt"),
			"end": getFirstItem(el, "literals", "http://data.ahus.no/rd/sluttidspunkt") };
		// create prlabel for displaying purposes
		// start date can be unset
		if (item.start !== null)
			item.displabel = getDate(item.start);
		else 
			item.displabel = dict.notstarted;				
		// end date can be unset				
		if (item.end !== null) 
			item.displabel += '&nbsp;&nbsp;|&nbsp;&nbsp;'
				+ getDate(item.end) + '&nbsp;&nbsp;|&nbsp;&nbsp;' + item.label;
		else 
			item.displabel += '&nbsp;&nbsp;|&nbsp;&nbsp;'
				+ dict.unfinished + '&nbsp;&nbsp;|&nbsp;&nbsp;' + item.label;
		// push element
		output.push(item);
	});	
	// ordering of the data points
	var prunf =  _.filter(output, function(pr) { return pr.end === null; });
	var prf =  _.filter(output, function(pr) { return pr.end !== null; });
	prunf = _.sortBy(prunf, function(o) { return o.start; }).reverse();
	prf = _.sortBy(prf, function(o) { return o.end; }).reverse();
	return prunf.concat(prf);
}