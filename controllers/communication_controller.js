var	config = require('../config'),
	Communication = require('../models/communication'), 
	Counsel = require('../models/counsel'), 
	Team = require('../models/team'), 
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor'), 
	Consultation = require('../models/consultation');

//根据counselId获取counsel表除messages外的信息 2017-03-31 GY 
exports.getCounselReport = function(req, res) {
	//查询条件
	var _counselId = req.query.counselId;
	var query = {counselId:_counselId};

	//设置参数
	var opts = '';
	var fields = {'_id':0, 'messages':0, 'revisionInfo':0};
	var populate = {path: 'doctorId patientId', select:{'_id':0, 'userId':1, 'name':1}};

	Counsel.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//根据teamId获取team表所有信息 2017-03-31 GY 
exports.getTeam = function(req, res) {
	//查询条件
	var _teamId = req.query.teamId;
	var query = {teamId:_teamId};

	//设置参数
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	var populate = '';

	Team.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//新建组 2017-04-06 GY
exports.newTeam = function(req, res) {
	var teamData = {
		teamId: req.body.teamId,						
		name: req.body.name, 
		sponsorId: req.body.sponsorId, 
		sponsorName: req.body.sponsorName, 
		// members: [
	 //  		{
	 //  			userId: String, 
	 //  			name: String
	 //  		}
		// ], 
		time: new Date(), 
		description: req.body.description, 
		// number: req.body., 

		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	
	var newTeam = new Team(teamData);
	newTeam.save(function(err, teamInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: teamInfo});
	});
}

//新建会诊 2017-04-06 GY
exports.checkTeam = function (req, res, next) {
    var query = { 
        teamId: req.body.teamId
    };
    Team.getOne(query, function (err, team) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 团队查询失败!');
        }
        if (team == null) {
        	return res.json({result:'不存在的teamID！'});
        }
        req.body.teamObject = team;
        next();
    });
};
exports.checkCounsel = function (req, res, next) {
    var query = { 
        counselId: req.body.counselId
    };
    Counsel.getOne(query, function (err, counsel) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 咨询信息查询失败!');
        }
        if (counsel == null) {
        	return res.json({result:'不存在的counselID！'});
        }
        req.body.diseaseInfo = counsel;
        next();
    });
};
exports.checkPatient = function (req, res, next) {
    var query = { 
        userId: req.body.patientId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 患者查询失败!');
        }
        if (patient == null) {
        	return res.json({result:'不存在的patientID！'});
        }
        req.body.patientObject = patient;
        next();
    });
};
exports.checkDoctor = function (req, res, next) {
    var query = { 
        userId: req.body.sponsorId
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 医生查询失败!');
        }
        if (doctor == null) {
        	return res.json({result:'不存在的doctorID！'});
        }
        req.body.sponsorObject = doctor;
        next();
    });
};
exports.newConsultation = function(req, res) {
	var consultationData = {
		consultationId: req.body.consultationId,						
		sponsorId: req.body.sponsorObject._id, 
		patientId: req.body.patientObject._id, 
		time: new Date(), 
		diseaseInfo: req.body.diseaseInfo._id, 
		// messages: [
	 //  	  {
	 //  		sender: String, 
	 //  		receiver: String, 
	 //  		time: Date, 
	 //  		content: String
	 //  	  }
		// ], 
		// conclusion: String, 
		teamId: req.body.teamObject._id, 

		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	
	var newConsultation = new Consultation(consultationData);
	newConsultation.save(function(err, consultationInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: consultationInfo});
	});
}

//根据consultationId更新conclusion 2017-04-06 GY
exports.conclusion = function(req, res) {
	var query = {
		consultationId: req.body.consultationId
	};
	
	var upObj = {
		conclusion: req.body.conclusion
	};
	//return res.json({query: query, upObj: upObj});
	Consultation.updateOne(query, upObj, function(err, upConclusion) {
		if (err){
			return res.status(422).send(err.message);
		}

		res.json({results: upConclusion});
	}, {new: true});
}

//给team表中members字段增加组员 2017-04-06 GY
exports.insertMember = function(req, res) {
	var query = {
		teamId: req.body.teamId
	};
	
	var upObj = {
		$addToSet: {
			members: {
				userId:req.body.membersuserId, 
				name:req.body.membersname
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Team.update(query, upObj, function(err, upmember) {
		if (err){
			return res.status(422).send(err.message);
		}

		res.json({results: upmember});
	}, {new: true});
}

//删除team表中members字段指定组员 2017-04-06 GY
exports.removeMember = function(req, res) {
	var query = {
		teamId: req.body.teamId
	};
	
	var upObj = {
		$pull: {
			members: {
				userId:req.body.membersuserId
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Team.update(query, upObj, function(err, upmember) {
		if (err){
			return res.status(422).send(err.message);
		}

		res.json({results: upmember});
	}, {new: true});
}