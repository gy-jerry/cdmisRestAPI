var	config = require('../config'),
		DictDistrict = require('../models/dictDistrict');


exports.getDistrict = function(req, res) {
	var level = req.query.level ;
	var province = req.query.province;
	var city = req.query.city;
	var district = req.query.district;
	
	var query = {};
	if(level != "")
	{
		query["level"] = level

	}
	if(province != "")
	{
		query["province"] = province
	}
	if(city != "")
	{
		query["city"] = city
	}
	if(district != "")
	{
		query["district"] = district
	}

	DictDistrict.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	});
}
