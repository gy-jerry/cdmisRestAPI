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

//根据userId修改某种类型消息的已读状态 GY 2017-04-15
exports.changeMessageStatus = function(req, res) {
	var query = {
		userId: req.body.userId, 
		type: req.body.type
	};
	
	var upObj = {
		readOrNot: req.body.readOrNot
	};

	var opts = {
		'multi':true, 'new':true
	}

	//return res.json({query: query, upObj: upObj});
	Message.update(query, upObj, function(err, upmessage) {
		if (err){
			return res.status(422).send(err.message);
		}
		
		if (upmessage.n != 0 && upmessage.nModified == 0) {
			return res.json({result:'未修改！请检查修改目标是否与原来一致！', results: upmessage});
		}
		if (upmessage.n != 0 && upmessage.nModified != 0) {
			if (upmessage.n == upmessage.nModified) {
				return res.json({result:'全部更新成功', results: upmessage});
			}
			return res.json({result: '未全部更新！', results: upmessage});
		}
		
	}, opts);
}