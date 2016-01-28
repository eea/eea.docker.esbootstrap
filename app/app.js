#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')
var routes = require('./routes');
var managementCommands = require('./management/commands');


options = {
  app_dir: __dirname,
  views: __dirname + '/views',
  settingsFile: __dirname + '/settings.json',
  routes: routes,
  managementCommands: managementCommands
}
searchServer.Helpers.SimpleStart(options)

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "mapping.json")));
}

