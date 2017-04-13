var	config = require('../config'),
	Message = require('../models/message');

//根据类型查询消息链接 2017-04-05 GY 
exports.getMessages = function(req, res) {
	if (req.query.type == null || req.query.type == '') {
        return res.json({result:'请填写type!'});
    }
	//查询条件
	//var doctorObject = req.body.doctorObject;
	var query = {type:req.query.type};

	//设置参数
	//注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};
	var fields = '';
	var populate = '';

	Message.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

