/*
 * GET home page.
 */


var nconf = require('nconf');

nconf.file({file:'/code/settings.json'});
var field_base = nconf.get("elastic:field_base");
var path = require('path');

var searchServer = require('eea-searchserver')

exports.index = function(req, res){
  var options = {title: 'index'};

  searchServer.EEAFacetFramework.render(req, res, 'index', options);
};


exports.details = function(req, res){

  if (req.query.id === undefined){
      res.send('id is missing');
      return;
  }

  var host = "http://localhost:" + nconf.get('http:port');

  var query = '{"query":{"ids":{"values":["' + req.query.id + '"]}}}';
  query = encodeURIComponent(query);
  var options = {
    host: host + "/api",
    path: "?source="+ query
  };

  var id = req.query.id;
  searchServer.EEAFacetFramework.renderDetails({
    req:req,
    res:res,
    field_base:field_base,
    options:options,
    error_fallback:function(tmp_options){
        tmp_options.id = req.query.id;
        return(tmp_options);
    }
  });
};
