/**********************
*** PARAMETERS FILE ***
**********************/

var parameters = new Object();

// authorization service
parameters.cerberus = "https://localhost:8000/cerberus"; // URI of the authorization server
parameters.sessionTimeout = 20; // 20 minutes


// SPARQL endpoint
parameters.sparqlBase = "http://localhost:3030/ahus2/query";
// HTTP method employed in the SPARQL queries
parameters.httpMethod = "GET";


// text engine
parameters.textEngine = "http://localhost:8983/solr/ahus2/select";


// logging (see http://docs.shopify.com/manual/configuration/store-customization/get-a-visitors-location)
parameters.geoipservice = "http://freegeoip.net/json/";
parameters.locallog = true;
parameters.remotelog = false;