

// 3rd packages


// self-defined configurations
var config = require('../config');

// middlewares


// controllers
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller'),
    dictnumberCtrl = require('../controllers/dictNumber_controller'),
    userCtrl = require('../controllers/user_controller');

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

  app.get('/dict/typeTwo', dictTypeTwoCtrl.insertCategory);
  app.get('/dict/number', dictnumberCtrl.getOne);
  app.get('/user', userCtrl.getUserList);
  app.get('/user/insert', userCtrl.insertUser);
  //app.get('/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get('/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });
};
