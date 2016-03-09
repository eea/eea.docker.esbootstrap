#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')
var managementCommands = searchServer.builtinCommands;
var builtinRoutes = searchServer.builtinRoutes;

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
    endpoint: 'http://semantic.eea.europa.eu/sparql',
  }
}
searchServer.Helpers.SimpleStart(options)

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/config/mapping.json")));
}

