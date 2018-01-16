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

function TextEngine(uri) {  
    this.queryText = function(qdata, retfunc, failfunc) {
		var jqxhr = $.ajax({
			url: uri,
			//dataType: 'jsonp',
			dataType: "json",
			crossDomain: true,
			traditional: true,
			//jsonp: 'json.wrf',
			data: qdata
			});
	
		jqxhr.done(retfunc); 
	
		jqxhr.fail((failfunc) ? failfunc :
			function(obj, status, errorThrown) {
				console.log("ERROR\n"+ status + "\n" + errorThrown); 
			});

		return jqxhr; 
    };    
}; 

function AhusDocProvider(uri, defaultFailFunc) {
	var textengine;
	
	// test if the report provider is up
	// (source: https://petermolnar.eu/test-site-javascript/)
	var script = document.body.appendChild(document.createElement("script"));
    script.onload = function() { // success, create engine
        textengine = new TextEngine(uri);
    };
    script.onerror = function() { // not up...
		textengine = null;
    };
    script.src = uri;
	
    this.getDocs = function(qdata, callback, failfunc) {
    	if (textengine != null)
			return textengine.queryText(qdata, callback, (failfunc) ? failfunc : defaultFailFunc);
		else
			(failfunc) ? failfunc() : defaultFailFunc();
    }; 
}

function xmlToJson(xml) {	
	// create the return object
	var obj = {};
	obj.results = {};
	obj.results.bindings = [];
	
	// get result object in xml
	var xmlresultobj = _.find(xml.childNodes[0].childNodes, function(node) { return node.nodeName === "results"; });
	// get list of results in xml
	var xmlresults = _.filter(xmlresultobj.childNodes, function(node) { return node.nodeName === "result"; });	
	
	// each element in xmlresults correspond to a specific binding
	_.each(xmlresults, function(xmlres) {
		var binding = {};
		var xmlvalues = _.filter(xmlres.childNodes, function(node) { return node.nodeName === "binding"; });		
		_.each(xmlvalues, function(xmlval) {
			// get key
			var key = xmlval.attributes[0].nodeValue;
			// get final object
			var actxmlval = _.find(xmlval.childNodes, function(node) { return node.nodeName !== "#text"; });
			// fill up the values for the binding[key] object
			binding[key] = {
				'type' : actxmlval.nodeName,
				'value' : actxmlval.textContent
			};
		});	
		obj.results.bindings.push(binding);
	});
		
	return obj;
}

function SparqlServer(uri, httpMethod) {
    var method = (httpMethod) ? httpMethod : "GET"; 
    
    this.querySparql = function(query, retfunc, failfunc) {
		var jqxhr = $.ajax({
			url: uri,
			dataType: "json",
			type: method,
			data: {
				query: query, 
				format: 'json',
				Accept: 'application/sparql-results+json'
			}});
	
		jqxhr.done(retfunc);
		
		/* alternative for Ontop since it does not return JSON
		
		var jqxhr = $.ajax({
			url: uri,
			dataType: "xml",//"json",
			type: method,
			data: {
				query: query, 
				format: "xml",//'json',
				Accept: "application/xml"//'application/sparql-results+json'
			}});
		jqxhr.done(function(datos) {	
			if (datos.childNodes !== undefined) {
				// data in XML! home conversion
				datos = xmlToJson(datos);			
			}
			retfunc(datos);
		});*/
	
		jqxhr.fail((failfunc) ? failfunc :
			function(obj, status, errorThrown) {
			   console.log("ERROR\n"+ status + "\n" + errorThrown); 
			});

		return jqxhr; 
    };    
};

function AhusDataProvider(uri, httpMethod, defaultFailFunc) {
    var sparqlserver = new SparqlServer(uri, httpMethod);
    
    /**
       queryname: name of the query
       arg: a map string=>string containing the values to be used for retrieving data (for Mustache)
       callback: a function to be called with resulting data
       failfunc: optional override of default function to run if things fail. 

       returns a deferred object, but not of any particular kind. (i.e. we 
       do not require it to be an ajax call)  The object may already be resolved. 
    */
    this.getData = function(queryname, arg, callback, failfunc) {
    	// get query object
    	var qo = _.find(queries, function(el) { return el.name === queryname; });
		// substitute parameters with mustache
		var query = Mustache.render(qo.query, arg);
		// include prefix string
		query =  getPrefixString(qo.prefixes) + query;
		console.log(query);			
		// query!
		return sparqlserver.querySparql(query, callback, (failfunc) ? failfunc : defaultFailFunc); 	
    }; 
};

function getPrefixString(prefixes) {
	var s = "";
	$.each(prefixes, function(i, pref) {
		s += "PREFIX " + pref + ": <" +  queryPrefixes[pref] + ">\n";
	});
	return s; 
}