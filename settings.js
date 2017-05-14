// configurations
var f = require('util').format;

var user = "rest";
var password = "zjubme319";
var ip_in = "172.16.156.6";
var port="27017";
var db = "cdmis";
var ip = "121.196.221.44"

module.exports = {
  webEntry: {
    domain: ip,
    domainName: 'sio',
    path: '',
    dbUri: f('mongodb://%s:%s@%s:%s/%s',user,password,ip_in,port,db),
    restPort:4050,
    route: 'routes',
    routesSocketIO: 'routesSocketIO',
    view: '',
    config: ''
  }
}