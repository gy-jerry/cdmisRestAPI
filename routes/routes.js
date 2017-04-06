

// 3rd packages


// self-defined configurations
var config = require('../config');

// middlewares


// controllers
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller'),
    userCtrl = require('../controllers/user_controller'),
    healthInfoCtrl = require('../controllers/healthInfo_controller'),
    dictNumberCtrl = require('../controllers/dictNumber_controller');

module.exports = function(app,webEntry) {
  
  //app.use('/static', express.static( './static')).
  //    use('/images', express.static( '../images')).
  //    use('/lib', express.static( '../lib')
  //);
  app.get('/', function(req, res){
    //console.log("Connected successfully to server and response");
    //res.render('rich_ui');
    res.send("Server Root");
  });

  app.get('/dict/typeTwo', dictTypeTwoCtrl.getCategory);
  app.get('/user', userCtrl.getUserList);
  app.get('/user/insert', userCtrl.insertUser);
  app.get('/user/one', userCtrl.getUser);
  app.post('/user/register', userCtrl.register);
  app.post('/user/reset', userCtrl.reset);
  app.get('/user/login', userCtrl.login);
  app.post('/user/logout', userCtrl.logout);
  app.get('/user/getUserID', userCtrl.getUserID);
  app.get('/healthInfo/getAllHealthInfo', healthInfoCtrl.getAllHealthInfo);
  app.get('/healthInfo/getHealthDetail', healthInfoCtrl.getHealthDetail);
  app.post('/healthInfo/insertHealthInfo', healthInfoCtrl.insertHealthInfo);
  app.post('/healthInfo/modifyHealthDetail', healthInfoCtrl.modifyHealthDetail);
  app.post('/healthInfo/deleteHealthDetail', healthInfoCtrl.deleteHealthDetail);
  app.get('/dictNumber/getNo', dictNumberCtrl.getNo);
  //app.get('/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get('/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });
};
