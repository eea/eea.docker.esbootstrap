#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')

var query = fs.readFileSync('/code/config/query.sparql', 'utf8');
var managementCommands;
var hasConstruct = false;
var lowerQuery = query.toLowerCase();
var constructPos = lowerQuery.indexOf('construct');
var selectPos = lowerQuery.indexOf('select');

if (constructPos !== -1) {
  if (selectPos !== -1) {
    if (constructPos < selectPos){
      hasConstruct = true;
    }
  }
  else {
    hasConstruct = true;
  }
}

if (hasConstruct){
  managementCommands = searchServer.builtinCommandsRDF;
}
else {
  managementCommands = searchServer.builtinCommands;
}

var builtinRoutes = searchServer.builtinRoutes;

var defaultIndexingFilterQuery = 'config/filtersQuery.sparql';
var defaultExtraAnalyzers = 'config/analyzers.json';
var defaultNormalize = 'config/normalize.json';

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
    normalize: '',
    isConstruct: hasConstruct,
    endpoint: endpoint
  }
}
if (fs.existsSync(__dirname +'/' + defaultIndexingFilterQuery)){
  options.indexing.indexingFilterQuery = defaultIndexingFilterQuery;
}
if (fs.existsSync(__dirname +'/' + defaultExtraAnalyzers)){
  options.indexing.extraAnalyzers = defaultExtraAnalyzers;
}
if (fs.existsSync(__dirname +'/' + defaultNormalize)){
  options.indexing.normalize = defaultNormalize;
}
searchServer.Helpers.SimpleStart(options)

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/config/mapping.json")));
}

