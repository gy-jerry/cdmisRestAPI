var	config = require('../config'),
	News = require('../models/news');

//根据类型查询消息链接 2017-04-05 GY 
exports.getNews = function(req, res) {

	if (req.query.userId == null || req.query.userId == '') {
		return res.json({result: '请填写userId'});
	}
	// if (req.query.type == null || req.query.type == '') {
	// 	return res.json({resutl: '请填写type'});
	// }

	var userId = req.query.userId;
	var type = req.query.type;

	if (userId == null || userId == '') {
        return res.json({result:'请填写userId!'});
    }

	var query = {"$or":[{userId:userId},{sendBy:userId}]};

	if (type != '' && type != undefined) {
        query["type"] = type
    }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};

	News.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, opts);
}

exports.getNewsByReadOrNot = function(req, res) {

	if (req.query.userId == null || req.query.userId == '') {
		return res.json({result: '请填写userId'});
	}
	if (req.query.readOrNot == null || req.query.readOrNot == '') {
		return res.json({resutl: '请填写readOrNot'});
	}

	var userId = req.query.userId;
	var type = req.query.type;
	var _readOrNot = req.query.readOrNot;
	if (userId == null || userId == '') {
        return res.json({result:'请填写userId!'});
    }

	var query = {userId:userId,readOrNot:_readOrNot};

	if (type != '' && type != undefined) {
        query["type"] = type
    }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};

	News.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, opts);
}

exports.insertNews = function(req, res) {

	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result: '请填写userId'});
	}
	if (req.body.sendBy == null || req.body.sendBy == '') {
		return res.json({result: '请填写sendBy'});
	}
	if (req.body.readOrNot == null || req.body.readOrNot == '') {
		return res.json({resutl: '请填写readOrNot'});
	}
	// var readOrNot = 0;
	// return res.json({messageId:req.newId})

	var newData = {
		userId: req.body.userId,
		sendBy: req.body.sendBy,
		readOrNot: req.body.readOrNot
	};
	if (req.body.type != null){
		newData['type'] = req.body.type;
	}
	if (req.body.messageId != null){
		newData['messageId'] = req.body.messageId;
	}
	if (req.body.time != null && req.body.time != ''){
		newData['time'] = new Date(req.body.time);
	}
	else {
		newData['time'] = new Date();
	}
	if (req.body.title != null){
		newData['title'] = req.body.title;
	}
	if (req.body.description != null){
		newData['description'] = req.body.description;
	}
	if (req.body.url != null){
		newData['url'] = req.body.url;
	}

	// return res.json({messageData:messageData})
	var query1 = {
		userId:req.body.userId,
		sendBy:req.body.sendBy
	};
	var query2 = {
		sendBy:req.body.userId,
		userId:req.body.sendBy
	};
	News.getOne(query1, function(err, item1) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item1==null){
        	console.log(123);
    		News.getOne(query2, function(err, item2) {
		        if (err) {
		            return res.status(500).send(err.errmsg);
		        }
		        if(item2==null){
		        	//insert
		        	var newnew = new News(newData);
					newnew.save(function(err, newInfo) {
						if (err) {
					  		return res.status(500).send(err.errmsg);
						}
						var newResults = newInfo;
						res.json({result:'新建成功', newResults: newResults});
					});
		        }
		        else{
		        	//update query2
		        	News.update(query2,newData, function(err, upmessage) {
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
						
					});
		        }
		    });
        }
        else{
        	//update query1
			//return res.json({query: query, upObj: upObj});
			News.update(query1, newData, function(err, upmessage) {
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
				
			});
        	// res.json({results: item});
        }
    });
}

exports.insertTeamNews = function(req, res) {

	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result: '请填写userId'});
	}
	if (req.body.sendBy == null || req.body.sendBy == '') {
		return res.json({result: '请填写sendBy'});
	}
	// if (req.body.readOrNot == null || req.body.readOrNot == '') {
	// 	return res.json({resutl: '请填写readOrNot'});
	// }
	var readOrNot = 0;
	// return res.json({messageId:req.newId})

	var newData = {
		userId: req.body.userId,
		sendBy: req.body.sendBy,
		readOrNot: readOrNot
	};
	if (req.body.type != null){
		newData['type'] = req.body.type;
	}
	if (req.body.messageId != null){
		newData['messageId'] = req.body.messageId;
	}
	if (req.body.time != null && req.body.time != ''){
		newData['time'] = new Date(req.body.time);
	}
	else {
		newData['time'] = new Date();
	}
	if (req.body.title != null){
		newData['title'] = req.body.title;
	}
	if (req.body.description != null){
		newData['description'] = req.body.description;
	}
	if (req.body.url != null){
		newData['url'] = req.body.url;
	}

	// return res.json({messageData:messageData})
	var query1 = {
		userId:req.body.userId,
		sendBy:req.body.sendBy
	};
	var query2 = {
		sendBy:req.body.userId,
		userId:req.body.sendBy
	};
	News.getOne(query1, function(err, item1) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item1==null){
        	console.log(123);
    		News.getOne(query2, function(err, item2) {
		        if (err) {
		            return res.status(500).send(err.errmsg);
		        }
		        if(item2==null){
		        	//insert
		        	var newnew = new News(newData);
					newnew.save(function(err, newInfo) {
						if (err) {
					  		return res.status(500).send(err.errmsg);
						}
						var newResults = newInfo;
						res.json({result:'新建成功', newResults: newResults});
					});
		        }
		        else{
		        	//update query2
		        	News.update(query2,newData, function(err, upmessage) {
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
						
					});
		        }
		    });
        }
        else{
        	//update query1
			//return res.json({query: query, upObj: upObj});
			News.update(query1, newData, function(err, upmessage) {
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
				
			});
        	// res.json({results: item});
        }
    });
}}