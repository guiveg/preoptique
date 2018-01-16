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

function getCriticalRowMarkup(pdata, row) {
	// insight cell
	var insight;
	// get critical info	
	if (pdata.docMeasures !== undefined) {
		var list = getDocMeasurements(pdata.docMeasures[row.tag], pdata.docMeasures.docs);
		// if there is at least one...
		if (list.length > 0) {
			// sort by timestamp
			list = _.sortBy(list, function(el) { return el.timestamp; }).reverse();
			// get distinct values
			var values = _.uniq(_.pluck(list, 'value'));
			// analyze each value for the insight cell...
			_.each(values, function(value) {
				var elements = _.filter(list, function(el) { return el.value === value; });
				// format response
				if (insight == undefined)
					insight = "";
				else 
					insight += "<br>";
				insight += '<strong>'+dict[value]+'</strong>: '+elements.length+' '+dict.table.patdocs
					+ ' ('+dict.lastfrom+' '+getDate(elements[0].timestamp)+')';			
			});
		}
	}
	// markup
	var markup;	
	// no insight?
	if (insight == undefined)
		markup = getRowMarkup(row, dict.noinfosystem);
	else {
		markup = 
			'<li data-role="fieldcontain"> \
				<div class="cell3L"><strong>'+row.label+'</strong></div>';
		if (row.type === "freeform") {
			markup += 
			'<div class="cell3M"> \
				<div class="cell3Mb"><input placeholder="'+row.label+'" value="" ></div> \
			</div>'
		}
		else if (row.type === "select") {
			markup += 
			'<div class="cell3M"> \
				<div class="cell3Mb"><select data-theme="c"> \
					<option value="" disabled selected>'+dict.chooseone+'</option>';
			_.each(row.values, function(val) {
				markup += '<option value="'+val+'">'+val+'</option>';
			});
			markup += 
					'</select></div> \
				</div> \
			</div>';
		}
		markup +=			
			'<div class="cell3R"> \
				<div class="cellMini">'+insight+'</div> \
				<a href="#" class="gotocritic" goto="'+row.tag+'" data-role="button" style="font-weight:normal; padding: 4px;" data-mini="true" data-inline="true" data-theme="c">'+dict.seemoredetails+'</a>\
			</div> \
			<div class="clear"></div> \
		</li>';		
	}
	return markup;
}


function getCriticalInfoMarkup(pdata) {

// "smoke_former", "smoke_yes", "smoke_no", "smoke_uncertain"
// "allergy_no", "allergy_yes"

	var data = {
		critical: [],
    	nocriticalinfo: dict.nocriticalinfo,		
		datetimeFunction: function () {
			return function(val, render) {
			    return getDatetime(render(val));
			}
		}
	};
	var pars = ["allergy", "smoking"];
	_.each(pars, function(par) {
		// get list of values
		if (pdata.docMeasures !== undefined) {
			var list = getDocMeasurements(pdata.docMeasures[par], pdata.docMeasures.docs);
			// if there is at least one...
			if (list.length > 0) {
				// data object
				var critical = {};
				critical.id = par;
				critical.title = dict["title_"+par]								
				critical.vals = [];
				data.critical.push(critical);
				// sort by timestamp
				list = _.sortBy(list, function(el) { return el.timestamp; }).reverse();
				// get distinct values
				var values = _.uniq(_.pluck(list, 'value'));
				// prepare data object
				_.each(values, function(val) {
					var dobj = {};
					dobj.id = val;
					dobj.elements = [];
					critical.vals.push(dobj);
				});
				// include each element of the list in the right place
				_.each(list, function(el) {
					var dobj = _.find(critical.vals, function(val) { return val.id === el.value; });
					dobj.elements.push(el);
				});
				// titles...
				_.each(critical.vals, function(crval) {
					crval.title = '<strong>'+dict[crval.id]+'</strong>: '+crval.elements.length+' '+dict.table.patdocs;
					// set the first element
					crval.elements[0].first = true;
				});
			}
		}
	});
		
	var template =
		'{{^critical.length}} \
			<h2>{{nocriticalinfo}}</h2> \
		{{/critical.length}} \
		{{#critical}} \
		<ul class="{{id}}" data-role="listview" data-inset="true" data-mini="true"> \
			<li data-role="list-divider" data-theme="a">{{title}}</li> \
			{{#vals}} \
				<li data-role="fieldcontain" > \
				{{#elements}} \
					<div class="cell3Lc">{{#first}}{{{title}}}{{/first}}{{^first}}&nbsp;{{/first}}</div> \
					<div class="cell3Mc"> \
						{{#datetimeFunction}}{{timestamp}}{{/datetimeFunction}} \
					</div> \
					<div class="cell3Rc"> \
						{{#snippet}}{{#provenance}} \
						<i>{{snippet}}</i><a href="#" did="{{did}}" snippet="{{snippet}}"  \
								data-role="button" data-mini="true" data-inline="true" data-theme="c" data-icon="action" data-iconpos="notext" >Rapport</a> \
						{{/provenance}}{{/snippet}} \
					</div> \
					<div class="clear"></div> \
				{{/elements}} \
				</li> \
			{{/vals}} \
		</ul> \
		{{/critical}}';
					
	// return markup
	return Mustache.render(template, data);
}