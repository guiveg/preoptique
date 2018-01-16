PreOptique
==========
PreOptique is a novel hybrid semantic and text-based system that provides integrated access to patient health records scattered over several databases and document repositories.


Usage
==========
PreOptique is a web application developed in Javascript. It requires access to a triplestore (it can be a virtual triplestore such as [Ontop](https://github.com/ontop/ontop/)) that exposes the patient data.  

PreOptique can also analyse clinical notes through the use of [Solr](http://lucene.apache.org/solr/), an open source text search platform. The use of a Solr component is optional.


Help us to improve
==========
PreOptique is available under an Apache 2 license. Please send us an email to [guiveg@ifi.uio.no](mailto:guiveg@ifi.uio.no) if you use or plan to use PreOptique in a project. Drop us also a message if you have comments or suggestions for improvement.


Screenshots
==========
Some screenshots of PreOptique:

![screenshot](/screenshots/preoptique0.png)

![screenshot](/screenshots/preoptique1.png)

![screenshot](/screenshots/preoptique2.png)

![screenshot](/screenshots/preoptique3.png)


Configuration
==========
You can edit the parameters of the configuration file at `etc/data/parameters.js`:

* `sparqlBase`: URI of the (virtual) triplestore

* `httpMethod`: HTTP method employed in the SPARQL queries (GET or POST)

* `textEngine`: URI of the Solr text engine

* `cerberus`: URI of an authorization service to grant access. If not configured, access will be granted

* `sessionTimeout`: session timeout to log out (in minutes)

