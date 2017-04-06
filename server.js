
// 慢病管理 REST 2017-03-14 池胜强 创建文档

// import necessary 3rd modules
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


// import necessary self-defined modules


var webEntry = require('./settings').webEntry;

var _config = webEntry.config || 'config',
    domainName = webEntry.domainName,
    route = webEntry.route || 'default';

var config = require('./' + _config),
    dbUri = webEntry.dbUri,
    restPort = webEntry.restPort,
    routes = require('./routes/'+route);

// 数据库连接
var db = mongoose.connection; 
if (typeof(db.db) === 'undefined') {
  mongoose.connect(dbUri);
}
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log(domainName + ' MongoDB connected!');
});

// node服务
var app = express();
// app.engine('.html', require('ejs').__express);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'html');
app.set('port', restPort); 
//app.set('trust proxy', 'loopback, localhost'); 


app.use(bodyParser.json({ limit: config.bodyParserJSONLimit })); 
app.use(bodyParser.urlencoded({ extended: true })); 
//app.use(expressValidator());
//app.use(useragent.express());

// 跨域访问
app.all('*', function (req, res, next) { 
  var domain = req.headers.origin;
  if (config.Access_Control_Allow_Origin.indexOf(domain) > -1) {
    res.setHeader('Access-Control-Allow-Origin', domain);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT'); 
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.
  }
  if ('OPTIONS' == req.method) return res.sendStatus(200);
  next();
});
//app.use('/upload', qt.static(path.join(__dirname, 'public/upload'), { 
//  type: 'resize', 
//  quality: 0.9 
//})); 

// 路由设置
routes(app, webEntry);

// 找不到正确路由时，执行以下操作
app.all('/*', function(req, res, next) { 
  // res.sendFile('main.html', { root: __dirname + '/public/build/www' }); 
  // res.sendFile('main.html', { root: __dirname + '/public' }); 
    res.send("Router Error!");
});

//app.use(function (err, req, res, next) {
//  var meta = '[' + new Date() + '] ' + req.url + '\n';
//  errorLog.write(meta + err.stack + '\n');
//  next();
//});

app.listen(app.get('port'));


