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
function getRowMarkup(row, comment) {
	var comment = (comment !== undefined)? comment : "";
	var markup = 
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
	else
		return "";		
	markup +=
		'<div class="cell3R">'+ comment +'</div> \
		<div class="clear"></div> \
	</li>';
	return markup;	
}


function getOperationMarkup(pdata) {
	// heading
	var opmarkup = '<h2>'+dict.newoperationfor+' '+
		getFirstItem(pdata, "literals", "http://www.w3.org/2000/01/rdf-schema#label")+'</h2>';
	
	// simple form for op. types
	opmarkup += '<div class="cell3Mc"><h3>'+dict.operationtype+':</h3></div> \
		<div class="cellMini"> \
			<select data-theme="c"> \
				<option value="" disabled selected>'+dict.chooseone+'</option>';
	_.each(greenSchema.optypes, function(val) {
		opmarkup += '<option value="'+val+'">'+val+'</option>';
			});
	opmarkup += '</select></div><div class="clear"></div>';
	
	// simple form for dates
	var now = getDatetime(new Date()).replace(" ","T");
	//console.log("Now: "+now);
	opmarkup += '<div class="cell3Mc"><h3>'+dict.operationdate+':</h3></div> \
		<div class="cellMini"> \
			<input type="datetime-local" min="'+now+'" > \
		</div> \
		<div class="clear"></div>';
		
	// is there an inkommst document?
	var inkommst = pdata.latestInnkomst == null? '<h3>'+dict.noInnkomstFound+'</h3>' : 
		'<a href="#" did="'+pdata.latestInnkomst.did+'" \
			data-role="button" data-mini="true" data-inline="true" \
			data-theme="c">'+dict.seeLatestInnkomst+'</a>';
	opmarkup += '<div class="cell3Mc"><h3>'+dict.innkomstDoc+':</h3></div> \
		<div class="cellMini">'+inkommst+'</div><div class="clear"></div>';
	
	// sections of the green schema object
	_.each(greenSchema.sections, function(sec) {
		opmarkup += 
		'<ul data-role="listview" data-inset="true" data-mini="true"> \
			<li data-role="list-divider" data-theme="a">'+sec.title+' '+dict.legend+'</li>';
		// rows
		_.each(sec.rows, function(row) {
			var rowmarkup;
			if (row.extract !== undefined) {
				if (row.extract === "measure") 
					opmarkup += getMeasurementRowMarkup(pdata, row);
				else if (row.extract === "other") 
					opmarkup += getCriticalRowMarkup(pdata, row);
			}
			else
				opmarkup += getRowMarkup(row);
		});
		opmarkup +=	'</ul>';
	});
	
	return opmarkup;
}
