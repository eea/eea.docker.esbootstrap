# Esbootstrap API

## Configuring the API:
The only thing that has to be configured is the token used to access the API.
It is possible to configure the token in the settings.json or with an ENV.
If none of them is specified, the token will be disabled, the API will be accessible without any authentication.
If the token is specified in both places, the one from ENV will be used.

In the settings.json:
```
"API":{
    "token": "<TOKEN>"
},
```
Set the ENV in docker-compose:
```
app:
    environment:
        ...
        API_token: '<TOKEN>'
```

To set the Authorization header for requests with curl use:
```
curl -X GET \
  'http://<APP_ADDRESS>/API/v1/<API_ENDPOINT>' \
  -H 'Authorization: Bearer <TOKEN>'
```

## Short description:
The indexing of the esbootstrap apps is done with incremental index names. The index names have the form: <indexname>_<current_date>.
We have two aliases:
    - latest, which points to the newest index
    - prod, which points to the last correct and approved index

The latest alias is automatically moved the the newest index when an update or an update_from_url command is called.
The prod alias is set manually with the switch command. When switch is called, the prod alias will be moved to point to the same index as the latest alias.

It's also possible to have two applications, one configured to use the latest index and the other one to use the prod index.
This way we can have:
- pamdemo.apps.eea.europa.eu will always show the latest index, even if there are problems
- pam.apps.eea.europa.eu will always show the prod index

The prod alias should only be switched to the latest when pamdemo.apps.eea.europa.eu was tested and approved.

## Available commands:
- healthcheck - a quick healthcheck of the app, elasticsearch and the index
- update - trigger a new indexing
- update_from_url - trigger a new indexing but with a different source for the data
- cancel_update - cancel the current indexing
- status - display the current status of the production and the latest indices
- switch - switch the production index to point to the latest index

### Healthcheck
GET /API/v1/healthcheck
This call:
- tests if the nodejs app is running
- tests if connection to elasticsearch is up
- tests if the index exists

Curl:
```
curl http://<APP_ADDRESS>/API/v1/healthcheck
```
example of responses:
ex.1, everything works:
```
{
    "elastic": "ok",
    "index": "ok",
    "app": "ok"
}
```
ex.2, elasticsearch is down:
```
{
    "elastic": "ECONNREFUSED",
    "app": "ok"
}
```
ex.3, elasticsearch is up, but the index is not present (or the production alias is missing):
```
{
    "elastic": "ok",
    "index": "index_not_found_exception",
    "app": "ok"
}
```
### Update
GET /API/v1/update
This command requires authorization header.
It triggers a new update:
- a new index with the current timestamp will be created
- the latest alias will point to this new index
- starts to read index the data

Curl:
```
curl -X GET http://<APP_ADDRESS/API/v1/update -H 'Authorization: Bearer <TOKEN>'
```
requires authorization header
triggers a new update,
- a new index with the current timestamp will be created
- the latest alias will point to this new index

response:
ex.1, authorization is missing or is incorrect:
```
Bad request
```
ex.2, successfull call
```
{"status":"Indexing triggered","index":"<INDEX_NAME>_2019-12-03_13:51:47"}
```
Fields from response:
- status: currently it's only possible value is "Indexing triggered"
- index: the name of the newest index

Note:
If more updates are called, the previous ones will be cancelled. The "latest" alias will always point to the newest index.

After calling an "update", the "status" should be consulted

### Update from url
GET /API/v1/update_from_url

This command is similar with the update call, but instead of using the url configured for the app (or a static json/csv file) it reads the data from a url.
It's useful when testing with different versions of files or different sql queries on discomap.

PARAMETER:
url: the url from where to fetch the data to be indexed

Curl:
```
curl -X GET \
  'http://<APP_ADDRESS>/API/v1/update_from_url?url=http://discomap.eea.europa.eu/App/SqlEndpoint/query?sql=Select%20%2A%2C%20100%20as%20x%20from%20%5BGHGPAMS%5D.%5Bv2r1%5D.%5BPAMs_Viewer_Flat_file_elasticsearch%5D' \
  -H 'Authorization: Bearer <TOKEN>'
```
response:
```
{
    "status": "Indexing triggered",
    "index": "<INDEX_NAME>_2019-12-03_14:34:52"
}
```
Fields from response:
- status: currently it's only possible value is "Indexing triggered"
- index: the name of the newest index

### Status
GET /API/v1/status
This call does not require authorization
Gives a status about the latest and prod indices.
Also compares the latest indexed column names with the production ones. This way the differences in columns are immediately visible.

Curl:
```
curl http://<APP_ADDRESS>/API/v1/status
```

response:
ex.1 indexing in progress:
```
{
    "latest_index_info": {
        "status": "indexing",
        "indexing_started_at": "2019-12-03T14:03:47.369Z",
        "index_name": "<INDEX_NAME>_2019-12-03_14:03:46",
        "timestamp": "2019-12-03T14:03:47.653Z",
        "source": {
            "url": "https://discomap.eea.europa.eu/App/SqlEndpoint/query?sql=--%20Write%20your%20SQL-query%20here%0A--%20For%20more%20information%20in%20SQL%20go%20here%20https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fsql%2Ft-sql%2Fqueries%2Fselect-examples-transact-sql%3Fview%3Dsql-server-2017%0ASelect%20%20*%20from%20%5BGHGPAMS%5D.%5Bv2r1%5D.%5BPAMs_Viewer_Flat_file_elasticsearch%5D"
        },
        "nr_of_docs_to_index": 2090,
        "elapsed_time_since_last_status_change": "00:00:03",
        "elapsed_time_since_indexing_started": "00:00:03",
        "docs": 200,
        "ETA(seconds)": 15,
        "ETA": 00:15
    },
    "production_index_info": {
        "status": "finished",
        "indexing_started_at": "2019-12-03T14:01:03.273Z",
        "index_name": "<INDEX_NAME>_2019-12-03_14:01:02",
        "timestamp": "2019-12-03T14:01:29.611Z",
        "source": {
            "url": "https://discomap.eea.europa.eu/App/SqlEndpoint/query?sql=--%20Write%20your%20SQL-query%20here%0A--%20For%20more%20information%20in%20SQL%20go%20here%20https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fsql%2Ft-sql%2Fqueries%2Fselect-examples-transact-sql%3Fview%3Dsql-server-2017%0ASelect%20%20*%20from%20%5BGHGPAMS%5D.%5Bv2r1%5D.%5BPAMs_Viewer_Flat_file_elasticsearch%5D"
        },
        "nr_of_docs_to_index": 2090,
        "columns": [
            ...
        ],
        "indexing_finished_at": "2019-12-03T14:01:29.611Z",
        "indexing_total_time": "00:00:26",
        "indexing_total_time_in_seconds": 26,
        "docs": 2090
    }
}
```
ex.2, indexing finished:
```
{
    "latest_index_info": {
        "status": "finished",
        "indexing_started_at": "2019-12-03T14:03:47.369Z",
        "index_name": "<INDEX_NAME>_2019-12-03_14:03:46",
        "timestamp": "2019-12-03T14:04:13.375Z",
        "source": {
            "url": "https://discomap.eea.europa.eu/App/SqlEndpoint/query?sql=--%20Write%20your%20SQL-query%20here%0A--%20For%20more%20information%20in%20SQL%20go%20here%20https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fsql%2Ft-sql%2Fqueries%2Fselect-examples-transact-sql%3Fview%3Dsql-server-2017%0ASelect%20%20*%20from%20%5BGHGPAMS%5D.%5Bv2r1%5D.%5BPAMs_Viewer_Flat_file_elasticsearch%5D"
        },
        "nr_of_docs_to_index": 2090,
        "columns": [
            ...
        ],
        "indexing_finished_at": "2019-12-03T14:01:29.611Z",
        "indexing_total_time": "00:00:26",
        "indexing_total_time_in_seconds": 26,
        "extra_columns_compared_to_production": [],
        "missing_columns_compared_to_production": []
    },
    "production_index_info": {
        "status": "finished",
        "indexing_started_at": "2019-12-03T14:01:03.273Z",
        "index_name": "<INDEX_NAME>_2019-12-03_14:01:02",
        "timestamp": "2019-12-03T14:01:29.611Z",
        "source": {
            "url": "https://discomap.eea.europa.eu/App/SqlEndpoint/query?sql=--%20Write%20your%20SQL-query%20here%0A--%20For%20more%20information%20in%20SQL%20go%20here%20https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fsql%2Ft-sql%2Fqueries%2Fselect-examples-transact-sql%3Fview%3Dsql-server-2017%0ASelect%20%20*%20from%20%5BGHGPAMS%5D.%5Bv2r1%5D.%5BPAMs_Viewer_Flat_file_elasticsearch%5D"
        },
        "nr_of_docs_to_index": 2090,
        "columns": [
            ...
        ],
        "indexing_finished_at": "2019-12-03T14:01:29.611Z",
        "indexing_total_time": "00:00:26",
        "indexing_total_time_in_seconds": 26,
        "docs": 2090
    }
}
```

Fields from response:
"latest_index_info" and "production_index_info" are containing a short summary about the indices. In case the "prod" alias is missing, it will be not present in the response.
fields from the summaries:
    - status: the status of the index, possible values: indexing, finished, cancelled
    - indexing_started_at: the time the indexing was triggered
    - index_name: the real index name behind the latest or prod alias
    - timestamp: the timestamp of the last modification in the status of the index. In case the status is "indexing", and this timestamp is not changing it might be suggest, the indexing is blocked by some reason.
    - source: the source of the data to be indexed. It can be a file or a url.
    - nr_of_docs_to_index: this is not necessarily present, only if the indexing process can get the total number of documents to be indexed
    - columns: the list of columns that were read from the data source
    - indexing_finished_at: the time the indexing finished successfully
    - indexing_total_time, indexing_total_time_in_seconds: the total time of indexing in different formats
    - docs: total number of documents in the index. This will be static for the prod index, but for the latest alias, if the indexing is in progress, we will be able to see the progress.
    - extra_columns_compared_to_production: a list of columns that are present in the latest index, but were not present in the prod index
    - missing_columns_compared_to_production: a list of missing columns from latest index, but were present in the prod index
    - ETA(seconds), ETA: the estimated time to finish the indexing. This is only a rough estimation based on previous indexing time, nr of documents and elapsed time.

### Switch
GET /API/v1/switch
After the indexing is finished, and the demo app was tested, the production alias can be moved to the latest index

Curl:
```
curl -X GET http://<APP_ADDRESS/API/v1/switch -H 'Authorization: Bearer <TOKEN>'
```
response:
```
{
    "prod": "<index>_2019-12-03_14:03:46"
}
```
Fields from response:
    - prod: shows the real name of the index where the prod alias points now
