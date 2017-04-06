var	config = require('../config'),
	VitalSign = require('../models/vitalSign'), 
	Patient = require('../models/patient');

//查询某患者某一种体征记录 
exports.getVitalSigns = function(req, res) {
	//查询条件
	var query = {
		patientId:req.body.patientObject._id, 
		type:req.query.type
	};
	//输出内容
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	var populate = {path: 'patientId', select:{'_id':0, 'userId':1}};

	VitalSign.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//新建体征记录 2017-04-06 GY
exports.getPatientObject = function (req, res, next) {
	//通过patientId获取patient表中对应的_id
    var querypatient = { 
        userId: req.body.patientId
    };
    Patient.getOne(querypatient, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient == null) {
        	return res.status(404).send('不存在的患者ID！');
        }
        req.body.patientObject = patient;
        next();
    });
    

}
exports.getVitalSign = function (req, res, next) {
	//return res.json({result:req.body});
	//查询vitalsign表中是否存在已有对应日期的条目
    var queryVital = {
    	patientId: req.body.patientObject._id, 
    	type: req.body.type, 
    	code: req.body.code, 
    	unit: req.body.unit, 
    	date: new Date(req.body.date)
    };
    VitalSign.getOne(queryVital, function(err, vitalsignitem){
    	if (err) {
    		console.log(err);
    		return res.status(500).send('查询失败');
    	}

    	//查询不到，需要新建一个条目
    	if (vitalsignitem == null) {
    		//return res.json({result:req.body});
    		//return res.status(200).send('查询不到');
    		var vitalSignData = {
    			patientId: req.body.patientObject._id, 
    			type: req.body.type, 
    			code: req.body.code, 
    			unit: req.body.unit, 
    			date: new Date(req.body.date)
    		};
    		//return res.json({result:vitalSignData});
    		var newVitalSign = new VitalSign(vitalSignData);
			newVitalSign.save(function(err, vitalSignInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			next();
			});
    	}
    	//查询到条目，添加data
    	else if (vitalsignitem != null) {
    		next();
    	}
    	
    })
}
exports.insertData = function(req, res) {
	var query = {
		patientId: req.body.patientObject._id, 
		type: req.body.type, 
		code: req.body.code, 
		date: new Date(req.body.date)
	};
	
	var upObj = {
		$push: {
			data: {
				time:new Date(req.body.datatime), 
				value:req.body.datavalue
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	VitalSign.update(query, upObj, function(err, updata) {
		if (err){
			return res.status(422).send(err.message);
		}

		res.json({results: updata});
	}, {new: true});
}