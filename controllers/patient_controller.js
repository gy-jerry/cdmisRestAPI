var	config = require('../config'),
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor'), 
	DpRelation = require('../models/dpRelation'), 
	Counsel = require('../models/counsel');

//根据userId查询患者详细信息 2017-03-29 GY
exports.getPatientDetail = function(req, res) {
	//查询条件
	var _userId = req.query.userId;
	var query = {userId:_userId};
	//输出内容
	var fields = {"_id":0, 'revisionInfo':0, 'doctors':0};
	var populate = {path: 'diagnosisInfo.doctor', select: {'_id':0, 'workUnit':1}};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, "", fields, populate);
}


//根据医院和医生姓名（选填）获取医生信息 2017-03-29 GY
exports.getDoctorLists = function(req, res) {
	//查询条件
	var _workUnit = req.query.workUnit;
	var _name = req.query.name;
	var query;
	//name选填
	if(_name == null){
		query = {workUnit:_workUnit};
	}
	else{
		query = {workUnit:_workUnit, name:_name};
	}
	//输出内容
	var fields = {"_id":0, 'revisionInfo':0};
	var populate = '';

	Doctor.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, "", fields, populate);
}

//通过patient表中userId返回PatientObject 2017-03-30 GY 
//修改：增加判断不存在ID情况 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
    var query = { 
        userId: req.query.userId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient == null) {
        	return res.status(404).send('不存在的患者ID！');
        }
        req.body.patientObject = patient;
        next();
    });
};

//获取患者的所有医生 2017-03-30 GY
//2017-04-05 GY 修改：按照要求更换查询表
exports.getMyDoctor = function(req, res) {
	//查询条件
	//var patientObject = req.body.patientObject;
	var _patientId = req.query.userId;
	var query = {userId:_patientId};

	
	var opts = '';
	var fields = {'_id':0, 'doctors':1};
	//通过子表查询主表，定义主表查询路径及输出内容
	
	var populate = {path: 'doctors.doctorId', select: {'_id':0, 'IDNo':0, 'revisionInfo':0, 'teams':0}};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//查询咨询记录 2017-03-30 GY
exports.getCounselRecords = function(req, res) {
	//查询条件
	var patientObject = req.body.patientObject;
	var query = {'patientId':patientObject._id};

	
	var opts = '';
	var fields = {'_id':0, 'doctorId':1, 'time':1, 'messages':1};
	//通过子表查询主表，定义主表查询路径及输出内容	
	var populate = {path: 'doctorId', select: {'_id':0, 'userId':1, 'name':1, 'photoUrl':1}};

	Counsel.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}