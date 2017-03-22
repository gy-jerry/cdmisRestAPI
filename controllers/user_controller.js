var	config = require('../config'),
		User = require('../models/user');


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
		userId: "testInsert",						
		userName: "chi",					
		openId: "qwe",						
		phoneNo: "135",					
		password:"123456",
		photoUrl:"url",
		role:["pt"],
		loginStatus:1,
		lastLogin:new Date(),
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




