#!/usr/bin/env node
/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver');
var fs = require('fs-extra');

var getenv = require('getenv');
var APP_CONFIG_DIRNAME = getenv.string('APP_CONFIG_DIRNAME', 'default');
var APP_CONFIG_DIR = 'config/'+ APP_CONFIG_DIRNAME;

fs.copySync('/code/config/default', '/code/config/' + APP_CONFIG_DIRNAME);

var query = fs.readFileSync('/code/' + APP_CONFIG_DIR + '/query.sparql', 'utf8');
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

var defaultIndexingFilterQuery = APP_CONFIG_DIR + '/filtersQuery.sparql';
var defaultExtraAnalyzers = APP_CONFIG_DIR + '/analyzers.json';
var defaultNormalize = APP_CONFIG_DIR + '/normalize.json';

var nconf = require('nconf');
nconf.file({file:'/code/' + APP_CONFIG_DIR + '/settings.json'});
var endpoint = nconf.get("endpoint");


var options = {
  app_dir: __dirname,
  views: __dirname + '/views',
  settingsFile: __dirname + '/' + APP_CONFIG_DIR + '/settings.json',
  routes: {
    routes: builtinRoutes,
    detailsIdName: 'id'
  },

  indexing:{
    managementCommands: managementCommands,
    indexingFilterQuery: null,
    indexingQuery: APP_CONFIG_DIR + '/query.sparql',
    extraAnalyzers: '',
    dataMapping: APP_CONFIG_DIR + '/dataMapping.json',
    normalize: '',
    isConstruct: hasConstruct,
    endpoint: endpoint
  }
};

if (fs.existsSync(__dirname +'/' + defaultIndexingFilterQuery)){
  options.indexing.indexingFilterQuery = defaultIndexingFilterQuery;
}
if (fs.existsSync(__dirname +'/' + defaultExtraAnalyzers)){
  options.indexing.extraAnalyzers = defaultExtraAnalyzers;
}
if (fs.existsSync(__dirname +'/' + defaultNormalize)){
  options.indexing.normalize = defaultNormalize;
}
searchServer.Helpers.SimpleStart(options);

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/" + APP_CONFIG_DIR + "/mapping.json")));
};

