var	config = require('../config'),
		DictHospital = require('../models/dictHospital');


exports.getHospital = function(req, res) {
	var locationCode = req.query.locationCode ;
	var hostipalCode = req.query.hostipalCode;
	
	var query = {};
	if(locationCode != "")
	{
		query["locationCode"] = locationCode

	}
	if(hostipalCode != "")
	{
		query["hostipalCode"] = hostipalCode
	}
	console.log(query);
	
	DictHospital.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	});
}
