var	config = require('../config'),
	InsuranceMsg = require('../models/insuranceMsg');

//更新或插入保险消息 2017-04-18 GY
exports.updateInsuranceMsg = function(req, res, next) {

	if (req.body.doctorId == null || req.body.doctorId == '') {
		return res.json({result: '请填写doctorId'});
	}
	if (req.body.patientId == null || req.body.patientId == '') {
		return res.json({resutl: '请填写patientId'});
	}
	if (req.body.insuranceId == null || req.body.insuranceId == '') {
		return res.json({resutl: '请填写insuranceId'});
	}

	//为调用insertMessage方法传入参数
	req.body.userId = req.body.patientId;
	if (req.body.type == null || req.body.type == '') {
		return res.json({result: '请输入保险的消息类型'})
	}

	if (req.body.insDescription == null) {
		var insDescription = '';
	}
	if (req.body.tiem == null || req.body.time == '') {
		var time = new Date();
	}
	else {
		var time = new Date(req.body.time)
	}

	var doctorId = req.body.doctorId;
	var patientId = req.body.patientId;
	
	// return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
	var query = {doctorId: doctorId, patientId: patientId};
	var upObj = {
		$push: {
			insuranceMsg: {
				insuranceId: req.body.insuranceId, 
				time: time, 
				description: insDescription
			}
		}
	};

	InsuranceMsg.update(query, upObj, function(err, upinsurance) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upinsurance.n == 0) {
			var insuranceData = {
    			doctorId: doctorId, 
    			patientId: patientId
    		};
    		//return res.json({result:insuranceData});
    		var newInsuranceMsg = new InsuranceMsg(insuranceData);
			newInsuranceMsg.save(function(err, insuranceInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			InsuranceMsg.update(query, upObj, function(err, upIns) {
					if (err) {
						return res.status(422).send(err.message);
					}
					else if (upIns.nModified == 0) {
						return res.json({result:'未成功修改！请检查输入是否符合要求！', results: upIns, flag:'0'});
					}
					else if (upIns.nModified == 1) {
						// return res.json({result:'修改成功', results: upIns, flag:'0'});
						next();
					}
					// return res.json({result:upIns});
				}, {new: true});
			});
		}
		else if (upinsurance.nModified == 0) {
			return res.json({result:'未成功修改！请检查输入是否符合要求！', results: upinsurance, flag:'1'});
		}
		else if (upinsurance.nModified == 1) {
			// return res.json({result:'修改成功', results: upinsurance, flag:'1'});
			next();
		}
		// res.json({results: upinsurance});
	}, {new: true});
}
exports.updateMsgCount = function(req, res, next) {
	var doctorId = req.body.doctorId;
	var patientId = req.body.patientId;
	var query = {doctorId: doctorId, patientId: patientId};
	var opts = '';
	var fields = '';
	var populate = '';

	InsuranceMsg.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}

    	var upObj = {count: item.insuranceMsg.length};
    	InsuranceMsg.updateOne(query, upObj, function(err, upInsMsg) {
			if (err){
				return res.status(422).send(err.message);
			}
			else if (upInsMsg == null) {
				return res.json({result:'修改失败'})
			}
			else {
				// return res.json({result: '修改成功', results:upInsMsg});
				req.body.InsMsg = upInsMsg;
				next();
			}
		}, {new: true});

    	// res.json({results:item});
	}, opts, fields, populate);
}

//获取保险推送信息
exports.getInsMsg = function(req, res) {
	
	if (req.query.doctorId == null || req.query.doctorId == '') {
		return res.json({result: '请填写doctorId'});
	}
	if (req.query.patientId == null || req.query.patientId == '') {
		return res.json({resutl: '请填写patientId'});
	}

	var query = {
		doctorId: req.query.doctorId, 
		patientId: req.query.patientId
	};
	var opts = '';
	var fields = '';
	var populate = '';

	InsuranceMsg.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}

    	res.json({results:item});
	}, opts, fields, populate);
}