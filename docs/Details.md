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
        │   ├── custom.css
        │   └── custom.js
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
        "override_searchserver_resources": false,
        "skip_external_template_styles": false,
        "skip_resources_bundling": false,
        "css_resources": {
            "index_page": [
                "/custom.css",
                "css/no-more-tables.css",
                "css/esbootstrap.facetview.css"
            ],
            "details_page": [
                "/custom.css",
                "css/esbootstrap.facetview.css"
            ]
        },
        "js_resources": {
            "index_page": [
                "/custom.js",
                "javascripts/esbootstrap.facetview.js"
            ],
            "details_page": [
                "/custom.js",
                "javascripts/jq.tools.js"
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
 - **override_searchserver_resources**: if set to *true* it will only load the
   files defined in *css_resources* and *js_resources*. This means that
   you should also define a **layout_page** section which defines the base resources that should be loaded by the custom app. See the following [config](https://github.com/eea/eea.esbootstrap.configs/blob/master/CaR/settings.json#L17) for a real world example on an app that loads specific resources
   only.
   
   If set to *false* which is the value set by default the resources defined in settings.json will be added after the resources defined in [builtinBundles.json](https://github.com/eea/eea.searchserver.js/blob/master/lib/builtinBundles.json#L2)  
 - **skip_external_template_styles**: set to *false* by default, if enabled we no
   longer load the external template styles and instead we load a css file named *critical.css*. This is useful for performance reasons since *critical.css* contains the EEA header and footer, therefore
   we need to load less resources that might need afterwards to be overriden.
 - **skip_resources_bundling**: set to *false* by default, if set to *true* the
   css and javascript will no longer be concatenated, useful to set to *true* when
   debugging resources.
 - **css_resources**, **js_resources**: it contains the urls of CSS/JS files to be injected into HTML of your app. It can be divided in two or more section depending on how many pages have your app, generally "index" and "details". If you added a public folder with your custom css or javascripts, you have to add those resources to the css/js list.**The sorting of the urls in the lists is the order for which they will be injected into HTML**;
   
   Although you can add external resources in these two fields it is adviced to
   add only local resources since these resources we can bundle up in a single
   file for better site performance
 - **site_title**: it is the text of H1 html tag of your app;
 - **site_description**: it is the description text;
 - **enableBreadcrumbs**: show/hide the breadcrumbs, possible values are ```true``` or ```false```;
 - **breadcrumbs**: it can be a text, what will be used as the first breadcrumb. If text is used, the "Home" breadcrumb will automatically point to "https://www.eea.europa.eu".
   It can also be a list of dictionaries, where the key represents the label to be displayed in the breadcrumb, and the value represents the link. This is useful when the starting point of the breadcrumbs has more elements (ex. the CaR app, where we have "Home">"Countries and Regions">"Country")
   ex:
  ```
  "breadcrumbs": [{"Home":"https://www.eea.europa.eu"},{"Countries and regions":"https://www.eea.europa.eu/countries-and-regions"},{"${external_config.title}":""}],
  ```
  
  Also, you can notice, the last key is a variable.
  **Note:** Currently only variables from the external_configs are supported.
 - **dataprovencance_info_text**: it is the text of the link to the data provenance info;
 - **dataprovencance_info_url**: it is the url of the link to the data provenance info;
 - **further_info**: you can add a small HTML that be renderer below the data provenance info.

#### __Enable/disable landing page__
<pre>
  "landingpage_enabled": false
</pre>
By default the landing page is disabled. When enabled, you should add the template for it in the **views** folder, and all the logic and style should be implemented in the public folder.

#### __Add/Remove DRAFT watermark__

Bydefaul, a DRAFT watermark is displayed in the background of the elastic app. Because a new application is always regarded DRAFT until it is intentionally marked as ready. When an application is regarded ready the DRAFT watermark can be removed by adding the following CSS in public > custom.css:

<pre>
/* Remove DRAFT watermark */
#content {
    background:white;
}
</pre>

If you want the DRAFT watermark back just remove the lines above from custom.css.

### __Set up the SPARQL Query to be indexed in Elasticsearch__
Usually the first step is to try the query directly on the virtuoso endpoint. Once you get the data you need, you can start to configure the application for this query.
Depending on the query you have, there are several options.

#### __Simple Select query__ when there are not too many results
If it's a select query which returns the data structured in the table, once you tried and tested your query on the endpoint, just paste it in the query.sparql file.
**Important:** All indexing queries should contain a unique column as _id, make sure the string is URL encoded, in sparql you can use encode_for_uri() function.
In our example we use a simple query what returns all daviz visualizations:
<pre>
PREFIX daviz: &lt;http://www.eea.europa.eu/portal_types/DavizVisualization#&gt;
PREFIX dct: &lt;http://purl.org/dc/terms/&gt;
SELECT distinct (encode_for_uri(?visualization) as ?_id) ?visualization ?description ?title ?creator ?created (year(?created) as ?year)
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
          "desctext":"",
          "short_name": "Value",
          "empty_message": "No values to show",
          "autocomplete": false, 
          "autocomplete_placeholder": "Search for value"
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
  - **short_name**: by default "**Value**". The label what will be displayed in top of the values for facets, used for sorting.
  - **empty_message**: by default "**No values to show**". The message what is displayed when no values are available for the facet.
  - **autocomplete**: by default **false**. Enable if you want a search field in top of the facet, to quickly search for a value. Useful when you have lots of values.
  - **autocomplete_placeholder**: by default "**Search for value**". Placeholder for autocomplete search input.
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
Once a new application is created, it's recommended to add **app/public/custom.js** and add the url in **js_resources** block in **/*default*/settings.json**.
**js_resources** is the place where you have to add any extra libraries:

<pre>
...
"js_resources": {
    "index_page": [
        "/custom.js", // add custom.js before esbootstrap.facetview.js
        "javascripts/esbootstrap.facetview.js"
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

After added, you can adding customizations to **app/public/custom.js**.
In normal cases you only have to specify is the **default_sort**:

- If you don't need any sort on the listing view, just set an empty list:
<pre>
...
window.esbootstrap_options = {
    default_sort: []
}
...
</pre>
- But you can easily add a sort by doing something like:
<pre>
...
window.esbootstrap_options = {
    default_sort: [{'created':{'order':'asc'}}]
}
...
</pre>
You only have to specify the name of the field and if the order is ascending or descending.
There is also possible to set the sort on more fields:
<pre>
...
window.esbootstrap_options = {
    default_sort: [{'field1':{'order':'asc'}}, {'field2':{'order':'asc'}}]
}
...
</pre>
And the ability to modify more options, see **app/public/javascripts/esbootstrap.facetview.js** for all options:
<pre>
...
window.esbootstrap_options = {
        initial_search: false,
        enable_rangeselect: true,
        enable_geoselect: true
}
</pre>

In **app/public/custom.js** you also have the possibility to add extra functionalities after the list was displayed or a search was done. For this you only have to define your methods and call them in the **post_init_callback** or the **post_search_callback** custom event binding. Ex:
<pre>
...

$(window).bind('post_init_callback', function(){
  <b>customPostInitFunction();</b>
});

$(window).bind('post_search_callback', function(){
  <b>customPostSearchFunction();</b>
});
...
</pre>
In the bootstrap application we already added a small method for formating chemical formulas. See the **replaceNumbers** method from **app/public/javascripts/esbootstrap.facetview.js**. You can see how it's added in the **post_init_callback** and **post_search_callback**. This method can be removed.
**Important:** The default calls: **add_EEA_settings**, and **viewReady** should not be removed.

##### __Adding custom css code__
By default the application contains a small css called **app/public/css/esbootstrap.facetview.css**. You should add another css file called **app/public/custom.css" if you want to add any css.

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
  
### __Autocomplete, Suggestions, Highlights__
 - in settings.json enable the suggestions by adding:
  ```
  suggestions_enabled = true
  ```
  
 - in mapping.json add the two fields:
 ```
  "did_you_mean": {"type": "string", "analyzer": "didYouMean"},
  "autocomplete": {"type": "string", "analyzer": "autocomplete"}
 ```
 
In these fields we will copy the real fields that we want to be included in the autocomplete & suggestions functionality. 

> **Attention:** autocomplete may be slow if too much data is configured like adding a field with too much text or adding too many fields.

In the configuration for the fields you want to be used, add:

```
{
  "my_field_name": {
    "type":"string",
        "fields" : {
          "toindex" : {"type" : "string", "analyzer" : "default"},
              "index" : {"type" : "string", "analyzer" : "none"},
                "my_field_name": {"type": "string", "index": "not_analyzed"}
    },
            "copy_to" : ["did_you_mean", "autocomplete"]
  }
}
```
 
This way we define some subfields, what later will be used differently for autocomplete, highlight, etc. With the **copy_to** parameter we tell if the field should be used for suggestions, autocomplete, or both.

 - For configuring highlights, in facets.json add the section:
  ```
    "highlights": {
        "enabled": true,
        "whitelist": [
            "longName",
            "dataDescription"
        ],
        "blacklist": []
    }
    ```
First we enable the feature, and after that, with the whitelist and blacklist we specify which fields to be used.
### __Facets__
#### __Term Facets__
Term facets are built on the terms created by elasticsearch. Elasticsearch by default adds as terms all the words found in a field.
If we have a field what contains coma separated values, and we want to use those values as terms, we have to use the **"coma"** analyzer in the **mapping.json**:
```
"Country" : {
  "type" :"string", 
  "analyzer" : "coma" 
},
```
We have some predefined analyzers: "coma", "semicolon", "pipe".
##### __Basic configuration__
If we want a simple facet, we have to add a facet section in the configuration of the field
 - visible - if we want to enable or disable the facet. Available options: "true"/"false"
 - title - the title to be displayed for the facet
 - type - should be set on ""facet""
 - pos - if there are more facets, the position of the facet
 - size - the maximum number of terms to be displayed in the facet
 - order - default order of terms inside the facet. Available options: "term", "reverse_term", "count", "reverse_count"
 - operator - default operator between the selected terms. Available options: "AND", "OR"
 - facet_display_options - for now it should be set on ["sort", "checkbox"], as we don't support any other options. 
 
Example of configuration:
```
{
  "name": "countries",
  ...
    "facet": {
      "visible": true,
        "title": "Countries",
        "pos": 1,
        "type": "facet",
        "size": 100,
        "order": "term",
        "operator": "AND",
        "facet_display_options": ["sort", "checkbox"]
    }
},
```
##### __Whitelist & Blacklist__
If elasticsearch has indexed terms that we don't want to be displayed, we can use the **values_whitelist** and **values_blacklist** options. This can be applied for a field, and in that case it will be applied also in the listing of the results, or inside the facet section, and in this case the listing will contain all values, but the facet will show only what we want to show.
Example:
```
{
  "name": "countries",
  ...
    "facet": {
      "visible": true,
        "values_whitelist":[
          "Austria", "Germany", "Denmark","Spain"],
        "title": "Countries",
        "pos": 1,
        "type": "facet",
        "size": 100,
        "order": "term",
        "operator": "AND",
        "facet_display_options": ["sort", "checkbox"]
    }
},
```
 
##### __Exact match for facets__
Elasticsearch by default doesn't support exact match, for terms. For this we need to add an extra "count" field for each original field, what will contain the number of terms in that field.
This is done automatically by the indexing methods, but it has to be enabled, with setting the **elastic.enableValuesCounting** configuration option on **true**. This is done in settings.json and it should look like:
```
"elastic": {
  ...
  "enableValuesCounting": true
  ...
}
```
After the feature is enabled, in the facets.json we can enable the exact checkbox for each facet individually. In the facet configuration for the field set the **allow_exact** on **true**:
```
{
  "name": "my_field",
  ...
    "facet": {
      "allow_exact": true,
        "visible": true,
        "type": "facet",
        "facet_display_options": ["sort", "checkbox"]
        ...
    }
    ...
}
```

##### __Autocomplete for facets__
If there are too many values in a facet, it's handy to have an option to search quickly. For this we can enable the autocomplete feature for facets. This can be done in the facets.json, facet configuration for the field by setting the **autocomplete** on **true**. We also have an extra option, **autocomplete_placeholder**, which will be used as a placeholder for autocomplete:
```
{
  "name": "my_field",
  ...
    "facet": {
      "allow_exact": true,
        "visible": true,
        "type": "facet",
        "facet_display_options": ["sort", "checkbox"]
        "autocomplete": true,
        "autocomplete_placeholder": "Search for my field",
        "empty_message": "No values to show",
        ...
    }
    ...
}
```
#### __Range Facets__
Range facets can be used for numeric fields.
Ex:
```
{
  "name": "time_coverage",
    "facet": {
    "visible": true,
      "title": "Time coverage",
        "pos": 1,
        "type": "range"
    }
},
```


#### __Geo Facets__
To be able to use Google Maps for facets, we have to provide a valid Google Map Key. This can be generated at
https://developers.google.com/maps/documentation/javascript/get-api-key. This key should be added in the docker-compose.yml (or with rancher) as an environment variable:
```
  ...
  environment:
      - GOOGLE_MAP_KEY=google-map-api-key
  ...
```
Geographical facets can only be used on fields what contains both, latitude & longitude values and are separated with coma. 
If you have latitude an longitude in separate fields, you can modify your sparql query, by adding:
```
concat(str(?Latitude),',',str(?Longitude)) as ?geo_pos
```
This field should be indexed with the **geo_point** analyzer:
```
"geo_pos" : {
  "type" : "geo_point",
    "analyzer" : "none"
},
```
After these settings, we can configure the facet:
```
{
  "name": "geo_pos",
  ...
    "facet": {
      "visible": true,
        "title": "Geo location of station",
        "pos": 11,
        "type": "geo",
        "size": 2,
        "default_distance": { "lat": 48.738525, "lng": 13.981955, "rad": 250000 },
        "default_bounds": { "lat1": 50.738525, "lng1": 9.981955, "lat2": 46.738525, "lng2": 18.981955 }
    },
},
```

### __Details page__
#### __Configuration__
Esbootstrap app provides a default details page. You can than have the title of the record as an hyperlink to the details page where you can display more information and fields that is available in elasticsearch index.
First you have to ensure that you have a unique **_id** field. This should be url friendly, so it's recommended to have something like this in the query:
```
REPLACE(STR(?title), "[^a-zA-Z0-9]", "-", "i") AS ?_id
```
The above assumes the title field is unique among the documents in the elasticsearch index. You can of course put any other unique concatenations of fields instead of one field.
The further configuration of the details page is done in the facets.json.
First you have to create the link to the details page. For this, you will have to use the **display** option from the **listing** section of the field. In this example we will only have a link, with a static **Details** label. It is important to use the **href=/details?id=** for the link, this will create a link to the built in details page.
```
{
  "name": "_id",
    "listing": {
      "title": "Details",
        "visible" : true,
        "pos" : 0,
        "display": {
        "pre": "<td><a class='listingTitle' href=/details?id=",
            "field": "_id",
            "post": ">Details</a></td>"
        }
    }
}
```
For a much nicer link for the details page, you can use a combination of fields. We will use the url built from the **_id** field, and it's label will be the **title** of the document. It's important to use correctly the **pos** attribute, and to only use the **title** attribute on the first field, in this case **_id**. The other field should have an empty string as title. Using this logic, you can build more complex links, and this can be used not only for the details page. 
In our example, you can observe, that we open the ```<td>``` in one field, and close it in the second one:
```
{
  "name": "_id",
    "listing": {
      "title": "Details",
        "width": "200px",
        "visible" : true,
        "pos" : 1,
        "display": {
          "pre": "<td><a class='listingTitle' href=/details?id=",
            "field": "_id",
            "post": ">"
        }
    }
    ...
},
{
    "name": "title",
    "listing": {
      "title": "",
        "visible" : true,
        "pos" : 2,
        "display": {
            "field": "title",
            "post": "</a></td>"
        }
    }
}
```
After the link is configured, we can proceed to the fields what we want to be displayed on the details page.
First we define the sections for the details page:
```
"details_settings" : {
  "sections": [
      {"name":"info",
          "title":"General info",
            "pos":0},
        {"name":"created",
            "title":"Created",
            "pos":1}
  ]
},
```
After that on each field what we want in the details page, we configure how to be displayed.
For simple text:
```
"details": {
  "visible": true
  "title": "Title",
    "pos" : 1,
    "section": "info",
},
```
For image, use **type="img"**
```
{
  "name": "thumbnailUrl",
    "details": {
      "title": "Preview",
        "pos" : 4,
        "section": "info",
        "visible": true,
        "type": "img"
    }
},
```
For links, use **type="link"**. There are 2 optional attributes, **link_title** and **link_label** to add some customization for the link. By default they are set on the **title** of the field.
```
{
  "name": "externalUrl",
    "details": {
      "title": "External url",
        "pos" : 5,
        "type": "link",
        "section": "info",
        "visible": true,
        "link_title": "Title for external link", 
        "link_label": "Label for external link"
    }
}
```
For a list of values, we have to specify the characters used for separating the values with the **split** attribute. It can be used on any type of field(simple text, img or link):
```
"details": {
  "visible": true
  "title": "Countries",
    "pos" : 1,
    "section": "info",
    "split": "|"
},
```
If we have a pair of fields, one with a link, the second with a label for the link, we have the possiblity to merge them on the details field.
First we have to configure the label field, than on the field containing the url we don't configure it for detail page, but enable the **is_link** option and in the **link_for** option set the name of the label field:
```
{
  "name": "labelForUrl",
    "details": {
      "title": "External link",
        "pos" : 5,
        "section": "info",
        "visible": true,
    }
    ...
},
{
  "name": "externalUrl",
  "is_link": true,
  "link_for": "labelForUrl"
  ...
}
```
This can be applied also on fields what contains a list of labels and a list of urls. On the field with labels, you have to use the **split** option, on the field with links, you have to use the **link_split** option.

> **Attention:** both fields should contain the same amount of elements.
```
{
  "name": "listOfLabelsForUrl",
    "details": {
      "title": "List of external links",
        "pos" : 5,
        "section": "info",
        "visible": true,
        "split": ", "
    }
    ...
},
{
  "name": "listOfExternalUrls",
  "is_link": true,
  "link_for": "listOfLabelsForUrl",
  "link_split": "|"
  ...
}
```
#### Change the layout of the details page
The template what is used for displaying the details page is the [details.jade](https://github.com/eea/eea.docker.esbootstrap/blob/master/app/views/details.jade)
In your new template, if you want, you can access the available values using **data.my_field.value**.
If you want more customization, what can't be simply with the configuration options, you have the possibility to override this file. You only have to copy it in your **apps** view folder, and from now, that template will be used.
If you need some css or javascript for customization, you can add these files in your apps **public** folder, and add them as required resources in the apps **settings.json**:
```
"layout_vars": {
    ...
    "css_resources": {
        "index_page": [
          ...
        ],
        "details_page": [
      "app_resources/mycustom.css"
      ...
        ]
    },
    "js_resources": {
        "index_page": [
        ],
        "details_page": [
            "app_resources/mycustom.js",
            ...
        ]
    }
}
```
### __Card & List__
By default, only the table view is enabled for the results. If you want to display the documents in the form of cards or lists, first you have to enable them in the **settings.json**:
```
"display_options": ["tabular", "card", "list"],
```
After enabling the views, in **facets.json**you can enable which fields to be available in the card/list views.
You have to enable the card option for the field with **"visible": true**, set the name of the **field** how it will be accessible inside the template, set a **default** value, and set the **type**. **type** can be **simple**, **list** or **date**
All options are identical for both card and list.
Here is an example for each type of field:
```
{
  "name": "title",
    "card": {
      "field": "title",
        "default": "",
        "visible": true,
        "type" : "simple"
    },
    ...
},
{
  "name": "tags",
    "card": {
      "field": "tags",
        "default": "",
        "visible": true,
        "type" : "list"
    },
    ...
},
{
    "name": "http://purl.org/dc/terms/issued",
    "card": {
      "type": "date",
        "format": "dd M yy",
        "field": "date",
        "default": "",
        "visible": true
  },
},
...
```
For configuring the templates for cards and list views, a good starting point are 
[cardview.jade](https://github.com/eea/eea.searchserver.js/blob/master/lib/framework/views/cardview.jade) and [listview.jade](https://github.com/eea/eea.searchserver.js/blob/master/lib/framework/views/listview.jade)
You can copy them in your apps **views** folder, and customize them. The values for the fields passed to the template can be accessed like this: **${title}**.
If you're ok with the builtin templates, you don't have to copy them into your apps view folder, but you have to provide all the required fields.

### __Relevance__
If you want to improve the default relevance order of your data, you can add some rules, how the weight of the results should be calculated.
First you have to enable the custom relevance feature in **settings.json**:
```
  "relevance_enabled": true,
```
After that, add a **relevance.json** file in your apps root.
Here is how we have the configuration for global-search app:
```
{
    "fields_boosting":{
        "fields":[
            "http://purl.org/dc/terms/title^2",
            "http://purl.org/dc/terms/subject^1.5",
            "http://purl.org/dc/terms/description^1.5",
            "searchable_spatial^1.2",
            "searchable_places^1.2",
            "searchable_objectProvides^1.4",
            "searchable_topics^1.2",
            "searchable_time_coverage^10",
            "searchable_organisation^2",
            "_all"
        ]
    },
    "functions":{
        "gauss": {
            "http://purl.org/dc/terms/issued": {
                "scale": "2w"
            }
        },
        "script_score": {
            "script": "doc['items_count_http://purl.org/dc/terms/references'].value*0.01"
        }
    },
    "score_mode":"sum",
    "facet_decay_functions": {
        "http://www.eea.europa.eu/portal_types#topic": {
            "linear": {
                "items_count_http://www.eea.europa.eu/portal_types#topic": {
                    "scale": 1,
                    "origin": 0
                }
            }
        },
        "http://purl.org/dc/terms/spatial": {
            "linear": {
                "items_count_http://purl.org/dc/terms/spatial": {
                    "scale": 1,
                    "origin": 0
                }
            }
        },
        "places": {
            "linear": {
                "items_count_places": {
                    "scale": 1,
                    "origin": 0
                }
            }
        },
        "organisation": {
            "linear": {
                "items_count_organisation": {
                    "scale": 1,
                    "origin": 0
                }
            }
        }
    }
}
```
- In the **fields_boosting** section we add a boost on some fields.
- In the **functions** section we have 2 function:
  - with the **gauss** function for **http://purl.org/dc/terms/issued**, we promote the most recent documents
  - with the **script_score** function for **items_count_http://purl.org/dc/terms/references**, we promote the documents with most references
- In the **facet_decay_functions** section we configure some extra options for relevance if a specific facet is used. Ex: when an **organisation** is selected, documents with the less number of organisations will be promoted.
**Note:** if you want to use the **items_count_<field_name>** we need to have enabled the **exact match** feature.

### __Troubleshooting__
Allways check if the jsons are valid

- **Symptom:** no data in elasticsearch
**Check:**
  - semantic endpoint is up and responding
  - your query is returning values, and doesn't generate an error
  - in case of SELECT queries, you have to provide a unique _id field, preferably url friendly, something like:
    ```REPLACE(STR(?title), "[^a-zA-Z0-9]", "-", "i") AS ?_id```
    
- **Symptom:** not all the data is indexed in elasticsearch
**Check:**
    - if too many rows are returned by the query, might be a timeout when reading the data from the endpoint. You should consider splitting the results, using **filtersQuery.sparql**
    - not all the fields are corresponding to the analyzer. Ex you expect a datetime, but you provide a time.

- **Symptom:** data is indexed, but the facets doesn't look good
**Check:**
  - the analyzer used to identify terms. 
  - check if the analyzer/mapping is valid. For this you can do:
```~ curl -XGET '<elastic_host>:9200/<index_name>/_settings?pretty'  ```
```~ curl -XGET '<elastic_host>:9200/<index_name>/_mapping/<elastic_type>?pretty' ```
check in the **_settings** if the filters and analyzers are present. If not, probably there is a typo, or a filter or analyzer is missing
check if the **_mapping** is correct, similar with the configured one. If not, probably there is a typo

 **For DEVs** 
 - **Symptom on local dev env:** if create_index timeout, check IP of host in docker-compose file for the application
 
### __Default configuration demo__
See example default custom configuration at [eea.esbootstrap.configs](https://github.com/eea/eea.esbootstrap.configs/tree/master/default)
