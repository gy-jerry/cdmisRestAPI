var	config = require('../config'),
	VitalSign = require('../models/vitalSign');

//查询某患者某一种体征记录 
exports.getVitalSigns = function(req, res) {
	//查询条件
	var query = {
		patientId:req.body.patientObject._id, 
		type:req.query.type
	};
	//输出内容
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	var populate = {path: 'patientId', select:{'_id':0, 'userId':1}};

	VitalSign.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

