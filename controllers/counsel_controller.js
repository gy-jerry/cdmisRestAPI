var	config = require('../config'),
		Counsel = require('../models/counsel');


//根据状态、类型、获取咨询问诊信息 2017-03-28 GY
//暂未实现计数，暂未获取头像
//status 和type 传入参数
exports.getCounsels = function(req, res) {
	//查询条件
	var _doctorId = req.body.doctorObject._id;
	var _status = req.query.status;
	var _type = req.query.type;
	var query;

	//type和status可以为空
	if(_type == null && _status != null){
		query = {doctorId:_doctorId, status:_status};
	}
	else if(_type != null && _status == null){
		query = {doctorId:_doctorId, type:_type};
	}
	else if(_type == null && _status == null){
		query = {doctorId:_doctorId};
	}
	else{
		query = {doctorId:_doctorId, status:_status, type:_type};
	}
	
	
	var opts = '';
	var fields = {"_id":0, "doctorId":0, "messages":0, "revisionInfo":0};
	//关联主表patient获取患者信息
	var populate = {path: 'patientId', select:{'_id':0, 'name':1, 'gender':1, 'birthday':1}}

	Counsel.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

