var	config = require('../config'),
		User = require('../models/user');


exports.getUser = function(req, res) {
	var _userId = req.query.userId
	var query = {userId:_userId};

	User.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}


exports.getUserList = function(req, res) {
	var query = {};

	User.getSome(query, function(err, userlist) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }

    res.json({results: userlist});
	});
}


exports.insertUser = function(req, res) {
	var userData = {
		userId: "whoareyou",						
		userName: "chi",					
		openId: "qwe",						
		phoneNo: "135",					
		password:"123456",
		photoUrl:"url",
		role:["pt"],
		loginStatus:1,
		lastLogin:new Date(),
		jpush:{
			registrationID:"reg",
			alias:"String",
			tags:["String"]
		},
		revisionInfo:{
			operationTime:new Date(),
			userId:"a123",
			userName:"chi",
			terminalIP:"1234"
		}
	};

	var newUser = new User(userData);
	newUser.save(function(err, userInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: userInfo});
	});
}




