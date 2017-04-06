
// configurations
var port="27017"
var ip="10.12.43.40"
module.exports = {
  webEntry: {
    domain: ip,
    domainName: ip,
    path: '',
    dbUri: 'mongodb://'+ip+':'+port+'/cdmis',
    restPort:4050,
    route: 'routes',
    routeIO: '',
    view: '',
    config: ''
  }
};