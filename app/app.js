#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')
var managementCommands = searchServer.builtinCommands;
var builtinRoutes = searchServer.builtinRoutes;

var defaultIndexingFilterQuery = 'config/filtersQuery.sparql';
var defaultExtraAnalyzers = 'config/analyzers.json';

var nconf = require('nconf');
nconf.file({file:'/code/config/settings.json'});
var endpoint = nconf.get("endpoint");
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
    indexingQuery: 'config/query.sparql',
    extraAnalyzers: '',
    dataMapping: 'config/dataMapping.json',
    endpoint: endpoint
  }
}
if (fs.existsSync(__dirname +'/' + defaultIndexingFilterQuery)){
  options.indexing.indexingFilterQuery = defaultIndexingFilterQuery;
}
if (fs.existsSync(__dirname +'/' + defaultExtraAnalyzers)){
  options.indexing.extraAnalyzers = defaultExtraAnalyzers;
}
searchServer.Helpers.SimpleStart(options)

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/config/mapping.json")));
}

