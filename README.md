# Bootstrap app for Nodejs Elasticsearch apps

This application is just a simple demo what can be used as a basis for new applications.

It provides the basic indexing commands indexing, listing and detail pages,
csv/tsv export.

It can be cloned, and with minimal configuration a new search application
created from it.

## For creating a new application you have to follow the next steps:

### Development:
####1. __Clone eea.docker.searchservices on the development machine:__
	```git clone --recursive  https://github.com/eea/eea.docker.searchservices.git```

####2. __Copy the eea.docker.esbootstrap application under a new name: eea.docker.newesapp__
You will have the following file structure:
<pre>
	├── app
	│   ├── indexing
	│   │   ├── dataMapping.json
	│   │   └── query.sparql
	│   ├── public
	│   │   ├── css
	│   │   │   └── esbootstrap.facetview.css
	│   │   └── javascripts
	│   │       └── esbootstrap.facetview.js
	│   ├── views
	│   |   ├── details.jade
	│   |   └── index.jade
	│   ├── app.js
	│   ├── mapping.json
	│   ├── package.json
	│   └── settings.json
	├── Dockerfile
	├── Dockerfile.dev
	└── README.md
</pre>

 - **app/indexing** is the folder what contains the indexing scripts, the data
mapping for elasticsearch and optionally a configuration file for analyzers.
 - **app/public** contains the static resources
 - **app/views** contains the jade templates for index and detail pages
 - **app/app.js** is the main application
 - **app/mapping.json** contains the configuration of the pages, including listing
 - view, facets, detail view, csv/tsv export
 - **app/package.json** contains information about the application, version number,
dependencies, etc.
 - **app/settings.json** contains information about the external templates and the
elastic index to be used in the app
 - **Dockerfile** the production Dockerfile for the application, in most cases this
should not be modified
 - **Dockerfile.dev** the development Dockerfile for the application,
in most cases this should not be modified

####3. __Configure the elastic index__
The **app/settings.json** is the place where external templates and the elastic index is configure. The external templates should remain unchanged, but the index should be configured for the new application.
<pre>
	"elastic": {
	    "index": "newesappdata",
        "real_index": "newesappdata_blue",
        "type": "resources",
        "field_base":""
	},
	"elastic_green": {
	    "index": "newesappdata",
        "real_index": "newesappdata_green",
        "type": "resources",
        "field_base":""
	},
</pre>

 - **elastic** section set the **index** and the real_index
 - **elastic_green** section set the **index** and the **real_index**
 For both **elastic** and **elastic_green** the **index** should be the same.
 
#####4. __Identify the query you want to use.__
Depending on the query you have, there are several options.

#####4.1 __Simple Select query__ when there are not too many results
If it's a select query which returns the data structured in the table, once you tried and tested your query on the endpoint, just paste it in the indexing/query.sparql file. 
**Important:** All indexing queries should contain a unique _id column. 
In our example we use a simple query what returns all daviz visualizations:
**app/indexing/query.sparql**
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/&gt;
SELECT distinct (?visualization as ?_id) ?visualization ?description ?title ?creator ?created (year(?created) as ?year)
WHERE {
		?visualization a daviz:DavizVisualization
		optional{?visualization dct:description ?description}
	    optional{?visualization dct:title ?title}
	    optional{?visualization dct:creator ?creator}
	    optional{?visualization dct:created ?created}
}
</pre>
#####4.2 __Filtered Select queries__
Depending on the number of rows returned by your query, you might run into a timeout when indexing. If this occures, you should split up the indexing using a filter (ex. year of creation).
Supposing we have too many visualizations we can split up the results using a filter on the creator.
Create **app/indexing/filterQuery.sparql** and fill it with:
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/&gt;
SELECT distinct ?creator
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:creator ?creator}
}
</pre>
This query will return all **creators** for DavizVisualiztaions, so we have to update our **app/indexing/query.sparql** to use the **creator** as a filter value.
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/>&gt;
SELECT distinct (?visualization as ?_id) ?visualization ?description ?title ?creator ?created (year(?created) as ?year)
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:description ?description}
     optional{?visualization dct:title ?title}
     optional{?visualization dct:creator ?creator}
     optional{?visualization dct:created ?created}
  FILTER (?creator = '&lt;<b>creator</b>&gt;')
}
</pre>
Notice the **FILTER** clause in the **app/indexing/query.sparql** as this query will be executed for each creator from the filterQuery.sparql query.

#####4.3 __Construct query__
TODO

####5. __Data mapping for indexing:__
Data mapping for elasticsearch is done within **app/indexing/dataMapping.json**.
By default elasticsearch tries to make a guess on the data type for each attribute, but sometimes it's useful to specify it explicitly.
example of mapping for a field:
<pre>  "visualization" : {
        "type" : "string",
        "analyzer" : "none"
  },
</pre>
- the **analyzer** attribute in normal cases should be none, but if there is a list of values you can use our builtin analyzers:
	- coma 
	- semicolon
Also it is possible to create your own analyzer
TODO
- for **type** the most common data types are:
	-  string, 
	- long, 
	- integer, 
	- double, 
	- date, 
	- boolean, 
	- geo_point

A full list of data types is listed at:
https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html

####6. __Configure the layout of the pages:__
For templating we use nodejs's jade template: http://naltatis.github.io/jade-syntax-docs/
The default templates are:

- **app/views/index.jade** 
- **app/views/details.jade**
The main blocks are already specified, in most cases only the labels like title or breadcrumbs should be changed.

#####7.1 __Adding custom js code:__
The location for js files is and **app/public/javascripts**
We have a default js for creating the listing page for the application, called: **app/public/javascripts/esbootstrap.facetview.js**.
Once a new application is created, it's recommended to rename it to **app/public/javascripts/newesapp.facetview.js** and update the **extrajavascripts** block in **app/views/index.jade**.
**extrajavascripts** is the place where you have to add any extra libraries:

<pre>
...
block extrajavascripts
    script(type='text/javascript', src='javascripts/<b>newesapp</b>.facetview.js')
    script(type='text/javascript', src='javascripts/<b>extrajslibrary.js</b>')
...
</pre>
**Note:** You can add different js on the index and the detail views.

After updating the template, you can start customizing the **app/public/javascripts/newesapp.facetview.js**. 
In normal cases you only have to specify is the **default_sort**:

- If you don't need any sort on the listing view, just set an empty list:
<pre>
...
var default_sort = [];
...
</pre>
- But you can easily add a sort by doing something like:
<pre>
...
default_sort = [{'created':{'order':'asc'}}] 
...
</pre>
You only have to specify the name of the field and if the order is ascending or descending.
There is also possible to set the sort on more fields:
<pre>
...
default_sort = [{'field1':{'order':'asc'}}, {'field2':{'order':'asc'}}] 
...
</pre>

In **app/public/javascripts/newesapp.facetview.js** you also have the possibility to add extra functionalities after the list was displayed or a search was done. For this you only have to define your methods and call them in the **post_init_callback** or the **post_search_callback**. Ex:
<pre>
...
post_init_callback: function() {
	add_EEA_settings();
	<b>customPostInitFunction();</b>
},
post_search_callback: function() {
	add_EEA_settings();
	viewReady();
	<b>customPostSearchFunction();</b>
},
...
</pre>

**Important:** The default calls: **add_EEA_settings**, and **viewReady** should not be removed.

#####7.2 __Adding custom css code:__
By default the application contains a small css called **app/public/css/esbootstrap.facetview.css** what should be renamed and updated the same way you did for **app/public/javascripts/esbootstrap.facetview.js** 

####8. __Configure which fields to be displayed on the listing page, what facets to use, what fields to have in the exported csv/tsv file, how the details page should look like.__
All of these settings can be configured within indexing/mapping.json:
8.1 The first section is the "details_settings", where you can define the sections where the fields can be grouped.
In our example we defined 2 sections, one for general info about the visualization and one for the info about the creation
   "details_settings" : {
        "show_links": true,
        "sections": [
            {"name":"info",
             "title":"General info",
             "pos":0},
            {"name":"created",
             "title":"Created",
              "pos":1}
        ]
    }
Each section has a:
- name: which will be used for the fields which belongs to this section.
- title: which will be displayed on the view
- pos: the order of the details sections

8.2 The second section is the "fields_mapping", where all fields are enumerated and configured:
        {
            "name": "creator",
            "is_id": false,
            "is_link": false,
            "listing": {
                "title": "Creator",
                "visible" : true,
                "pos" : 3
            },
            "details": {
                "title": "Creator",
                "pos" : 3,
                "section": "created",
                "visible": true
            },
            "facet": {
                "visible": true,
                "title": "Creator",
                "pos": 0,
                "type": "facet",
                "size": 9999,
                "order": "term",
                "facet_display_options": ["sort", "checkbox"]
            },
            "csv_tsv": {
                "title": "Creator",
                "visible": true,
                "pos": 3
            }
        },

- name: is the name of the field
- listing: here you define if you want this field to be displayed on the main listing page, what position it should take and what title it should have:
            "listing": {
                "visible" : true,
                "title": "Column title",
                "pos" : 0
                "display": {
                    "pre": "a href=/details?id=",
                    "field": "_id",
                    "post": ">"
                }
            }
  It has the following attributes:
  - visible: boolean, controlling if it should be displayed in the list or not, if false all the other options will be ignored
  - title: the column name
  - pos: position in the table
  - display: optional attribute, you can add extra formatting or extra fields to be displayed
    NOTE: the first column should always use the display option and have the "post" attribute set to "</td>"


- facet
  - visible: boolean, controlling if it should be used as a facet or not, if false all other options will be ignored
  - title: label of the facet
  - pos: order of the facet
  - type: type of the facet that it can be
    - facet, it can be any kind of field
    - range, numeric field
    - geo, geo_point field
  - size: size of the facet if it's a simple facet
  - facet_display_options: options for the simple facet, usually enough to have "sort" and "checkbox" TODO: list all available options

- csv_tsv
  - visible: boolean, controlling if it should be used in the csv/tsv export or not, if false all other options will be ignored
  - title: the column name
  - pos: position in the export

9. app.js
  If the name of the indexing files were not changed and only a simple query is used for indexing, this file can remain unchanged.
  The options for starting the application should look like:
    options = {
      app_dir: __dirname,
      views: __dirname + '/views',
      settingsFile: __dirname + '/settings.json',
      routes: {
        routes: builtinRoutes,
        detailsIdName: 'id'
      },
      indexing:{
        managementCommands: managementCommands,
        indexingFilterQuery: null,
        indexingQuery: 'indexing/query.sparql',
        extraAnalyzers: '',
        dataMapping: 'indexing/dataMapping.json',
        endpoint: 'http://semantic.eea.europa.eu/sparql',
      }
    }
- app_dir: the absolute location of the application, leave it as it is
- views: the absolute location of the jade templates, by default it is in the views folder
- settingsFile: the absolute location of the settings.json
- routes: the settings for the available views for listing and detail pages.
  We have a builtin route for this, so if you don't have anything special then you don't need to do anything else.
  If you need extra functionality you will have to replicate the eea.searchserver.js/lib/builtinRoutes.js and implement the same methods.
      routes: {
        routes: builtinRoutes,
        detailsIdName: 'id'
      },

  - routes: the routes module you want to use, usually you can use the builtinRoutes
  - detailsIdName: the url attribute used for the details page
- indexing: The settings for the indexing module
  We have a builtin commands module with the basic "create_index", "sync_index", "remove_data" commands what can be used by any application.
  If you need extra commands you will have to replicate the eea.searchserver.js/lib/builtinCommands.js and implement your own commands
      indexing:{
        managementCommands: managementCommands,
        indexingFilterQuery: null,
        indexingQuery: 'indexing/query.sparql',
        extraAnalyzers: '',
        dataMapping: 'indexing/dataMapping.json',
        endpoint: 'http://semantic.eea.europa.eu/sparql',
      }
  - managementCommands: the commands module what you want to use
  - indexingFilterQuery: an optional value, for the filtering Query (see 5.1)
  - indexingQuery: the name of the file containing the sparql query
  - extraAnalyzers: the name of the json what contains the analyzers (see 6)
  - dataMapping: the name of the dataMapping file for indexing (see 6)
  - endpoint: the endpoint where the queries should be executed

  3. Add it in the docker-compose.dev.yml files
  Clone the docker-compose.dev.yml.example file under the name docker-compose.dev.yml and add to it the settings for development
    newesapp:
      image: eeacms/esbootstrap:dev # Work with dev build
      links:
          - esclient
      ports:
          - 3030:3000 # Take up an empty port number
      environment:
          - elastic_host=esclient
          - AUTO_INDEXING=true #index data when the app is started for the first time
  #        - SYNC_CRONTAB=*/2 * * * * # This is optional, it executes the sync with a cronjob
      volumes:
          - ./eea.docker.newesapp/app/:/code/:z # the volumes are added for easier development
          - ./eea.searchserver.js/lib/:/node_modules/eea-searchserver/lib/:z


10. Testing the application
In eea.docker.searchservices:
Create the dev image for the new app:
./build_dev.sh -s

Start the whole stack using:
docker-compose -f docker-compose.dev.yml up

Test in the browser

11. If the application is working, you should add it in the stack as a submodule
TODO

