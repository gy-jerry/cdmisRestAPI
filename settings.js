// configurations

var ip="localhost"
var port="27017"
var db = "cdmis"

module.exports = {
  webEntry: {
    domain: ip,
    domainName: ip,
    path: '',
    dbUri: 'mongodb://'+ip+':'+port+'/'+ db,
    restPort:4050,
    route: 'routes',
    routeIO: '',
    view: '',
    config: ''
  }
}
