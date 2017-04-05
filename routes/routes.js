
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
    taskCtrl = require('../controllers/task_controller'),
    complianceCtrl = require('../controllers/compliance_controller');

// controllers updated by GY 
var doctorCtrl = require('../controllers/doctor_controller'), 
    counselCtrl = require('../controllers/counsel_controller'), 
    patientCtrl = require('../controllers/patient_controller'), 
    commentCtrl = require('../controllers/comment_controller'), 
    vitalSignCtrl = require('../controllers/vitalSign_controller'), 
    accountCtrl = require('../controllers/account_controller'), 
    communicationCtrl = require('../controllers/communication_controller');

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

  // csq 
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
  app.post('/compliance', complianceCtrl.insertOne);
  app.get('/compliance', complianceCtrl.getComplianceByDay);

  //routes updated by GY
  //doctor_Info
  app.post('/doctor/postDocBasic', doctorCtrl.insertDocBasic);
  //需要增加患者头像
  app.get('/doctor/getPatientList', doctorCtrl.getDoctorObject, doctorCtrl.getPatientList);
  //需要增加医生头像
  app.get('/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  //team表与consultation表之间关系不明确
  app.get('/doctor/getMyGroupList', doctorCtrl.getTeams);
  app.get('/doctor/getGroupPatientList', doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList);

  //counsel
  app.get('/counsel/getCounsels', doctorCtrl.getDoctorObject, counselCtrl.getCounsels);
  app.post('/counsel/saveQuestionare');

  //patient_Info
  app.get('/patient/getPatientDetail', patientCtrl.getPatientDetail);
  app.get('/patient/getMyDoctors', patientCtrl.getPatientObject, patientCtrl.getMyDoctor);
  app.post('/patient/editPatientDiagnosis');
  app.get('/patient/getDoctorLists', patientCtrl.getDoctorLists);
  app.post('/patient/setPatientDetail');
  app.get('/patient/getCounselRecords', patientCtrl.getPatientObject, patientCtrl.getCounselRecords);

  //comment_query
  app.get('/comment/getComments', doctorCtrl.getDoctorObject, commentCtrl.getCommentsByDoc);

  //vitalSign_query
  app.get('/vitalSign/getVitalSigns', patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns);

  //account_Info
  //需要和user表连接
  //无法输出expenseRecords数据，暂时无法解决问题
  app.get('/account/getAccountInfo', accountCtrl.getAccountInfo);

  //message
  app.get('/message/lastestMessage');
  app.get('/message/allMessages');

  //communication
  app.get('/communication/getCounselReport', communicationCtrl.getCounselReport);
  app.post('/communication/updateTeam');
  app.post('/communication/newTeam');
  app.get('/communication/getTeam', communicationCtrl.getTeam);
  app.post('/communication/newConsultation');
  app.post('/communication/updateConclusion');
  //app.get('/communication/getMessages');
  //app.get('/communication/getConsultation');

  //app.get('/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get('/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });
};

