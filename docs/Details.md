# eea.docker.esbootstrap
esbootstrap configuration

## Setup

All apps configurations are placed in the config folder. An app folder contains these files

<pre>
    └── default
        ├── mapping.json
        ├── filtersQuery.sparql
        ├── query.sparql
        ├── facets.json
        ├── settings.json
        ├── riverconfig.example.json
        ├── riverconfig_1.json
        ├── riverconfig_2.json
        ├── public
        │   ├── custom_css
        │   └── custom_js
        └── views
            ├── cardview.jade
            ├── listview.jade
            └── landingview.jade
</pre>

### __Configure settings.json__

The **/*default*/settings.json** is the place where external templates, custom strings and the elastic index is configured. Usually the external templates should remain unchanged, but the **index** and **layout_vars**
should be configured for the new application.

#### __Configure the elastic index__

<pre>
	"elastic": {
	    "index": "newesappdata",
        "type": "resources",
        "field_base":""
        "enableValuesCounting": false
	},
</pre>

 - in the **elastic** section you only have to set the **index** attribute. The application will automatically enable blue/green indexing.
 - the **enableValuesCounting** option is by default set on **false**. If it's set on **true**, on indexing an extra property will be added for each property called: **items_count_property_name** and will contain the number values stored in the property. This is required by the **exact search** feature.

#### __Configure rivers__
If you use the rdfriver with CONSTRUCT queries, and you use the built in query builder (ex. in the eeasearch app), you have the possibility to set up one or more sources for your data. For this you have to use the **river_configs**:
<pre>
    "river_configs": {
        "configs": [
            {
                "id": "rod_instruments",
                "cluster_name": "reportnet",
                "config_file": "riverconfig_1.json"
            },
            {
                "id": "rod_obligations",
                "cluster_name": "reportnet",
                "config_file": "riverconfig_2.json"
            }
        ]
    }
</pre>

You have to specify:
 - **id** a unique ID for the source
 - **cluster_name** a name where the source should be grouped, more sources may have the same **cluster_name**
 - **config_file** the specific configuration for the source

#### __Configure custom layout string__

in the **layout_vars** section you can change some layout configurations like title, description, show/hide breadcrumb and other.

<pre>
  "layout_vars": {
        "head_title": "Elasticsearch bootstrap application",
        "css_resources": {
            "index_page": [
                "css/no-more-tables.css",
                "css/esbootstrap.facetview.css"
            ],
            "details_page": [
                "css/esbootstrap.facetview.css"
            ]
        },
        "js_resources": {
            "index_page": [
                "javascripts/esbootstrap.facetview.js"
            ],
            "details_page": [
                "javascripts/jq.tools.js",
                "http://www.eea.europa.eu/register_function.js",
                "http://www.eea.europa.eu/nodeutilities.js",
                "http://www.eea.europa.eu/mark_special_links.js"
            ]
        },
        "site_title": "Elasticsearch bootstrap application",
        "site_description": "Simple customizable bootstrap application",
        "enableBreadcrumbs": true,
        "breadcrumbs": "esbootstrap",
        "dataprovencance_info_text": "ES bootstrap",
        "dataprovencance_info_url": "http://www.eea.europa.eu/data-and-maps/daviz",
        "further_info": ""
    }
</pre>

 - **head_title**: it is the text showed on title bar of the browser;
 - **css_resources**, **js_resources**: it contains the urls of CSS/JS files to be injected into HTML of your app. It can be divided in two or more section depending on how many pages have your app, generally "index" and "details". If you added a public folder with your custom css or javascripts, you have to add those resources to the css/js list.**The sorting of the urls in the lists is the order for which they will be injected into HTML**;
 - **site_title**: it is the text of H1 html tag of your app;
 - **site_description**: it is the description text;
 - **enableBreadcrumbs**: show/hide the breadcrumbs, possible values are ```true``` or ```false```;
 - **breadcrumbs**: it is text of the first breadcrumb;
 - **dataprovencance_info_text**: it is the text of the link to the data provenance info;
 - **dataprovencance_info_url**: it is the url of the link to the data provenance info;
 - **further_info**: you can add a small HTML that be renderer below the data provenance info.

#### __Enable/disable landing page__
<pre>
	"landingpage_enabled": false
</pre>
By default the landing page is disabled. When enabled, you should add the template for it in the **views** folder, and all the logic and style should be implemented in the public folder.

### __Set up the SPARQL Query to be indexed in Elasticsearch__
Usually the first step is to try the query directly on the virtuoso endpoint. Once you get the data you need, you can start to configure the application for this query.
Depending on the query you have, there are several options.

#### __Simple Select query__ when there are not too many results
If it's a select query which returns the data structured in the table, once you tried and tested your query on the endpoint, just paste it in the query.sparql file.
**Important:** All indexing queries should contain a unique _id column.
In our example we use a simple query what returns all daviz visualizations:
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
Create **filtersQuery.sparql** and fill it with:
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/&gt;
SELECT distinct ?creator
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:creator ?creator}
}
</pre>
This query will return all **creators** for DavizVisualiztaions, so we have to update our **query.sparql** to use the **creator** as a filter value.
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
Notice the **FILTER** clause in the **query.sparql** as this query will be executed for each creator from the filtersQuery.sparql query.

#### __Construct query__
If you have a **construct** query or a **select** query that returns SPO triples, you will use our rdfriver plugin for elasticsearch. This is transparent, in normal cases you shouldn't do any extra configuration. Only when you have a **select** query, it is required to put a comment on the top of the sparql query what contains the string "construct".

##### __Normalize properties for construct queries__
When a **construct** query is used, the properties will be long strings. As these properties will appear in all queries and url's you might want to replace them with  shorter names. For this you can use **normalize.json** where you have to define the pairs of property-replacement.
Ex:
<pre>
{
  "http://purl.org/dc/terms/title": "title",
  "http://purl.org/dc/terms/description": "description",
  "http://purl.org/dc/terms/creator": "creator",
  "http://purl.org/dc/terms/created": "created",
  "http://www.eea.europa.eu/portal_types#topic": "topic",
  "http://www.eea.europa.eu/portal_types/DavizVisualization#temporalCoverage": "temporalCoverage",
  "http://www.eea.europa.eu/portal_types/DavizVisualization#themes": "themes",
  "http://www.w3.org/ns/dcat#theme": "theme",
  "http://purl.org/dc/terms/subject": "subject"
}
</pre>
After the normalize.json is set up, you can use your short names in the **mapping.json**. 
**Note: ** in the dataMapping.json you still have to use the original property names.

### __Data mapping for indexing in Elasticsearch__
When new data is indexed, by default Elasticsearch tries to make a guess on the data type for each attribute, but sometimes it's useful to specify it explicitly.
Data mapping for elasticsearch is done within **mapping.json**.
example of mapping for a field:
<pre>  "visualization" : {
        "type" : "string",
        "analyzer" : "none"
  },
</pre>
- the **analyzer** attribute in normal cases should be none, but if there is a list of values you can use our builtin analyzers:
	- coma
	- semicolon
    - Also it is possible to create your own analyzer
TODO
- for **type** the most common data types are:
	- string,
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
All of these settings can be configured within **default/default/facets.json**. Based on this configuration file the data retrieved from Elasticsearch will be displayed on the views.
<pre>
{
    "details_settings" : {
		...
    },
    "fields_mapping": [
	    ...
	],
	"highlights": {
		...
	},
	"types": {
		...
	}
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
	  "values_whitelist":[],
	  "values_blacklist":[],
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
          "facet_display_options": ["sort", "checkbox"],
          "allow_exact": false,
          "desctext":""
	},
    "csv_tsv": {
	    "title": "Creator",
        "visible": true,
        "pos": 3
	},
	"card": {
	    "field": "creator",
        "default": "",
        "visible": true,
        "type": "simple"
	 },
     "list": {
	     "field": "creator",
         "default": "",
         "visible": true,
         "type": "simple"
	  }
},
</pre>

The attributes are:

- **name**: is the name of the field
- **values_whitelist** and **values_blacklist**: can be used to filter what values to be displayed. By default they are empty, but they accept a list of elements what will be applied in all views. The white and blacklists can be overwritten in the listing, facets, csv_tsv, card, list sections, and it will be applied only for that view.
- **listing**: here you define if you want this field to be displayed on the main listing page, what position it should take and what title it should have:
    <pre>
	"listing": {
		"visible" : true,
		"type": "",
		"format": "",
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
 - **type**: currently the only available options are "date", or empty/missing. If it's set to "date", it will format the date to the form given in the "format" attribute
 - **format**: only used when "type" is set to "date". Ex: "dd M yy"
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
          "facet_display_options": ["sort", "checkbox"],
          "allow_exact": false,
          "desctext":""
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
  - **order**: order can be one of the following
  	    - **term**: sorted by alphanumeric order "a-z"
	    - **reverse_term**: or "rterm" for reversed alphanumeric order "z-a"
	    - **count**: sorted by count, smaller on top
	    - **reverse_count**: or "rcount", sorted by count, largest on top
  - **facet_display_options**: options for the simple facet, usually enough to have "sort" and "checkbox"
  - TODO: list all available options
  - **allow_exact**: by default is set on false. If set on true, it will add a checkbox on the facet, and using it, the user can select if he wants exact search results or not.
  - **desctext**: by default empty. If set, this description text will be displayed in the header of the facet.
  - **default_distance**: should be added only for **geo facet type**, specifying the initial coordinates (lat, lng) of the circle shape center and the radius (rad) of the circle.
  - **default_bounds**: should be added only for **geo facet type**, specifying the initial coordinates of the upper left corner (lat1, lng1) and lower right corner (lat2, lng2) of the rectangle shape. See example below:
  <pre>
      "default_distance": { "lat": 48.738525, "lng": 13.981955, "rad": 250000 },
      "default_bounds": { "lat1": 50.738525, "lng1": 9.981955, "lat2": 46.738525, "lng2": 18.981955 }
  </pre>
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

- **card** && **list**
	This is an optional section, here you can configure if the field is used in the card view, what name it has, and how to handle if it's a list.
	<pre>
	"card": {
	    "type": "date",
        "format": "dd M yy",
        "field": "date",
        "default": "",
        "visible": true
	},
	</pre>
    attributes:
	- **field**: how it is used in the template
	- **default**: it's default value
	- **visible**: boolean value for enable/disable (mostly for development/debugging)
	- **type** and **format**: Works similar as described in the **listing** section but with some extra options. Possible values: "date", "simple", "list". 
		- **simple** if the field contains multiple values, only the first will be used
		- **list** all values from the field will be merged into one csv separated string

##### __highlights__
By default the elasticsearch highlight is disabled. If you enable it, you can configure with the whitelist and blacklist, which columns should contain the highlighted texts.
<pre>
    "highlights": {
        "enabled": true,
        "whitelist": [
            "http://purl.org/dc/terms/title",
            "label",
            "http://purl.org/dc/terms/description",
            "http://www.eea.europa.eu/portal_types#topic"
            ],
        "blacklist": []
    },
</pre>

##### __types__
This property is a mapping tool, where we can normalize the content types to a specific form. This is useful especially in the eeasearch app, where we want to display the type icon, for the documents, but the content types doesn't exactly match with the icon names we have in portal_depiction.
<pre>
"types": {
        "contentTypeNormalize": {
            "highlight": "highlight",
            "press-release": "pressrelease",
			 ...
        },
        "defaultContentType" : "generic",
        "images": {
            "fallback_thumb" : "",
            "fallback_icon" : "",
            "rules": [
                {
                    "rule": "startsWith",
                    "operator": "",
                    "field": "http://www.w3.org/1999/02/22-rdf-syntax-ns#about",
                    "value": "http://www.eea.europa.eu",
                    "thumb_template": {
                        "template": "${url}/image_preview",
                        "variables": [{
                                "name": "url",
                                "type" : "field",
                                "field" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#about"
                        }]
                    },
                    "icon_template": {
                        "template": "http://www.eea.europa.eu/portal_depiction/${contentType}/image_thumb",
                        "variables": [{
                                "name": "contentType",
                                "type" : "variable",
                                "variable" : "contentType"
                        }]
                    }
                },
				...
            ]
        }
},
</pre>
	
 attributes:

 - **contentTypeNormalize**: is the mapping
 - **defaultContentType**: the default value if a type is missing from the mapping
 - **images**: describes how the url of the images should be built based on the content type. It can be done using the fallback properties, and a set of rules:
	- **fallback_thumb**: the default thumbnail image
	- **fallback_icon**: the default icon
	- **rules**: a list of rules with conditions on an attribute, and a description on what the thumb and icon image should be built:
		- **rule**: can be "startsWith" or "contains"
		- **operator**: by default empty, but it might be "none"
		- **field**: the field from elastic on what we apply the rule
		- **value**: the value what we look for in the field
		- **thumb_template** and **icon_template**: the templates for the image urls
			- **template**: should be something like: "${url}/image_preview"
			- **variables**: a list of variables what will be filled in the template
				- **name**: the name of the variable from the template string
				- **type**: "field" or "variable". If "field" is specified, it will take the value from elastic. If "variable" is selected, it will take the value from the variable defined in the "card" or "list" sections.
				- **variable** or **field**: you only have to specify one of them, depending the **type** you've chosen. It should contain the name of the **field** or the **variable**
			
### __Enabling exact search feature__
For enabling the **exact search** two settings are required

 1. Enable column counting for properties. This is done using **enableValuesCounting** from **settings.json** and after setting it, a reindex is required
 2. In **mapping.json**, for facets where we want the exact search option, enable it using the **allow_exact** option.

### __Configure the layout of the pages__
For templating we use nodejs's jade template: http://naltatis.github.io/jade-syntax-docs/
The default templates are:

- **app/views/index.jade**
- **app/views/details.jade**
The main blocks are already specified, in most cases only the labels like title or breadcrumbs should be changed.

#### __Adding custom js code__
The location for js files is **app/public/javascripts**.
We have a default js for creating the listing page for the application, called: **app/public/javascripts/esbootstrap.facetview.js**.
Once a new application is created, it's recommended to rename it to **app/public/javascripts/newesapp.facetview.js** and update the url in **js_resources** block in **/*default*/settings.json**.
**js_resources** is the place where you have to add any extra libraries:

<pre>
...
"js_resources": {
    "index_page": [
        "javascripts/**newapp**.facetview.js"
    ],
    "details_page": [
        "javascripts/jq.tools.js",
        "http://www.eea.europa.eu/register_function.js",
        "http://www.eea.europa.eu/nodeutilities.js",
        "http://www.eea.europa.eu/mark_special_links.js"
    ]
},
...
</pre>
**Note:** You can add different js on the index and the detail section.

After added, you can start customizing the **app/public/javascripts/newesapp.facetview.js**.
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

#### __Customize card and list views__
By default we use the predefined templates from eea.searchserver.js: 
https://github.com/eea/eea.searchserver.js/blob/master/lib/framework/views/cardview.jade
https://github.com/eea/eea.searchserver.js/blob/master/lib/framework/views/listview.jade
If you want to customize it, is enough to copy them in your application in the **app/config/views** folder, and you can start modifying it. In the template you have access to all fields what you specified in the **mapping.json** in section **fields_mapping** in the **card** or **list** attributes of the fields. Ex: if you have in the **mapping.json**:
<pre>
	"card": {
	    "type": "date",
        "format": "dd M yy",
        "field": "date",
        "default": "",
        "visible": true
	},
</pre>
in the template you can have
<pre>
...
time(class="eea-tileIssued", datetime="${date}") ${date}
...
</pre>

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
        dataMapping: 'indexing/mapping.json',
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
        dataMapping: 'indexing/mapping.json',
        endpoint: 'http://semantic.eea.europa.eu/sparql',
      }
      </pre>
  - **managementCommands**: the commands module what you want to use
  - **indexingFilterQuery**: an optional value, for the filtering Query (see 4.2)
  - **indexingQuery**: the name of the file containing the sparql query
  - **extraAnalyzers**: the name of the json what contains the analyzers (see 5)
  - **dataMapping**: the name of the mapping file for indexing (see 5)
  - **endpoint**: the endpoint where the queries should be executed

  We have a builtin commands module with the basic "create_index", "sync_index", "remove_data" commands what can be used by any application.
  If you need extra commands you will have to replicate the eea.searchserver.js/lib/builtinCommands.js and implement your own commands
