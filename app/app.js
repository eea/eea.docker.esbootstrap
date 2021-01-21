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

const Sentry = require('@sentry/node');

var SENTRY_DSN = getenv.string('SENTRY_DSN', false);
var SENTRY_VER = getenv.string('VERSION_INFO', false);

var sync_request = require('sync-request');
var rancher_api_url = 'http://rancher-metadata/latest/self/stack/environment_name'

var os = require("os");
global.sentry_hostname = os.hostname();
global.sentry_app_name = APP_CONFIG_DIRNAME;

console.log("GET RANCHER ENV");
try{
    global.sentry_rancher_env = sync_request('GET', rancher_api_url).getBody('utf-8');
    console.log("RANCHER ENV:" + global.sentry_rancher_env);
}
catch (e){
    global.sentry_rancher_env = "env not found";
    console.log("Faild to get RANCHER ENV");
}

if (SENTRY_DSN !== 'false'){
    var sentry_config = {
        dsn : SENTRY_DSN,
        release: SENTRY_VER,
        environment: global.sentry_rancher_env,
        beforeSend: function(event) {
            event.logger = "nodejs";
            event.tags = {app_name: APP_CONFIG_DIRNAME, instance: global.sentry_hostname};
            return event;
        }
    }
    Sentry.init(sentry_config);
}

var existsSync = function(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};


if (! existsSync('/code/config/' + APP_CONFIG_DIRNAME)) {
    fs.copySync('/code/config/default', '/code/config/' + APP_CONFIG_DIRNAME);
}

var managementCommands = searchServer.builtinCommands;

var nconf = require('nconf');
nconf.file({file:'/code/' + APP_CONFIG_DIR + '/settings.json'});
/*
if (nconf.get("indexFile") !== undefined){
    managementCommands = searchServer.builtinCommandsFile;
}
else {
    var hasConstruct = false;
    var queryFile = '/code/' + APP_CONFIG_DIR + '/query.sparql';
    if (! existsSync(queryFile)){
        managementCommands = searchServer.builtinCommandsRivers;
    }
    else {

        var query = fs.readFileSync(queryFile, 'utf8');
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
    }
}
*/
var builtinRoutes = searchServer.builtinRoutes;

var defaultIndexingFilterQuery = APP_CONFIG_DIR + '/filtersQuery.sparql';
var defaultExtraAnalyzers = APP_CONFIG_DIR + '/analyzers.json';
var defaultNormalize = APP_CONFIG_DIR + '/normalize.json';
var defaultFilterAnalyzers = APP_CONFIG_DIR + '/filters.json';
var defaultExtraTokenizers = APP_CONFIG_DIR + '/tokenizers.json';
var defaultExtraCharFilters = APP_CONFIG_DIR + '/char_filters.json';


var defaultCustomResourcesPath = [APP_CONFIG_DIR + "/public"];


var options = {
  config_dir: __dirname + '/' + APP_CONFIG_DIR,
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
    filterAnalyzers: '',
    dataMapping: APP_CONFIG_DIR + '/mapping.json',
    normalize: ''
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
if (fs.existsSync(__dirname +'/' + defaultExtraTokenizers)){
  options.indexing.extraTokenizers = defaultExtraTokenizers;
}
if (fs.existsSync(__dirname +'/' + defaultExtraCharFilters)){
  options.indexing.extraCharFilters = defaultExtraCharFilters;
}

if (fs.existsSync(__dirname +'/' + defaultFilterAnalyzers)){
  options.indexing.filterAnalyzers = defaultFilterAnalyzers;
}

options.customResourcesPath = [];
defaultCustomResourcesPath.forEach(function(dirpath) {
    dirpath = path.join(__dirname, dirpath);
    if (existsSync(dirpath)) {
        options.customResourcesPath.push(dirpath);
    } else {
        console.log("Custom resource '" + dirpath + "' doesn't exists");
    }
});

searchServer.Helpers.SimpleStart(options);

exports.relevanceSettings = function(next){
    var env_relevance_settings = getenv.string('relevance_settings', '');
    var isEnv = false;
    if (env_relevance_settings !== ''){
        try{
            env_relevance_settings = JSON.parse(env_relevance_settings)
            isEnv = true;
            next(env_relevance_settings);
        }
        catch (e){
            console.warn("Warning: Relevance configuration is not a valid json");
            console.log("Falling back to relevance.json file");
        }
    }
    if (!isEnv){
        var relevancePath = path.join(__dirname, APP_CONFIG_DIR, "/relevance.json");
        if (fs.existsSync(relevancePath)) {
            next(require(relevancePath));
        }
        else{
            next({});
        }
    }
};


exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/" + APP_CONFIG_DIR + "/facets.json")));
};
