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

/*******************
*** QUERIES FILE ***
********************/

// query prefixes
var queryPrefixes = {
	'owl': 'http://www.w3.org/2002/07/owl#', 
	'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 
	'xml': 'http://www.w3.org/XML/1998/namespace', 
	'xsd': 'http://www.w3.org/2001/XMLSchema#', 
	'rdfs': 'http://www.w3.org/2000/01/rdf-schema#', 
	'obo': 'http://purl.obolibrary.org/obo/', 
	'oboInOwl': 'http://www.geneontology.org/formats/oboInOwl#', 
	'foaf': 'http://xmlns.com/foaf/0.1/', 
	'skos': 'http://www.w3.org/2004/02/skos/core#', 
	'pav': 'http://purl.org/pav/', 
	'dc': 'http://purl.org/dc/elements/1.1/',
	'dcterms': 'http://purl.org/dc/terms/', 
	'ahus': 'http://data.ahus.no/rd/'};


// query array with all the queries
var queries = new Array();


/*** QUERIES IN list_patients.js ***/

// query for retrieving all patients ordered by surname
queries.push({'name': 'listPatients',
	'prefixes': ['rdfs', 'foaf', 'ahus'],
	'query': 'SELECT DISTINCT ?patient ?name \n \
WHERE { \n \
?patient a ahus:pasient ; \n \
   rdfs:label ?name ; \n \
   foaf:familyName ?surname. \n \
} \n \
ORDER BY ?surname'
});

/*** QUERIES IN patient.js ***/

// query for retrieving the uris of the individuals related to the MEASURES of a patient
// (included property paths for the provenance)
queries.push({'name': 'patientMeasures',
	'prefixes': ['ahus', 'pav'],
	'query': 'SELECT DISTINCT ?indiv \n \
WHERE { \n \
<{{{uri}}}> ahus:harMaling|ahus:harMaling/pav:importedFrom ?indiv . \n \
}'
});

// query for retrieving the uris of the individuals related to the PROCESSES of a patient
queries.push({'name': 'patientProcesses',
	'prefixes': ['ahus'],
	'query': 'SELECT DISTINCT ?indiv \n \
WHERE { \n \
<{{{uri}}}> ^ahus:harPasient|ahus:harSykdom|^ahus:diagnoseOmPasient|^ahus:diagnoseOmPasient/ahus:diagnostisertType ?indiv . \n \
}'
});


/*** QUERIES IN data_gathering.js ***/

// ALL QUERIES IN THIS SECTION USE "uri" AS A PARAMETER TO GATHER DATA

// query for retrieving the types of an individual
queries.push({'name': 'types',
	'prefixes': ['rdf', 'rdfs'],
	'query': 'SELECT DISTINCT ?type \n \
WHERE { \n \
<{{{uri}}}> rdf:type/rdfs:subClassOf* ?type . \n \
}'
});

// query for retrieving the more specific types of an individual
queries.push({'name': 'subtypes',
	'prefixes': ['rdf', 'rdfs'],
	'query': 'SELECT DISTINCT ?type \n \
WHERE { \n \
<{{{uri}}}> rdf:type/rdfs:subClassOf* ?type . \n \
FILTER NOT EXISTS { \n \
   <{{{uri}}}> rdf:type/rdfs:subClassOf* ?subtype . \n \
   ?subtype rdfs:subClassOf ?type . \n \
} \n \
}'
});

// query for retrieving the outgoing links of an individual
queries.push({'name': 'outlinks',
	'prefixes': [],
	'query': 'SELECT DISTINCT ?prop ?obj \n \
WHERE { \n \
<{{{uri}}}> ?prop ?obj . \n \
FILTER isIRI(?obj) \
}'
});

// query for retrieving the incoming links of an individual
queries.push({'name': 'inlinks',
	'prefixes': [],
	'query': 'SELECT DISTINCT ?prop ?sbj \n \
WHERE { \n \
?sbj ?prop <{{{uri}}}> . \n \
}'
});

// query for retrieving the literals of an individual
queries.push({'name': 'literals',
	'prefixes': [],
	'query': 'SELECT DISTINCT ?prop ?lit \n \
WHERE { \n \
<{{{uri}}}> ?prop ?lit . \n \
FILTER isLiteral(?lit) \
}'
});