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

function getMeasurementRowMarkup(pdata, row) {
	// get label for the sparkline
	var sparklabel = row.label_mini == undefined? row.label : row.label_mini;
	// get measurements
	var measures = formatMeasures(getMeasureArray(pdata, row.tag));
	var markup;
	if (measures.length > 0) {
		var values = _.pluck(measures, 'value').reverse();
		var min = _.min(values);
		var max = _.max(values);
		markup = 
		'<li data-role="fieldcontain"> \
			<div class="cell3L"><strong>'+row.label+'</strong></div>';
		if (row.type === "freeform") {
			markup += 
			'<div class="cell3M"> \
				<div class="cell3Ma"><input placeholder="'+row.label+'" value="" ></div> \
				<div class="cellMini"><a href="#" class="import-free" style="font-weight:normal; padding: 4px;" value="'+measures[0].value
					+'" data-role="button" data-mini="true" data-inline="true" data-theme="c">'+dict.importval+'</a></div> \
			</div>'
		}
		else if (row.type === "select") {
			markup += 
			'<div class="cell3M"> \
				<div class="cell3Ma"><select data-theme="c"> \
					<option value="" disabled selected>'+dict.chooseone+'</option>';
			_.each(row.values, function(val) {
				markup += '<option value="'+val+'">'+val+'</option>';
			});
			markup += 
					'</select> \
				</div> \
				<div class="cellMini"><a href="#" class="import-select" style="font-weight:normal; padding: 4px;" value="'+measures[0].value
					+'" data-role="button" data-mini="true" data-inline="true" data-theme="c">'+dict.importval+'</a></div> \
			</div>';
		}
		markup +=			
			'<div class="cell3R"> \
				<div class="cellMini">'
					+getDate(measures[measures.length-1].timestamp)+'&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">'+getDate(measures[0].timestamp)
						+'</span><br>'+sparklabel+'&nbsp;&nbsp;<span class="sparkline" type="'+row.tag+'">'+values.toString()+'</span>&nbsp;&nbsp; \
						<span style="color:red"><strong>'+measures[0].value+'</strong></span></div> \
				<div class="cellMini">&nbsp;&nbsp;'+dict.low+'&nbsp;&nbsp;<br>&nbsp;&nbsp;<span style="color:blue"><strong>'+min+'</strong></span>&nbsp;&nbsp;</div> \
				<div class="cellMini">&nbsp;&nbsp;'+dict.high+'&nbsp;&nbsp;<br>&nbsp;&nbsp;<span style="color:blue"><strong>'+max+'</strong></span>&nbsp;&nbsp;</div> \
				<a href="#" class="gotomeasures" goto="'+row.tag+'" data-role="button" data-mini="true" data-inline="true" style="font-weight:normal; padding: 4px;" data-theme="c">'+dict.seemoredetails+'</a>\
			</div> \
			<div class="clear"></div> \
		</li>';
	}
	else
		markup = getRowMarkup(row, dict.noinfosystem);
	return markup;
}

function getMeasuresMarkup(pdata) {
    // data object for the template
	var data = {
		"id": pdata.id,
		"elements": [],
		"datetimeFunction": function () {
			return function(val, render) {
			    return getDatetime(render(val));
			}
		}
    };    
    data.elements.push({
    	"tag": "bmi",
    	"label": dict.bmi,
    	"values": formatMeasures(getMeasureArray(pdata, "bmi"))
    });
    data.elements.push({
    	"tag": "weight",
    	"label": dict.weight,
    	"values": formatMeasures(getMeasureArray(pdata, "weight"))
    });
    data.elements.push({
    	"tag": "height",
    	"label": dict.height,
    	"values": formatMeasures(getMeasureArray(pdata, "height"))
    });
    data.elements.push({
    	"tag": "asa",
    	"label": dict.asa,
    	"values": formatMeasures(getMeasureArray(pdata, "asa"))
    });
    data.elements.push({
    	"tag": "pulse",
    	"label": dict.pulse,
    	"values": formatMeasures(getMeasureArray(pdata, "pulse"))
    });
    data.elements.push({
    	"tag": "bp",
    	"label": dict.bp,
    	"values": formatMeasures(getMeasureArray(pdata, "bp"))
    });
    data.elements.push({
    	"tag": "temp",
    	"label": dict.temp,
    	"values": formatMeasures(getMeasureArray(pdata, "temp"))
    });
    // add heading, check if there is a chart and check if there is at least 1 measure (globally)
    var nvals = 0;
    _.each(data.elements, function(el) {
    	// count
	    nvals += el.values.length;
	    // hasChart
	    el.hasChart = el.values.length > 1;
	    // heading
	    el.heading = "";
    	if (el.values.length > 0) {
    		var item = el.values[0];
    		if (item.timestamp)
    			el.heading = getDate(item.timestamp) + '&nbsp;&nbsp;|&nbsp;&nbsp;';
    		el.heading += el.label + '&nbsp;&nbsp;|&nbsp;&nbsp;' + item.value ;
    	}    
    });    
    data.hasMeasures = nvals > 0;

	// template
	var template =
		'{{#hasMeasures}} \
			<h2>Pasientmålinger og diagnostiske tester</h2> \
		{{/hasMeasures}} \
		{{^hasMeasures}} \
			<h2>Ikke pasientmålinger eller diagnostiske tester</h2> \
		{{/hasMeasures}} \
		{{#elements}} \
			{{#values.length}} \
			<div data-role="collapsible" data-theme="c"> \
				<h4>{{{heading}}}</h4> \
				{{^hasChart}} \
				<h3>{{{label}}}</h3> \
				<ul class="{{tag}}" data-role="listview" data-inset="true" data-mini="true"> \
				<li data-role="list-divider" data-theme="a">{{label}}</li> \
				{{/hasChart}} \
				{{#hasChart}} \
				<a href="#" data-role="button" data-mini="true" data-inline="true" \
					class="chart" data-icon="gear" data-theme="c" >'+dict.seechart+'</a> \
				<ul class="{{tag}}" data-role="listview" data-inset="true" data-mini="true"> \
					<li data-role="list-divider" data-theme="a">{{label}}</li> \
					<li><canvas id="{{id}}-{{tag}}-chart" height="100"></canvas></li> \
				{{/hasChart}} \
					{{#values}} \
					<li data-role="fieldcontain"> \
						<div class="cell3L"><h3>{{#datetimeFunction}}{{timestamp}}{{/datetimeFunction}}</h3></div> \
						<div class="cell3Mp"><h3>{{value}}</h3></div> \
						<div class="cell3Rp"> \
							{{#snippet}}{{#provenance}} \
								<a href="#" style="background:{{color}}; font-weight:normal; padding: 4px;" did="{{did}}" snippet="{{snippet}}"  \
									data-role="button" data-mini="true" data-inline="true" data-theme="c">{{importedFrom}}</a> \
							{{/provenance}}{{/snippet}} \
							{{^snippet}}{{#provenance}}<a href="#{{tag}}-{{id}}-{{ind}}" style="background:{{color}}; font-weight:normal; padding: 4px;" data-rel="popup" data-transition="pop" \
								data-role="button" data-mini="true" data-inline="true" data-theme="c">{{importedFrom}}</a> \
							<div data-role="popup" id="{{tag}}-{{id}}-{{ind}}" data-theme="c"><p>Importert fra&nbsp;&nbsp;&nbsp;<strong>{{importedFrom}}</strong></p>\
								<p>Importert på&nbsp;&nbsp;&nbsp;<strong>{{#datetimeFunction}}{{importedOn}}{{/datetimeFunction}}</strong></p></div> \
							{{/provenance}}{{/snippet}}</div> \
						<div class="clear"></div> \
					</li> \
					{{/values}} \
				</ul> \
			</div> \
			{{/values.length}} \
		{{/elements}}';

	// return markup
	return Mustache.render(template, data);
}


function getMeasureArray(pdata, tag) {
	var values = [];
	switch(tag) {
		case "bmi":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harBMIMaling");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_dimensjonslos");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.bmi, pdata.docMeasures.docs));
			break;
		case "height":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harKroppshoydeMaling");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_cm");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.body_height, pdata.docMeasures.docs));
			break;
		case "weight":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harKroppsvektMaling");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_kg");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.body_weight, pdata.docMeasures.docs));
			break;
		case "asa":
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.asa, pdata.docMeasures.docs));
			break;
		case "pulse":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harPulsmaling");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_BPM");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.blood_pulse, pdata.docMeasures.docs));
			break;
		case "bp_high":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harBlodtrykkSystolisk");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_mmHg");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.blood_pressure_high, pdata.docMeasures.docs));
			break;
		case "bp_low":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harBlodtrykkDiastolisk");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_mmHg");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.blood_pressure_low, pdata.docMeasures.docs));
			break;
		case "bp": // this is a bit more complicated, the idea is to recreate values from "bp_high" and "bp_low"
			var bphlist = getMeasureArray(pdata, "bp_high");
			var bpllist = getMeasureArray(pdata, "bp_low");
			values = [];
			_.each(bphlist, function(bph) {
				var bpl = _.find(bpllist, function(el) { return bph.timestamp === el.timestamp && bph.provenance.importedFrom === el.provenance.importedFrom; });
				if (bpl != undefined) {
					// remove from the list
					bpllist = _.without(bpllist, bpl);
					// create new element
					var newel = _.clone(bph); // check clone
					newel.value = bph.value+"/"+bpl.value;
					values.push(newel);
				}
			});		
			break;
		case "temp":
			values = getListObjects(pdata, "outlinks", "http://data.ahus.no/rd/harKroppstemperaturmaling");
			values = getDataMeasurements(values, "http://data.ahus.no/rd/verdi_degC");
			if (pdata.docMeasures !== undefined)
				values = _.union(values, getDocMeasurements(pdata.docMeasures.body_temperature, pdata.docMeasures.docs));
			break;
	}
	return values;
}

function getDataMeasurements(list, pval, ptstamp) {
	if (ptstamp === undefined)
		ptstamp = "http://data.ahus.no/rd/maletidspunkt";
	var measures = [];
	// include data points with provenance data if available
	_.each(list, function(item) {
		measures.push( { 	"value": getFirstItem(item, "literals", pval),
						"timestamp": getFirstItem(item, "literals", ptstamp),
						"provenance": getProvenance(item) });	
	});	
	return measures;
}

function getDocMeasurements(list, docs) {
	var docolor = "#FFC373";	
	var measures = [];
	// include data points
	_.each(list, function(item) {
		var doc = _.find(docs, function(el) { return el.did == item.did; });	
		measures.push( { 	"value": item.measure,
						"timestamp": doc.OPPRETTETTID,
						"did": doc.did,
						"provenance": { importedFrom: "DOKUMENT",
							importedOn: doc.OPPRETTETTID,
							color: docolor},
						"snippet": item.snippet });	
	});	
	return measures;
}

function formatMeasures(measures) {
	_.each(measures, function(item, ind) {
		item.ind = ind;	
	});	
	// ordering of the data points
	measures = _.sortBy(measures, function(meas) { return meas.timestamp; })	
	return measures.reverse();
}

function formatMeasuresChart(measures) {
	_.each(measures, function(item, ind) {
		item.x = item.timestamp;
		item.y = item.value;
		delete item.timestamp;
		delete item.value;
	});	
	// ordering of the data points
	measures = _.sortBy(measures, function(meas) { return meas.x; })	
	return measures.reverse();
}

function getCharts(pdata) {    
    // data points formatted for the charts
	var data = {};
	data.bmi = formatMeasuresChart(getMeasureArray(pdata, "bmi"));
	data.height = formatMeasuresChart(getMeasureArray(pdata, "height"));
	data.weight = formatMeasuresChart(getMeasureArray(pdata, "weight"));
	data.asa = formatMeasuresChart(getMeasureArray(pdata, "asa"));
	data.pulse = formatMeasuresChart(getMeasureArray(pdata, "pulse"));
	data.temp = formatMeasuresChart(getMeasureArray(pdata, "temp"));	    
    
    // colors
    var defcol = '#558FB9';
    
    // prepare output
    var charts = [];
    for (var ch in data) {
    	if (data[ch].length > 1) {
    		// create colorarray for the data points based on the provenance 
    		var carray = [];
    		_.each(data[ch], function(dp) {
    			if (dp.provenance !== undefined && dp.provenance.color !== undefined)
    				carray.push(dp.provenance.color);
    			else
    				carray.push(defcol);    			
    		});
    		var chart = {
					type: 'line',
					data: {
						datasets: [{
							label: dict[ch],
							data: data[ch],
							lineTension: 0.1,
							borderColor: defcol,
							fill: false,
							pointRadius: 5,
							pointBorderWidth: 2,
							pointHoverRadius: 8,
							pointHoverBorderWidth: 3,
							pointBackgroundColor: carray
						}]
					},
					options: {
						legend: {
							display: false
						},
						scales: {
							xAxes: [{
								type: 'time',
								time: {
									displayFormats: {
										quarter: 'MMM YYYY'
									}
								},
								position: 'bottom'
							}]
						},
						tooltips: {
							enabled: true,
							mode: 'single',
							callbacks: {
								label: function(tooltipItems, data) {
									var dp = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
									// prepare the desired label
									var cad = data.datasets[tooltipItems.datasetIndex].label+": "+dp.y;
									// add provenance info
									if (dp.provenance !== undefined && dp.provenance.importedFrom !== undefined)
										cad += "  "+dp.provenance.importedFrom
									return cad;
								}
							}
						}
					}
				};    	
    		charts.push({id: pdata.id+"-"+ch+"-chart", 'data':  data[ch], 'chart': chart});
        }
    }
    // special case for blood pressure
    var bp_high = formatMeasuresChart(getMeasureArray(pdata, "bp_high"));
	var bp_low = formatMeasuresChart(getMeasureArray(pdata, "bp_low"));
	var bp = formatMeasuresChart(getMeasureArray(pdata, "bp"));
	if (bp.length > 1) {
    	var bphcol = '#F94A4A';	  
	    var bpchart = {
				type: 'line',
				data: {
					datasets: [{
						label: dict.bp_high,
						data: bp_high,
						lineTension: 0.1,
						borderColor: bphcol,
						fill: false,
						pointRadius: 5,
						pointBorderWidth: 2,
						pointHoverRadius: 8,
						pointHoverBorderWidth: 3,
						pointBackgroundColor: carray
					}, {
						label: dict.bp_low,
						data: bp_low,
						lineTension: 0.1,
						borderColor: defcol,
						fill: false,
						pointRadius: 5,
						pointBorderWidth: 2,
						pointHoverRadius: 8,
						pointHoverBorderWidth: 3,
						pointBackgroundColor: carray
					}]
				},
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							type: 'time',
							time: {
								displayFormats: {
									quarter: 'MMM YYYY'
								}
							},
							position: 'bottom'
						}]
					},
					tooltips: {
						enabled: true,
						mode: 'single',
						callbacks: {
							label: function(tooltipItems, data) {
								var dp = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
								// prepare the desired label
								var cad = data.datasets[tooltipItems.datasetIndex].label+": "+dp.y;
								// add provenance info
								if (dp.provenance !== undefined && dp.provenance.importedFrom !== undefined)
									cad += "  "+dp.provenance.importedFrom
								return cad;
							}
						}
					}
				}
			};	
	    charts.push({id: pdata.id+"-bp-chart", 'data':  bp, 'chart': bpchart});
	}
    
    return charts;  
}
