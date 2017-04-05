var	config = require('../config'),
	Communication = require('../models/communication'), 
	Counsel = require('../models/counsel'), 
	Team = require('../models/team');

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