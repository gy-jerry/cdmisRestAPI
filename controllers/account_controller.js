var	config = require('../config'),
	Account = require('../models/account'), 
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor');

//根据doctorId查询相关评价 2017-03-30 GY 
exports.getAccountInfo = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
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

//通用方法：判断patientId和doctorId是否可用 2017-04-20 GY
exports.checkPatient = function(req, res, next) {
	if (req.query.patientId == null || req.query.patientId == '') {
		if (req.body.patientId == null || req.body.patientId == '') {
			return res.json({result: '请填写patientId!'});
		}
		else {
			req.patientId = req.body.patientId;
		}
	}
	else {
		req.patientId = req.query.patientId;
	}
	var query = {userId: req.patientId};
	Patient.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			return res.json({result: '不存在的患者ID'});
		}
		else {
			next();
		}
	});
}
exports.checkDoctor = function(req, res, next) {
	if (req.query.doctorId == null || req.query.doctorId == '') {
		if (req.body.doctorId == null || req.body.doctorId == '') {
			return res.json({result: '请填写doctorId!'});
		}
		else {
			req.doctorId = req.body.doctorId;
		}
	}
	else {
		req.doctorId = req.query.doctorId;
	}
	var query = {userId: req.doctorId};
	Doctor.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			return res.json({result: '不存在的医生ID'});
		}
		else {
			next();
		}
	});
}

//获取咨询计数 2017-04-20 GY
exports.getCounts = function(req, res, next) {

	var query = {
		userId: req.patientId
	};
	if (req.body.modify == 0) {
		return res.json({result:'此处禁止输入0!'});
	}
	else if (req.body.modify < -1) {
		return res.json({result:'非法输入!'});
	}
	else if (req.body.modify != null && req.body.modify != '') {
		req.modify = parseInt(req.body.modify, 10);
	}
	else {
		req.modify = 0;
	}
	// return res.json({modify: req.modify});

	Account.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			if (req.modify == 0) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 3, 
    				money: 0
    			};
			}
			else if (req.modify == -1) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 2, 
    				money: 0
    			};
			}
			else if (req.modify > 0) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 3, 
    				money: 0, 
    				times: [
    					{
    						count: req.modify, 
    						doctorId: req.doctorId
    					}
    				]
    			};
			}
    		var newAccount = new Account(accountData);
			newAccount.save(function(err, accountInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
			});
			if (req.modify == 0) {
				return res.json({results: 3});
			}
			else {
				req.freeTimes = 3;
				req.count = 0;
				req.totalCount = 3;
				next();
			}
		}
		else {
			var count = 0;
			for (var i = item.times.length - 1; i >= 0; i--) {
				if (item.times[i].doctorId == req.doctorId) {
					count = item.times[i].count;
					break;
				}
			}
			var totalCount = count + item.freeTimes;
			if (req.modify == 0) {
				return res.json({result: totalCount});
			}
			else {
				req.freeTimes = item.freeTimes;
				req.count = count;
				req.totalCount = totalCount;
				next();
			}
		}
	});
}

//根据DocId修改咨询次数 2017-04-20 GY
exports.modifyCounts = function(req, res) {

	var query = {
		userId: req.patientId
	};

	if (req.modify < 0) {
		if (req.totalCount == 0) {
			return res.json({result: '咨询次数已达0, 无法继续减小!'});
		}
		else if (req.freeTimes > 0) {
			var modifyResult = req.freeTimes + req.modify;
			var upObj = {freeTimes: modifyResult};
			Account.updateOne(query, upObj, function(err, upaccount) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				if (upaccount == null) {
					return res.json({result:'请获取账户信息确认是否修改成功'});
				}
				else {
					return res.json({result:'修改成功', updateResult:upaccount});
				}
			}, {new:true});
		}
		else if (req.freeTimes == 0) {
			var modifyResult = req.count + req.modify;
			var upObj = {
				$pull: {
					times: {
						doctorId: req.doctorId
					}
				}
			};
			Account.update(query, upObj, function(err, upaccount) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				if (upaccount.nModified == 0) {
					return res.json({result:'请获取账户信息确认是否修改成功'});
				}
				else if (upaccount.nModified != 0) {
					// return res.json({result:'修改成功', updateResult:upaccount});
					var upObjAdd = {
						$addToSet: {
							times: {
								count: modifyResult, 
								doctorId: req.doctorId
							}
						}
					};
					Account.update(query, upObjAdd, function(err, upaccountadd) {
						if (err) {
							return res.status(500).send(err.errmsg);
						}
						if (upaccountadd.nModified == 0) {
							return res.json({result:'修改失败，请重新修改'});
						}
						else if (upaccountadd.nModified != 0) {
							return res.json({result:'修改成功', updateResult:upaccountadd});
						}
					});
				}
			});
		}
	}
	else if (req.modify > 0) {
		var modifyResult = req.count + req.modify;
		var upObj = {
			$pull: {
				times: {
					doctorId: req.doctorId
				}
			}
		};
		Account.update(query, upObj, function(err, upaccountadd) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (upaccountadd.nModified == 0) {
				var upObjfirst = {
					$addToSet: {
						times: {
							count:modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjfirst, function(err, upaccountfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountfirst.nModified == 0) {
						return res.json({result:'请获取账户信息确认是否修改成功'});
					}
					else if (upaccountfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
				});
			}
			else if (upaccountadd.nModified != 0) {
				var upObjnotfirst = {
					$addToSet: {
						times: {
							count: modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjnotfirst, function(err, upaccountnotfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountnotfirst.nModified == 0) {
						return res.json({result:'修改失败，讲道理这句话不会执行'});
					}
					else if (upaccountnotfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountnotfirst});
					}
				});
				// return res.json({result: '修改成功', updateResult: upaccountadd});
			}
		});
	}
}