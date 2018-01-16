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

function gatherCollectionData(qname, data, callback) {
	// initialize requests
	var requests = [];
	// submit the query
	Adata.getData(qname, data, function(datos) {
		// array of resources
		var pres = [];
		$.each(datos.results.bindings, function(i, item) {
			// obtain uri
			var ruri = item.indiv.value;
			// include in the array if not already retrieved
			if (_.find(Session.data, function(el) { return el.uri === ruri; }) === undefined)
				pres.push(ruri);
		});
		// no resources, call the callback
		if (pres.length == 0 && callback)
			callback();
		else {
			// gather data for all related resources
			_.each(pres, function(ruri) {
				requests = _.union(requests, gatherIndividualData(ruri, requests));
			});
			// when all calls are ready we call the callback
			var defer = $.when.apply($, requests);
			defer.done(callback);
		}
	});
	return requests;
}

function gatherIndividualData(uri, callback) {
	// initialize requests
	var requests = [];
	var data = _.find(Session.data, function(el) { return el.uri === uri; });
	// initialize data object
	if (data === undefined) {
		data = {};
		data.uri = uri;
		Session.data.push(data);					
	}
	// request types data
	if (data.types === undefined) {
		var req = Adata.getData('types', data, function(datos) {
			// initialize types
			data.types = [];
			$.each(datos.results.bindings, function(i, row) {
				data.types.push(row.type.value);
			});
		});
		// include request in the array
		requests.push(req);
	}
	// request subtypes data
	if (data.subtypes === undefined) {
		var req = Adata.getData('subtypes', data, function(datos) {
			// initialize subtypes
			data.subtypes = [];
			$.each(datos.results.bindings, function(i, row) {
				data.subtypes.push(row.type.value);
			});
		});
		// include request in the array
		requests.push(req);
	}
	// request outlinks
	if (data.outlinks === undefined) {
		var req = Adata.getData('outlinks', data, function(datos) {
			// initialize outlinks
			data.outlinks = [];
			$.each(datos.results.bindings, function(i, item) {
				// get outlink property
				var dprop = _.find(data.outlinks, function(el) { return el.prop === item.prop.value; } );
				if (dprop === undefined) { 
					// create if non existing
					dprop = {};
					dprop.prop = item.prop.value;
					dprop.elements = [];
					data.outlinks.push(dprop);
				}
				// include object
				dprop.elements.push(item.obj.value);
			});
		});
		// include request in the array
		requests.push(req);
	}
	// request inlinks
	if (data.inlinks === undefined) {
		var req = Adata.getData('inlinks', data, function(datos) {
			// initialize inlinks
			data.inlinks = [];
			$.each(datos.results.bindings, function(i, item) {
				// get inlink property
				var dprop = _.find(data.inlinks, function(el) { return el.prop === item.prop.value; } );
				if (dprop === undefined) { 
					// create if non existing
					dprop = {};
					dprop.prop = item.prop.value;
					dprop.elements = [];
					data.inlinks.push(dprop);
				}
				// include object
				dprop.elements.push(item.sbj.value);
			});
		});
		// include request in the array
		requests.push(req);
	}
	// request literals
	if (data.literals === undefined) {
		var req = Adata.getData('literals', data, function(datos) {
			// initialize literals
			data.literals = [];
			$.each(datos.results.bindings, function(i, item) {
				// get literal property
				var dprop = _.find(data.literals, function(el) { return el.prop === item.prop.value; } );
				if (dprop === undefined) { 
					// create if non existing
					dprop = {};
					dprop.prop = item.prop.value;
					dprop.elements = [];
					data.literals.push(dprop);
				}
				// include value
				dprop.elements.push(item.lit.value);
			});
		});
		// include request in the array
		requests.push(req);
	}	
	// no resources, call the callback
	if (requests.length == 0)
		callback();
	else {
		// when all calls are ready we call the callback
		var defer = $.when.apply($, requests);
		defer.done(callback);
	}
	
	return requests;
}

function getFirstItem(data, ptype, prop) {
	var dprop = _.find(data[ptype], function(el) { return el.prop === prop; } );
	if (dprop === undefined || dprop.elements.length == 0)
		return null;
	else	// just return the first ocurrence
		return dprop.elements[0];
}

function getListUris(data, ptype, prop) {
	var dprop = _.find(data[ptype], function(el) { return el.prop === prop; } );
	if (dprop === undefined || dprop.elements.length == 0)
		return null;
	else	// return the list of uris
		return dprop.elements;
}

function getListObjects(data, ptype, prop) {
	var dprop = _.find(data[ptype], function(el) { return el.prop === prop; } );
	if (dprop === undefined || dprop.elements.length == 0)
		return null;
	else {	// return the list of objects
		var list = [];
		_.each(dprop.elements, function(uri) {
			var obj = _.find(Session.data, function(el) { return el.uri === uri; });
			if (obj !== undefined)
				list.push(obj);
		});
		return list;
	}
}

function getProvenance(data) {
	// get "importedFrom" individual uri
	var ifuri = getFirstItem(data, "outlinks", "http://purl.org/pav/importedFrom");
	//_.find(data.outlinks, function(el) { return el.prop === "http://purl.org/pav/importedFrom"; } );
	if (ifuri === null) // no provenance
		return null;
	else { // there is provenance
		var importedFrom = _.find(Session.data, function(el) { return el.uri === ifuri; }); 
		// prepare provenance object		
		var probj = {};
		probj.importedFrom = getFirstItem(importedFrom, "literals", "http://www.w3.org/2000/01/rdf-schema#label");		
		// get "importedOn" timestamp if available
		var importedOn = getFirstItem(data, "literals", "http://purl.org/pav/importedOn");
		if (importedOn != null)
			probj.importedOn = importedOn;
		// get color if available
		if (probj.importedFrom.toLowerCase().split("metavision").length > 1) probj.color = '#A0E6A0';
		else if (probj.importedFrom.toLowerCase().split("dips").length > 1) probj.color = '#AABCEF';
		else probj.color = "#558FB9";
		/* CODE TO GET THE COLOR FROM THE TRIPLESTORE
		var color = getFirstItem(importedFrom, "literals", "http://data.ahus.no/rd/datakildefarge");
		if (color != null)
			probj.color = color;*/		
		return probj;		
	}
}