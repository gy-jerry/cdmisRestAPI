// configurations
var f = require('util').format,

var user = "rest";
var password = "zjubme319";
var ip="localhost";
var port="27017";
var db = "cdmis";

module.exports = {
  webEntry: {
    domain: ip,
    domainName: ip,
    path: '',
    dbUri: f('mongodb://%s:%s@%s:%s/%s',user,password,ip,port,db),
    restPort:4050,
    route: 'routes',
    routeIO: '',
    view: '',
    config: ''
  }
}
