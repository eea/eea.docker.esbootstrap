// Analyzers to be used for different object properties
var analyzers = {
    "none" : {
      "type" : "keyword"
    },
    "coma" : {
      "type" : "pattern",
      "lowercase" : false,
      "pattern" : ", "
    },
    "semicolon" : {
      "type" : "pattern",
      "lowercase" : false,
      "pattern" : "; "
    }
};

// Proprety mappings for aidedata
// Describe how properties get indexed into ElasticSearch

var aidedataMappings = {
    "Country" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "Namespace" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "Pollutant" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "AggregationType" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "StationType" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "UsedForAQD" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "Zone" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "ZoneDeclaredExceedance" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "ZoneAdjustmentUsed" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "geo_pos" : {
        "type" : "geo_point",
        "analyzer" : "none"
    },
    "AQvalue" : {
        "type" : "double",
        "analyzzer" : "none"
    },
    "DataCoverage" : {
        "type" : "double",
        "analyzzer" : "none"
    },
    "StationArea" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "ZoneType" : {
        "type" : "string",
        "analyzer" : "none"
    },
    "VerificationFlag" : {
        "type" : "string",
        "analyzer" : "coma"
    }
};

var mappings = {
    'settings': {
        'analysis': {
            'analyzer': analyzers
        }
    },
    'mappings': {
        'resources': {
            'properties': aidedataMappings
        }
    }
};

module.exports = { 'mappings': mappings };
