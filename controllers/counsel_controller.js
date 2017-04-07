var	config = require('../config'),
	Counsel = require('../models/counsel'), 
	Doctor = require('../models/doctor'), 
	Patient = require('../models/patient');


//根据状态、类型、获取咨询问诊信息 2017-03-28 GY
//暂未实现计数
//status 和type 传入参数
exports.getCounsels = function(req, res) {
	//查询条件
	var _doctorId = req.body.doctorObject._id;
	var _status = req.query.status;
	var _type = req.query.type;
	var query;

	//type和status可以为空
	if(_type == null && _status != null){
		query = {doctorId:_doctorId, status:_status};
	}
	else if(_type != null && _status == null){
		query = {doctorId:_doctorId, type:_type};
	}
	else if(_type == null && _status == null){
		query = {doctorId:_doctorId};
	}
	else{
		query = {doctorId:_doctorId, status:_status, type:_type};
	}
	
	
	var opts = '';
	var fields = {"_id":0, "doctorId":0, "messages":0, "revisionInfo":0};
	//关联主表patient获取患者信息
	var populate = {path: 'patientId', select:{'_id':0, 'name':1, 'gender':1, 'birthday':1, 'photoUrl':1}}

	Counsel.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//获取患者ID对象(用于咨询问卷方法) 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
    var query = { 
        userId: req.body.patientId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient == null) {
        	return res.json({result:'不存在的患者ID！'});
        }
        req.body.patientObject = patient;
        next();
    });
};
//获取医生ID对象(用于咨询问卷方法) 2017-04-05 GY
exports.getDoctorObject = function (req, res, next) {
    var query = { 
        userId: req.body.doctorId
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (doctor == null) {
        	return res.json({result:'不存在的医生ID！'});
        }
        req.body.doctorObject = doctor;
        next();
    });
};
//提交咨询问卷 2017-04-05 GY
exports.saveQuestionaire = function(req, res) {
	var counselData = {
		counselId: req.body.counselId, 						//counselpost01
		patientId: req.body.patientObject._id, 				//p01
		doctorId: req.body.doctorObject._id, 				//doc01
		// type: req.body.type, 
		// time: new Date(req.body.time), 
		// status: req.body.status, 
		// topic: req.body.topic, 
		// content: req.body.content, 
		// title: req.body.title, 
		sickTime: req.body.sickTime, 
		// visited: req.body.visited, 
		symptom: req.body.symptom, 
		symptomPhotoUrl: req.body.symptomPhotoUrl, 
		// description: req.body.description, 
		// drugs: req.body.drugs, 
		// history: req.body.history, 
		help: req.body.help, 
		// comment: req.body.comment, 

		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	
	var newCounsel = new Counsel(counselData);
	newCounsel.save(function(err, counselInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: counselInfo});
	});
}
