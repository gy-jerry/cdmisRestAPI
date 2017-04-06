var	config = require('../config'),
		User = require('../models/user'),
		DictNumber = require('../models/dictNumber'),
		Numbering = require('../models/Numbering');

function getNowFormatDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear()+month+strDate;
    return currentdate;
    // YYYYMMDD
}
function ConvAlphameric(Seq)
{
	var Ret = ""
	var Char = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; //"I","O"除外，容易与1,0混淆
	var lenChar = Char.length
	var idx
	while(Seq >= 1){
		idx = Seq%lenChar
		Ret = Char.substr(idx, idx)+Ret
		Seq = Seq / lenChar
	}

	return Ret;
}

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

exports.register = function(req, res) {
	var _phoneNo = req.query.phoneNo
	var _password = req.query.password
	var _role = req.query.role
	var query = {phoneNo:_phoneNo};
	var _userNo
	User.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if(item==null){
			var _numberingType = 1
			var _targetDate = null
			// var promise = new mongoose.Promise();
			//var UserNo=CreateNo(_numberingType,_targetDate);
			if (_numberingType==null){
				_userNo = ""
				res.json({results: 1,userNo:_userNo,mesg:"Create userNo failure!"});
			}
			else{
				if (_targetDate==null){
					_targetDate= getNowFormatDate();
				}
				var query = {type:_numberingType};
				var Data
				DictNumber.getOne(query, function(err, item) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					Data=item;
					if(Data==null){
						_userNo = ""
						res.json({results: 1,userNo:_userNo,mesg:"Create userNo failure!"});
					}
					else{
						var _Initial=Data.initStr
						var _DateFormat=Data.dateFormat
						var _SeqLength=Data.seqLength
						var _AlphamericFlag=Data.alphamericFlag
						var _Date
						var _KeyDate
						var _TrnNumberingData
						var _TrnNumberingNo
						if(_DateFormat == "YYMMDD"){
							_Date=_targetDate.substring(2,8);
						}
						else if(_DateFormat == "YYYYMMDD"){
							_Date=_targetDate
						}
						if(_Date==null){
							_KeyDate="99999999"
						}
						else{
							_KeyDate=_targetDate
						}
						var query1 = {type:_numberingType,date:_KeyDate};
						Numbering.getOne(query1, function(err, item1) {
							if (err) {
								return res.status(500).send(err.errmsg);
							}
							_TrnNumberingData=item1;
							if(_TrnNumberingData==null){
								_TrnNumberingNo=0
							}
							else{
								_TrnNumberingNo=_TrnNumberingData.number
							}
							_TrnNumberingNo=_TrnNumberingNo+1
							var _Seq = _TrnNumberingNo
							if(_AlphamericFlag==1){
								_Seq=ConvAlphameric(_Seq)
							}
							if(_Seq.toString().length>_SeqLength){
								_TrnNumberingNo=1
								_Seq=1
							}
							if(_TrnNumberingNo==1){
								var numberingData = {
									type:_numberingType,
									date:_KeyDate,
									number: _TrnNumberingNo
								};

								var newNumbering = new Numbering(numberingData);
								newNumbering.save(function(err, Info) {
									if (err) {
										return res.status(500).send(err.errmsg);
									}
									// res.json({results: Info});
								});
							}
							else{
								Numbering.updateOne(query1,{ $set: { number: _TrnNumberingNo } },function(err, item1){
									if (err) {
										return res.status(500).send(err.errmsg);
									}
								});
							}
							// console.log("_Seq:"+_Seq)
							// console.log("_Seq.length:"+_Seq.toString().length)
							// console.log(_SeqLength)
							if(_Seq.toString().length<_SeqLength){
								var n=_SeqLength-_Seq.toString().length
								while(n){
									_Seq="0"+_Seq
									n=n-1
								}
								// console.log(_Seq)
							}
							var _Ret=_Initial+_Date+_Seq
							// console.log(_Ret)
							_userNo =  _Ret
							var userData = {
								phoneNo:_phoneNo,
								password:_password,
								role: _role,
								userId:_userNo
							};
							var newUser = new User(userData);
							newUser.save(function(err, Info) {
								if (err) {
									return res.status(500).send(err.errmsg);
								}
								res.json({results: 0,userNo:_userNo,mesg:"User Register Success!"});
							});
						});
					}
				});
			}
		}
		else{
			res.json({results: 1,userNo:"",mesg:"User Already Exist!"});
		}
	});
}

exports.reset = function(req, res) {
	var _phoneNo = req.query.phoneNo
	var _password = req.query.password
	var query = {phoneNo:_phoneNo};
	User.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if(item==null){
			res.json({results: 1,mesg:"User doesn't Exist!"});
		}
		else{
			User.updateOne(query,{ $set: { password: _password } },function(err, item1){
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				res.json({results: 0,mesg:"password reset success!"});
			});
		}
	});
}

exports.login = function(req, res) {
	var _phoneNo = req.query.phoneNo
	var _password = req.query.password
	var query = {phoneNo:_phoneNo};
	User.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if(item==null){
			res.json({results: 1,mesg:"User doesn't Exist!"});
		}
		else{
			if(_password!=item.password){
				res.json({results: 1,mesg:"User password isn't correct!"});
			}
			else{
				var _lastlogindate=item.lastLogin
				// console.log(Date())
				User.updateOne(query,{ $set: { loginStatus: 0 ,lastLogin:Date()} },function(err, item1){
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					res.json({results: 0,usrid:item.userId,lastlogin:_lastlogindate,PhotoUrl:item.photoUrl,mesg:"login success!"});
				});
			}
		}
	});
}

exports.logout = function(req, res) {
	var _userId = req.query.userId
	var query = {userId:_userId};
	User.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if(item==null){
			res.json({results: 1,mesg:"User doesn't Exist!"});
		}
		else{
			User.updateOne(query,{ $set: { loginStatus: 1} },function(err, item1){
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				res.json({results: 0,mesg:"logout success!"});
			});

		}
	});
}

exports.getUserID = function(req, res) {
	var _phoneNo = req.query.phoneNo
	var query = {phoneNo:_phoneNo};
	User.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if(item==null){
			res.json({results: 1,mesg:"User doesn't Exist!"});
		}
		else{
			res.json({results: 0,UserId:item.userId,mesg:"Get UserId Success!"});
		}
	});
}

exports.sendSMS = function(req, res) {

}