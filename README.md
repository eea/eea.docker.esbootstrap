# Bootstrap app for Nodejs Elasticsearch apps

This application is just a simple demo what can be used as a basis for new applications.

It provides the basic indexing commands indexing, listing and detail pages,
csv/tsv export.

It can be cloned, and with minimal configuration a new search application
created from it.

## Development

### Standalone - Docker Usage

Basic usage of the image is given by the following pattern:

```
docker run -d -v ./config:/code/config -p 8080:3000 -e "elastic_host=<elasticsearch_host_or_ip>" eeacms/esbootstrap:v1.0
```

- **```<elasticsearch_host_or_ip>```** is the url of your elastic search server
- **```./config```** is the folder that contains the configuration files for your app. See this to [details](/docs/Details.md#3-configuration)

### Using eea.docker.searchservices

For creating a new application you have to follow the next steps:
####1. __Clone eea.docker.searchservices on the development machine__
	
	git clone --recursive  https://github.com/eea/eea.docker.searchservices.git

####2. __Clone the eea.docker.esbootstrap
       
       $ cd eea.docker.searchservices
       $ # clone eea.docker.esbootstrap under eea.docker.searchservices and gives new name: eea.docker.newesapp
       $ git clone https://github.com/eea/eea.docker.esbootstrap.git eea.docker.newesapp
       
## Details

For details and implementation read the [documentation](./docs/Details.md).


