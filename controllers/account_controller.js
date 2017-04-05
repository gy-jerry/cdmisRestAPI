var	config = require('../config'),
	Account = require('../models/account');

//根据doctorId查询相关评价 2017-03-30 GY 
exports.getAccountInfo = function(req, res) {
	//查询条件
	var _userId = req.query.userId;
	var query = {userId:_userId};

	//设置参数
	//var opts = '';
	//var fields = {'_id':0};
	//var fields = '';
	//var populate = {path: 'patientId', select:{'_id':0, 'userId':1, 'name':1}};
	//var populate = '';

	Account.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}

