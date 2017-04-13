var	config = require('../config'),
	Message = require('../models/message');

//根据类型查询消息链接 2017-04-05 GY 
exports.getMessages = function(req, res) {
	var userId = req.query.userId;
	var type = req.query.type;

	if (userId == null || userId == '') {
        return res.json({result:'请填写userId!'});
    }

	var query;
	query = {userId:userId};

	if ( type != '') {
        query["type"] = type
    }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};

	Message.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, opts);
}
