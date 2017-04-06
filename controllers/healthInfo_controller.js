var	config = require('../config'),
		HealthInfo = require('../models/healthInfo');


exports.getAllHealthInfo = function(req, res) {
	var _userId = req.query.userId
	var query = {userId:_userId};

	HealthInfo.getSome(query, function(err, healthInfolist) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: healthInfolist});
	});
}


exports.getHealthDetail = function(req, res) {
	var _userId = req.query.userId
	var _label = req.query.label
	var query = {userId:_userId,label:_label};

	HealthInfo.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}

exports.insertHealthInfo = function(req, res) {
	var healthInfoData = {
		userId: req.query.userId,
		type: req.query.type,
		time: new Date(req.query.time),
		url: req.query.url,
		label: req.query.label,
		description: req.query.description,
		comments: req.query.comments,
		revisionInfo:{
			operationTime:new Date(),
			userId:"a123",
			userName:"chi",
			terminalIP:"1234"
		}
	};

	var newHealthInfo = new HealthInfo(healthInfoData);
	newHealthInfo.save(function(err, healthInfoInfo) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		res.json({results: healthInfoInfo});
	});
}

exports.modifyHealthDetail = function(req, res) {
	var healthInfoData = {
		userId: req.query.userId,
		type: req.query.type,
		time: new Date(req.query.time),
		url: req.query.url,
		label: req.query.label,
		description: req.query.description,
		comments: req.query.comments,
		revisionInfo:{
			operationTime:new Date(),
			userId:"a123",
			userName:"chi",
			terminalIP:"1234"
		}
	};

	var query = {userId:req.query.userId,label:req.query.label};
	var ops = {upsert:true}

	HealthInfo.updateOne(query,{ $set: healthInfoData },ops,function(err, item1){
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		res.json({results: 0,data:item1});
	});
}

exports.deleteHealthDetail = function(req, res) {
	var query = {userId:req.query.userId,label:req.query.label};

	HealthInfo.removeOne(query,function(err, item1){
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		res.json({results: 0});
	});
}
