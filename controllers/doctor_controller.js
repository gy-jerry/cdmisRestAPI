var	config = require('../config'),
	Doctor = require('../models/doctor'), 
	Team = require('../models/team'), 
	DpRelation = require('../models/dpRelation'), 
	Consultation = require('../models/consultation'), 
	Comment = require('../models/comment');

//根据userId查询医生信息 2017-03-28 GY
exports.getDoctor = function(req, res) {
	var _userId = req.query.userId
	var query = {userId:_userId};

	Doctor.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}

//新建医生基本信息 2017-04-01 GY
exports.insertDocBasic = function(req, res) {
	var doctorData = {
		userId: req.body.userId, 							//doctest01
		name: req.body.name, 								//新01
		//注意时区问题
		birthday: new Date(req.body.birthday), 				//1956/01/01
		gender: req.body.gender, 							//1
		IDNo: req.body.IDNo, 								
		workUnit: req.body.workUnit, 						//浙江省人民医院
		title: req.body.title, 								//副高
		department: req.body.department, 					//泌尿外科
		major: req.body.major, 								//肾移植
		introduction: req.body.introduction,					//好

		score: req.body.score, 
		charge1: req.body.charge1, 
		charge2: req.body.charge2, 
		//teams: ["team1", "team2"], 
		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};

	var newDoctor = new Doctor(doctorData);
	newDoctor.save(function(err, doctorInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: doctorInfo});
	});
}

//根据doctorId获取所有团队 2017-03-29 GY
exports.getTeams = function(req, res) {
	//查询条件
	var _userId = req.query.userId
	//userId可能出现在sponsor或者是members里
	var query = {$or:[{sponsorId:_userId}, {'members.userId':_userId}]};

	//输出内容
	var opts = '';
	var fields = {"teamId":1, "name":1, "_id":0};

	Team.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields);
}

//通过doctor表中userId查询_id 2017-03-30 GY 
//修改：增加判断不存在ID情况 2017-04-05 GY
exports.getDoctorObject = function (req, res, next) {
    var query = { 
        userId: req.query.userId
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (doctor == null) {
        	return res.status(404).send('不存在的医生ID！');
        }
        req.body.doctorObject = doctor;
        next();
    });
};

//根据医生ID获取患者基本信息 2017-03-29 GY
//暂时缺少头像
exports.getPatientList = function(req, res) {
	//查询条件
	var doctorObject = req.body.doctorObject;
	var query = {doctorId:doctorObject._id};

	var opts = '';
	var fields = {'_id':0, 'patients.patientId':1};
	//通过子表查询主表，定义主表查询路径及输出内容
	var populate = {path: 'patients.patientId', select: {'_id':0, 'name':1, 'birthday':1, 'gender':1, 'class':1, 'photoUrl':1}};

	DpRelation.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//通过team表中teamId查询teamObject 2017-03-30 GY 
exports.getTeamObject = function (req, res, next) {
	var _status = req.query.status;
    var query = { 
        teamId: req.query.teamId
    };
    //req.body.status = _status;
    Team.getOne(query, function (err, team) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        //req.body.teamObject = team;
        req.obj = {
        	teamObject:team, 
        	status:req.query.status
        };
        next();
    });
};

//根据teamId和status获取团队病例列表
exports.getGroupPatientList = function(req, res) {
	//查询条件
	var teamObject = req.obj.teamObject;
	//status在表中为数值类型，而从上一级传入的为字符串类型，需要转为数字，并且parseInt()后面的参数不可省略
	var _status = parseInt(req.obj.status, 10);
	var query = {teamId:teamObject._id, status:_status};

	var opts = '';
	var fields = {'_id':0, 'diseaseInfo':1, 'patientId':1, 'status':1, 'time':1};
	//通过子表查询主表，定义主表查询路径及输出内容
	var populate = {
		path: 'diseaseInfo patientId', 
		select: {
			'_id':0, 
			'name':1, 'gender':1, 'birthday':1, 'photoUrl':1, 
			'topic':1, 'content':1, 'title':1, 'sickTime':1, 'symptom':1, 'symptomPhotoUrl':1, 'descirption':1, 'drugs':1, 'history':1, 'help':1
		}
	};

	Consultation.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//
exports.getDoctorInfo = function(req, res) {
	//查询条件
	var doctorObject = req.body.doctorObject;
	var query = {doctorId:doctorObject._id};

	var opts = '';
	var fields = {'_id':0, 'time':1, 'content':1, 'doctorId':1, 'patientId':1};
	//通过子表查询主表，定义主表查询路径及输出内容
	var populate = {
		path: 'doctorId patientId', 
		select: {
			'_id':0, 
			'userId':1, 'name':1, 'workUnit':1, 'title':1, 'department':1, 'major':1, 
			'descirption':1, 'score':1, 'charge1':1, 'charge2':1, 'photoUrl':1
		}
	};

	Comment.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}