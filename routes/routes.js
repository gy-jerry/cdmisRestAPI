

// 3rd packages


// self-defined configurations
var config = require('../config');

// middlewares


// controllers
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller'),
    userCtrl = require('../controllers/user_controller'),
    dictTypeOneCtrl = require('../controllers/dictTypeOne_controller'),
    dictDistrictCtrl = require('../controllers/dictDistrict_controller'),
    dictHospitalCtrl = require('../controllers/dictHospital_controller'),
    taskCtrl = require('../controllers/task_controller');

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

  app.get('/dict/typeTwo/category', dictTypeTwoCtrl.getCategory);
  app.get('/user', userCtrl.getUserList);
  app.get('/user/insert', userCtrl.insertUser);
  app.get('/user/one', userCtrl.getUser);
  app.get('/dict/typeOne/category', dictTypeOneCtrl.getCategory);
  app.get('/dict/district', dictDistrictCtrl.getDistrict);
  app.get('/dict/hospital', dictHospitalCtrl.getHospital);
  app.get('/tasks', taskCtrl.getTasks);
  app.get('/tasks/status', taskCtrl.updateStatus);
  app.get('/tasks/time', taskCtrl.updateStartTime);

  
  //app.get('/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get('/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });
};
