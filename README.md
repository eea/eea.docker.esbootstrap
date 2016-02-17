# Bootstrap app for Nodejs Elasticsearch apps

This application is just a simple demo application what can should be used as a basis for new applications.
It can be cloned, and with minimal configuration a new search application created from it.

For creating a new application you have to follow the next steps:

Development:
1. Clone eea.docker.searchservices on the development machine:
  git clone --recursive https://github.com/eea/eea.docker.searchservices.git
2. Clone the eea.docker.esbootstrap application under a new name: eea.docker.newesapp

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

4. Configure the settings.json:
  "elastic" section set the index name and the real_index
  "elastic_green" section set the index name and the real_index

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

5. Identify the query you want to use.
Depending on the query you have, you have more options.
5.1 
If it's a select query what returns the data structured in the table.
Once you tried and tested your query on the endpoint, just copy it in the indexing/query.sparql.
In our example we use a simple query what returns all daviz visualizations:
query.sparql
PREFIX daviz: <http://www.eea.europa.eu/portal_types/DavizVisualization#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT distinct (?visualization as ?_id) ?visualization ?description ?title ?creator ?created (year(?created) as ?year)
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:description ?description}
     optional{?visualization dct:title ?title}
     optional{?visualization dct:creator ?creator}
     optional{?visualization dct:created ?created}
}

Depending the number of rows returned by your query, you might run in a timeout when indexing. If this occures, you should split up the indexing using a filter (ex. year of creation).
Supposing we have too many visualizations we can split up the results using a filter on the creator.
filterQuery.sparql
PREFIX daviz: <http://www.eea.europa.eu/portal_types/DavizVisualization#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT distinct ?creator
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:creator ?creator}
}

query.sparql will look like 
PREFIX daviz: <http://www.eea.europa.eu/portal_types/DavizVisualization#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT distinct (?visualization as ?_id) ?visualization ?description ?title ?creator ?created (year(?created) as ?year)
WHERE {
  ?visualization a daviz:DavizVisualization
     optional{?visualization dct:description ?description}
     optional{?visualization dct:title ?title}
     optional{?visualization dct:creator ?creator}
     optional{?visualization dct:created ?created}

  FILTER (?creator = '<creator>')
}

notice the FILTER clause in the query.sparql this query will be executed for each creator from the filterQuery.sparql
5.2
It it's a construct query
TODO

6. Data mapping for indexing:
It is done with the dataMapping.json. By default elasticsearch tries to make a guess on the data type for each attribute, but sometimes is usefull to specify it explicitely.
The most common types are:
string, long, integer, double, date, boolean, geo_point
A full list of types is listed on:
https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html
the analyzer attribute in normal case should be none, but if there is a list of values you can use our built in analyzers:
coma or semicolon
example of mapping for a field:
  "visualization" : {
        "type" : "string",
        "analyzer" : "none"
  },
Also it is possible to create your own analyzer
TODO

7. Configure the layout of the pages:
For templating we use nodejs's jade template: http://naltatis.github.io/jade-syntax-docs/
The default templates are located in the view folder, we have index.jade and details.jade
The main blocks are specified, in most cases only the labels like title, breadcrumbs should be changed

7.1 You have the possibility to add custom css and js files.
The location of these files are public/css and public/js
We have a default js for creating the listing page for the application, called:
esbootstrap.facetview.js.
You should rename it to newesapp.facetview.js and update the extrajavascripts block in index.jade.
In normal cases you only have to specify is the default_sort. If you don't need it, leave it as an empty list.

We also provide a default css called esbootstrap.facetview.css

If you need any extra functionality what is implemented with javascript or some special layout using css you can add in the extrajavascripts and extrastyles blocks. You can add different extra js&css for index and details pages.

8. Configure which fields to be displayed on the listing page, what facets to use, what fields to have in the exported csv/tsv file, how the details page should look like.
We have the mapping.json where all these settings should be done:
8.1 The first section is the "details_settings", where you can define the sections where the where the fields can be grouped.
In our example we defined 2 sections, one for general info about the visualization, one for info about the creation
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
Each section has
- name: a name what will be used in for the fields which belongs to this section.
- title: a title what will be displayed on the view
- pos: the order of the details sections

8.2 The second section is the "fields_mapping", where all fields are enumarated and configured
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
- listing: here you define if you want this field to be displayed on the main listing page, what position it should take and what title:
            "listing": {
                "visible" : true,
                "title": "Column title",
                "pos" : 0
                "display": {
                    "pre": "<a href=/details?id=",
                    "field": "_id",
                    "post": ">"
                }
            }
  It has the following attributes:
  - visible: boolean, should it be displayed in the list or not, if false all other options will be ignored
  - title: the column name
  - pos: position in the table
  - display: optional attribute, you can add extra formatting or extra fields to be displayed
    NOTE: the first column should always use the display option and have the "post" attribute set to "</td>"


- facet
  - visible: boolean, should it used as a facet or not, if false all other options will be ignored
  - title: label of the facet
  - pos: order of the facet
  - type: type of the facet, it can be
    - facet, it can be any kind of field
    - range, numeric field
    - geo, geo_point field
  - size: size of the facet if it's a simple facet
  - facet_display_options: options for the simple facet, usually enough to have "sort" and "checkbox" TODO: list all available options

- csv_tsv
  - visible: boolean, should it be used in the csv/tsv export or not, if false all other options will be ignored
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
- routes: the settings for the available views for listing and detail
  We have a builtin route for this, so if you don't have anything special, you can use it.
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



10. Testing the application
In eea.docker.searchservices:
Create the dev image for the new app:
./build_dev.sh newesapp

Start the whole stack:
docker-compose -f docker-compose.dev.yml up

Test in the browser

11. If the application is working, you can
2.1 create a git repo for the new application: eea.docker.newesapp
