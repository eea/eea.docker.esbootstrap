# Bootstrap app for Nodejs Elasticsearch apps

This application is just a simple demo what can be used as a basis for new applications.

It provides the basic indexing commands indexing, listing and detail pages,
csv/tsv export.

It can be cloned, and with minimal configuration a new search application
created from it.

## Docker Usage

Basic usage of the image is given by the following pattern:

<pre>
docker run -d -v ./config:/code/config -p 8080:3000 -e "elastic_host=<elasticsearch_host_or_ip>" eeacms/esbootstrap:v1.0
</pre>

- **<elasticsearch_host_or_ip>** is the url of your elastic search server
- **config** is the folder that contains the configuration files for your app. See this to [details]()

## Details

For details and implementation read the [documentation](./docs/Details.md).


