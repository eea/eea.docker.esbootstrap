# Details

## eea.docker.esbootstrap structure

<pre>
	├── app
	│   ├── config
	│   │   ├── dataMapping.json
	│   │   └── query.sparql
	│   │   └── mapping.json
	│   │   └── settings.json
	│   ├── public
	│   │   ├── css
	│   │   │   └── esbootstrap.facetview.css
	│   │   └── javascripts
	│   │       └── esbootstrap.facetview.js
	│   ├── views
	│   |   ├── details.jade
	│   |   └── index.jade
	│   ├── app.js
	│   ├── package.json
	├── Dockerfile
	├── Dockerfile.dev
	└── README.md
</pre>

 - **app/config** is the folder what contains the indexing scripts, the data
mapping for elasticsearch and optionally a configuration file for analyzers.
 - **app/config/mapping.json** contains the configuration of the pages, including listing
 - **app/config/settings.json** contains information about the external templates, the
elastic index to be used in the app and some information for customize the layout
 - view, facets, detail view, csv/tsv export
 - **app/public** contains the static resources
 - **app/views** contains the jade templates for index and detail pages
 - **app/app.js** is the main application
 - **app/package.json** contains information about the application, version number,
dependencies, etc.
 - **Dockerfile** the production Dockerfile for the application, in most cases this
should not be modified
 - **Dockerfile.dev** the development Dockerfile for the application,
in most cases this should not be modified

## Setup

All configurations are place in the **config** folder. This folder contains these files

<pre>
    ├── config
    │   ├── dataMapping.json
    │   └── query.sparql
    │   └── mapping.json
    │   └── settings.json
</pre>

### __Configure settings.json__

The **app/config/settings.json** is the place where external templates, customstring and the elastic index is configure. The external templates should remain unchanged, but the **index** and **layout_vars**
should be configured for the new application.

#### __Configure the elastic index__

<pre>
	"elastic": {
	    "index": "newesappdata",
        "type": "resources",
        "field_base":""
	},
</pre>

 - in the **elastic** section you only have to set the **index** attribute. The application will automatically enable blue/green indexing.

#### __Configure custom layout string__

<pre>
  "layout_vars": {
        "site_title": "Elasticsearch bootstrap application",
        "site_description": "Simple customizable bootstrap application",
        "breadcrumbs": "esbootstrap",
        "dataprovencance_info_text": "ES bootstrap",
        "dataprovencance_info_url": "http://www.eea.europa.eu/data-and-maps/daviz",
        "further_info": ""
    }
</pre>

 - in the **layout_vars** section you can edit the strings to be describe the title and the text description of your app.
 - in **further_info** you can add a small HTML that be renderer below the data provenance info.


### __Set up the SPARQL Query to be indexed in Elasticsearch__
Usually the first step is to try the query directly on the virtuoso endpoint. Once you get the data you need, you can start to configure the application for this query.
Depending on the query you have, there are several options.

#### __Simple Select query__ when there are not too many results
If it's a select query which returns the data structured in the table, once you tried and tested your query on the endpoint, just paste it in the indexing/query.sparql file.
**Important:** All indexing queries should contain a unique _id column.
In our example we use a simple query what returns all daviz visualizations:
**app/config/query.sparql**
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
#### __Filtered Select queries__
Depending on the number of rows returned by your query, you might run into a timeout when indexing. If this occures, you should split up the indexing using a filter (ex. year of creation).
Supposing we have too many visualizations we can split up the results using a filter on the creator.
Create **app/config/filterQuery.sparql** and fill it with:
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/&gt;
SELECT distinct ?creator
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:creator ?creator}
}
</pre>
This query will return all **creators** for DavizVisualiztaions, so we have to update our **app/config/query.sparql** to use the **creator** as a filter value.
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
Notice the **FILTER** clause in the **app/config/query.sparql** as this query will be executed for each creator from the filterQuery.sparql query.

#### __Construct query__
TODO

### __Data mapping for indexing in Elasticsearch__
When new data is indexed, by default Elasticsearch tries to make a guess on the data type for each attribute, but sometimes it's useful to specify it explicitly.
Data mapping for elasticsearch is done within **app/config/dataMapping.json**.
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

#### __Configure fields definition for the presentation layer__
In this paragraph we describe how we can configure what data to be displayed on the listing and detail pages, what data to be used as facets, and what data should appear in the csv/tsv export.
All of these settings can be configured within **app/config/mapping.json**. Based on this configuration file the data retrieved from Elasticsearch will be displayed on the views.
<pre>
{
    "details_settings" : {
		...
    },
    "fields_mapping": [
	    ...
	]
}
</pre>

##### __details_settings__
The first section is the **details_settings**, where you can define the sections where the fields can be grouped
In our example we defined 2 sections, one for general info about the visualization and one for the info about the creation
<pre>
   "details_settings" : {
        "sections": [
            {"name":"info",
             "title":"General info",
             "pos":0},
            {"name":"created",
             "title":"Created",
              "pos":1}
        ]
    }
</pre>
Each section has the following attributes:

- **name**: which will be used for the fields which belongs to this section
- **title**: which will be displayed on the view
- **pos**: the order of the details sections

##### **fields_mapping**
The second section is the **fields_mapping**, where all fields are enumerated and configured.
For one field the setting looks like:
<pre>
  {
	  "name": "creator",
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
</pre>

The attributes are:

- **name**: is the name of the field
- **listing**: here you define if you want this field to be displayed on the main listing page, what position it should take and what title it should have:
    <pre>
	"listing": {
		"visible" : true,
		"title": "Column title",
		"pos" : 0
		"display": {
		    "pre": "&lta href=/details?id=",
	        "field": "_id",
            "post": "&gt"
		}
	}
    </pre>
with the attributes:
 - **visible**: boolean, controlling if it should be displayed in the list or not, if false all the other options will be ignored
 - **title**: the column name
 - **pos**: position in the table
 - **display**: optional attribute, you can add extra formatting or extra fields to be displayed. In the **pre** and **post** attributes you can specify html snippet what will be displayed for this item. in the **field** attribute you can specify the name of the field. Usually the **field** attribute is identical with the original **name** but you can use others too. This is useful when you try to create links to detail pages.
	  **IMPORTANT**: the first column should always use the display option and have the "post" attribute set to "&lt;/td&gt;"

- **facet**
	In this section you can configure if you want a facet based on this field, and how it should look like:
	<pre>
      "facet": {
		  "visible": true,
          "title": "Creator",
          "pos": 0,
          "type": "facet",
          "size": 9999,
          "order": "term",
          "facet_display_options": ["sort", "checkbox"]
	},
	</pre>
	with the attributes:
  - **visible:** boolean, controlling if it should be used as a facet or not, if false all other options will be ignored
  - **title**: label of the facet
  - **pos**: order of the facet
  - **type**: type of the facet that it can be
	    - **facet**: it can be any kind of field
	    - **range**: numeric field
	    - **geo**: geo_point* field
  - **size**: size of the facet if it's a simple facet
  - **facet_display_options**: options for the simple facet, usually enough to have "sort" and "checkbox"
  - TODO: list all available options

- **csv_tsv**
	In this section you can configure the field for csv/tsv export
	<pre>
    "csv_tsv": {
	    "title": "Creator",
        "visible": true,
        "pos": 3
	}
	</pre>
	with the attributes:
  - **visible**: boolean, controlling if it should be used in the csv/tsv export or not, if false all other options will be ignored
  - **title**: the column name
  - **pos**: position in the export

### __Configure the layout of the pages__
For templating we use nodejs's jade template: http://naltatis.github.io/jade-syntax-docs/
The default templates are:

- **app/views/index.jade**
- **app/views/details.jade**
The main blocks are already specified, in most cases only the labels like title or breadcrumbs should be changed.

#### __Adding custom js code__
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
In the bootstrap application we already added a small method for formating chemical formulas. See the **replaceNumbers** method from **app/public/javascripts/esbootstrap.facetview.js**. You can see how it's added in the **post_init_callback** and **post_search_callback**. This method can be removed.
**Important:** The default calls: **add_EEA_settings**, and **viewReady** should not be removed.

##### __Adding custom css code__
By default the application contains a small css called **app/public/css/esbootstrap.facetview.css** what should be renamed and updated the same way you did for **app/public/javascripts/esbootstrap.facetview.js**

### __Configure the main application__
  For this you have to work on the **app/app.js** file.
  If the name of the indexing files were not changed and only a simple query is used for indexing, this file can remain unchanged.
  If there were changes in the naming of indexing files or templates, you will have to modify the **app/app.js**
  The options for starting the application should look like:
<pre>
    options = {
      app_dir: __dirname,
      views: __dirname + '/views',
      settingsFile: __dirname + '/config/settings.json',
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
</pre>
with the attributes:

- **app_dir**: the absolute location of the application, leave it as it is
- **views**: the absolute location of the jade templates, by default it is in the views folder
- **settingsFile**: the absolute location of the settings.json
- **routes**: the settings for the available views for listing and detail pages.
  We have a builtin route for this, so if you don't have anything special then you don't need to do anything else.
	<pre>
      routes: {
        routes: builtinRoutes,
        detailsIdName: 'id'
      },
	</pre>

  - **routes**: the routes module you want to use, usually you can use the builtinRoutes
  - **detailsIdName**: the url attribute used for the detail pages

  If you need extra functionality you will have to replicate the eea.searchserver.js/lib/builtinRoutes.js and implement the same methods.
- **indexing**: The settings for the indexing module
	<pre>
      indexing:{
        managementCommands: managementCommands,
        indexingFilterQuery: null,
        indexingQuery: 'indexing/query.sparql',
        extraAnalyzers: '',
        dataMapping: 'indexing/dataMapping.json',
        endpoint: 'http://semantic.eea.europa.eu/sparql',
      }
      </pre>
  - **managementCommands**: the commands module what you want to use
  - **indexingFilterQuery**: an optional value, for the filtering Query (see 4.2)
  - **indexingQuery**: the name of the file containing the sparql query
  - **extraAnalyzers**: the name of the json what contains the analyzers (see 5)
  - **dataMapping**: the name of the dataMapping file for indexing (see 5)
  - **endpoint**: the endpoint where the queries should be executed

  We have a builtin commands module with the basic "create_index", "sync_index", "remove_data" commands what can be used by any application.
  If you need extra commands you will have to replicate the eea.searchserver.js/lib/builtinCommands.js and implement your own commands
