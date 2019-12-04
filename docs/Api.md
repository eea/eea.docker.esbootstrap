# Esbootstrap API

## configuring the API:
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

## available commands:

healthcheck
update
update_from_url
cancel_update
status
switch

### Healthcheck
GET
/API/v1/healthcheck
tests if the nodejs app is running
tests if connection to elasticsearch is up
tests if the index exists

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
GET
/API/v1/update

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
Note:
If more updates are called, the previous ones will be cancelled. The "latest" alias will always point to the newest index.

After calling an "update", the "status" should be consulted

### Update from url
GET
/API/v1/update_from_url

PARAMETER:
url: the url from where to fetch the data to be indexed

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
### Status
GET
/API/v1/status
Does not require authorization

Curl:
```
curl http://<APP_ADDRESS>/API/v1/status
```
gets the status of the latest and production indices, and compares them

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
### Switch
/API/v1/switch
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
