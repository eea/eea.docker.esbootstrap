# Bootstrap app for Nodejs Elasticsearch apps

This application is just a simple demo what can be used as a basis for new applications.

It provides the basic indexing commands indexing, listing and detail pages,
csv/tsv export.

It can be cloned, and with minimal configuration a new search application
created from it.

## Development

### Standalone

Basic usage of the image is given by the following pattern:

```
docker run -d -v ./config:/code/config -p 8080:3000 -e "elastic_host=<elasticsearch_host_or_ip>" eeacms/esbootstrap:v1.0
```

- **```<elasticsearch_host_or_ip>```** is the url of your elastic search server
- **```./config```** is the folder that contains the configuration files for your app. Read this to know how to [configure](/docs/Details.md#setup).

### Using eea.docker.searchservices

For creating a new application you have to follow the next steps:

####1. __Clone eea.docker.searchservices on the development machine__
	
	$ git clone --recursive  https://github.com/eea/eea.docker.searchservices.git

####2. Clone the eea.docker.esbootstrap
       
	$ cd eea.docker.searchservices
	$ # clone eea.docker.esbootstrap under eea.docker.searchservices and gives new name: eea.docker.newesapp
	$ git clone https://github.com/eea/eea.docker.esbootstrap.git eea.docker.newesapp

####3. Configure the new app
The **config** folder contains the configuration files for your app. Read this to know how to [configure](/docs/Details.md#setup) the files for your app.

####4. __Configure the eea.docker.searchservices to include the new application__
#####4.1. __Add it in the docker-compose.dev.yml file__
Clone the docker-compose.dev.yml.example file under the name docker-compose.dev.yml and add to it the settings for development
<pre>
    newesapp:
      image: eeacms/esbootstrap:dev # Work with dev build
      links:
          - esclient
      ports:
          - 3030:3000 # Take up an empty port number
      environment:
          - elastic_host=esclient
          - AUTO_INDEXING=true #index data when the app is started for the first time
          # - SYNC_CRONTAB=*/30 * * * * # This is optional, it executes the sync with a cronjob every 30 minutes
      volumes:
          - ./eea.docker.newesapp/app/:/code/:z # the volumes are added for easier development
          - ./eea.searchserver.js/lib/:/node_modules/eea-searchserver/lib/:z
</pre>

#####4.2. __Testing the application__
In **eea.docker.searchservices**:
At first try you have to build all development images for the applications
<pre>
./build_dev.sh -s
</pre>
Later, when you modify your application, is enough to rebuild only that. This is not mandatory, as in the docker-compose.dev.yml we already mounted the code in the container, but when you want to try to build the image, is enough to do:
<pre>
./build_dev.sh newesapp -s
</pre>

#####4.3. __Start the whole stack__
In **eea.docker.searchservices** start the whole stack with:
<pre>
docker-compose -f docker-compose.dev.yml up
</pre>

#####4.4. __Test in the browser__
In your favorite browser go to:
<pre>
http://&lt;machine ip&gt;:&lt;port&gt;
</pre>

####5. __Add it to the production stack__
After there is a first working version of the application, you should

- add it in the stack as a git submodule for **eea.docker.searchservices**
- create a git tag for **eea.docker.newesapp**
- add the application in https://hub.docker.com and enable automatic build on tags
- add your application in **docker-compose.yml** from **eea.docker.searchservices** and pin it to the tag you added

## Details

For details on implementation read the [documentation](./docs/Details.md).


