var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor'), 
	DpRelation = require('../models/dpRelation'), 
	Counsel = require('../models/counsel');

//根据userId查询患者详细信息 2017-03-29 GY
exports.getPatientDetail = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
	//查询条件
	var _userId = req.query.userId;
	var query = {userId:_userId};
	//输出内容
	var fields = {'_id':0, 'revisionInfo':0, 'doctors':0};
	var populate = {path: 'diagnosisInfo.doctor', select: {'_id':0, 'workUnit':1, 'department':1}};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, '', fields, populate);
}


//根据医院和医生姓名（选填）获取医生信息 2017-03-29 GY
exports.getDoctorLists = function(req, res) {
	//查询条件
	var _workUnit = req.query.workUnit;
	var _name = req.query.name;


	var _limit = Number(req.query.limit);
	var _skip = Number(req.query.skip);

	var query;
	//name选填
	if ((_name == null || _name == '') && (_workUnit == null || _workUnit == '')){
		query = {};
	}
	else if((_name == null || _name == '') && _workUnit != null){
		query = {workUnit:_workUnit};
	}
	else if (_name != null && (_workUnit == null || _workUnit == '')){
		query = {name:_name};
	}
	else{
		query = {workUnit:_workUnit, name:_name};
	}
	//输出内容


	// if(_limit==null||_limit==)
	var option = {limit:_limit, skip:_skip,sort:-"_id"}
	var fields = {"_id":0, 'revisionInfo':0};

	var populate = '';
	var _workUnitUrl=""
	var _nameUrl=""
	var _limitUrl=""
	var _skipUrl=""
	var _Url=""
	if(_workUnit!=null&&_workUnit!=undefined){
		_workUnitUrl="workUnit="+_workUnit
	}
	if(_name!=null&&_name!=undefined){
		_nameUrl="name="+_name
	}
	if(_limit!=null&&_limit!=undefined){
		_limitUrl="limit="+String(_limit)
	}
	if(_skip!=null&&_skip!=undefined){
		_skipUrl="skip="+String(_skip+_limit)
	}
	if(_workUnitUrl!=""||_nameUrl!=""||_limitUrl!=""||_skipUrl!=""){
		_Url=_Url+"?"
		if(_workUnitUrl!=""){
			_Url=_Url+_workUnitUrl+"&"
		}
		if(_nameUrl!=""){
			_Url=_Url+_nameUrl+"&"
		}
		if(_limitUrl!=""){
			_Url=_Url+_limitUrl+"&"
		}
		if(_skipUrl!=""){
			_Url=_Url+_skipUrl+"&"
		}
		_Url=_Url.substr(0,_Url.length-1)
	}
	var nexturl=webEntry.domain+":"+webEntry.restPort+"/patient/getDoctorLists"+_Url
	Doctor.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}


    	res.json({results: items,nexturl:nexturl});

	}, option, fields, populate);

}

//通过patient表中userId返回PatientObject 2017-03-30 GY 
//修改：增加判断不存在ID情况 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
    var query = { 
        userId: req.query.userId
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

//获取患者的所有医生 2017-03-30 GY
//2017-04-05 GY 修改：按照要求更换查询表
exports.getMyDoctor = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
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

//获取患者ID对象(用于新建患者方法) 2017-04-06 GY
exports.checkPatientId = function (req, res, next) {
	if (req.body.userId == null || req.body.userId == '') {
        return res.json({result:'请填写userId!'});
    }
    var query = { 
        userId: req.body.userId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient != null) {
        	return res.json({result:'已存在的患者ID！'});
        }
        //req.body.patientObject = patient;
        next();
    });
};
//新建患者个人信息 2017-04-06 GY
exports.newPatientDetail = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	if (req.body.birthday == null || req.body.birthday =='') {
		return res.json({result:'请填写birthday!'});
	}
	if (req.body.bloodType == null || req.body.bloodType =='') {
		return res.json({result:'请填写bloodType!'});
	}
	if (req.body.hypertension == null || req.body.hypertension =='') {
		return res.json({result:'请填写hypertension!'});
	}
	var patientData = {
		userId:req.body.userId, 
		name:req.body.name, 
		gender:req.body.gender, 
		bloodType:req.body.bloodType, 
		hypertension:req.body.hypertension, 
		class:req.body.class, 
		class_info:req.body.class_info, 
		birthday:new Date(req.body.birthday), 
		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	if (req.body.photoUrl != null){
		patientData['photoUrl'] = req.body.photoUrl;
	}
	if (req.body.IDNo != null){
		patientData['IDNo'] = req.body.IDNo;
	}
	if (req.body.height != null){
		patientData['height'] = req.body.height;
	}
	if (req.body.occupation != null){
		patientData['occupation'] = req.body.occupation;
	}
	if (req.body.nation != null){
		patientData['address.nation'] = req.body.nation;
	}
	if (req.body.province != null){
		patientData['address.province'] = req.body.province;
	}
	if (req.body.city != null){
		patientData['address.city'] = req.body.city;
	}
	if (req.body.operationTime != null){
		patientData['operationTime'] = req.body.operationTime;
	}
	if (req.body.lastVisittime != null){
		patientData['lastVisit.time'] = req.body.lastVisittime;
	}
	if (req.body.lastVisithospital != null){
		patientData['lastVisit.hospital'] = req.body.lastVisithospital;
	}
	if (req.body.lastVisitdiagnosis != null){
		patientData['lastVisit.diagnosis'] = req.body.lastVisitdiagnosis;
	}
	//return res.status(200).send(counselData);
	var newPatient = new Patient(patientData);
	newPatient.save(function(err, patientInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({result: '新建成功', results: patientInfo});
	});
}

//修改患者个人信息 2017-04-06 GY
exports.editPatientDetail = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	var query = {
		userId: req.body.userId
	};
	
	var upObj = {
		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	if (req.body.userId != null){
		upObj['userId'] = req.body.userId;
	}
	if (req.body.name != null){
		upObj['name'] = req.body.name;
	}
	if (req.body.photoUrl != null){
		upObj['photoUrl'] = req.body.photoUrl;
	}
	if (req.body.birthday != null){
		upObj['birthday'] = new Date(req.body.birthday);
	}
	if (req.body.gender != null){
		upObj['gender'] = req.body.gender;
	}
	if (req.body.IDNo != null){
		upObj['IDNo'] = req.body.IDNo;
	}
	if (req.body.height != null){
		upObj['height'] = req.body.height;
	}
	if (req.body.occupation != null){
		upObj['occupation'] = req.body.occupation;
	}
	if (req.body.bloodType != null){
		upObj['bloodType'] = req.body.bloodType;
	}
	if (req.body.nation != null){
		upObj['address.nation'] = req.body.nation;
	}
	if (req.body.province != null){
		upObj['address.province'] = req.body.province;
	}
	if (req.body.city != null){
		upObj['address.city'] = req.body.city;
	}
	if (req.body.class != null){
		upObj['class'] = req.body.class;
	}
	if (req.body.class_info != null){
		upObj['class_info'] = req.body.class_info;
	}
	if (req.body.operationTime != null){
		upObj['operationTime'] = req.body.operationTime;
	}
	if (req.body.hypertension != null){
		upObj['hypertension'] = req.body.hypertension;
	}
	if (req.body.lastVisittime != null){
		upObj['lastVisit.time'] = new Date(req.body.lastVisittime);
	}
	if (req.body.lastVisithospital != null){
		upObj['lastVisit.hospital'] = req.body.lastVisithospital;
	}
	if (req.body.lastVisitdiagnosis != null){
		upObj['lastVisit.diagnosis'] = req.body.lastVisitdiagnosis;
	}
	//return res.json({query: query, upObj: upObj});
	Patient.updateOne(query, upObj, function(err, upPatient) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upPatient == null) {
			return res.json({result:'修改失败，不存在的患者ID！'})
		}
		res.json({result: '修改成功', results: upPatient});
	}, {new: true});
}

//新增疾病进程
exports.getDoctorObject = function (req, res, next) {
	if (req.body.doctorId == null || req.body.doctorId == '') {
		return res.json({result:'请填写doctorId!'});
	}
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
}
exports.insertDiagnosis = function(req, res) {
	if (req.body.patientId == null || req.body.patientId == '') {
		return res.json({result:'请填写patientId!'});
	}
	var query = {
		userId: req.body.patientId
	};
	
	var diagname = req.body.diagname, 
		diagprogress = req.body.diagprogress, 
		diagcontent = req.body.diagcontent; 

	if (req.body.diagtime == null || req.body.diagtime == '') {
		var diagtime = new Date();
	}
	else {
		var diagtime = new Date(req.body.diagtime); 
	}
	if (req.body.diagoperationTime == null || req.body.diagoperationTime == '') {
		var diagoperationTime = new Date('1900-01-01');
	}
	else {
		var diagoperationTime = new Date(req.body.diagoperationTime); 
	}
	if (req.body.diaghypertension == null || req.body.diaghypertension == '') {
		var diaghypertension = 0;
	}
	else {
		var diaghypertension = req.body.diaghypertension; 
	}
	
	var upObj = {
		$push: {
			diagnosisInfo: {
				name:diagname, 
				time:diagtime, 
				hypertension:diaghypertension, 
				progress:diagprogress, 
				operationTime:diagoperationTime, 
				content:diagcontent, 
				doctor:req.body.doctorObject._id
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Patient.update(query, upObj, function(err, updiag) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (updiag.nModified == 0) {
			return res.json({result:'未成功修改！请检查输入是否符合要求！', results: updiag});
		}
		if (updiag.nModified == 1) {
			return res.json({result:'修改成功', results: updiag});
		}
		res.json({results: updiag});
	}, {new: true});
}