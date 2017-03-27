var mongoose = require('mongoose');

var dpRelationSchema = new mongoose.Schema({					
	doctorId: String, 
	patients: [
	  {
	  	patientId: String, 
	  	labels: [String]
	  }
	], 
	doctors: [
	  {
	  	doctorId: String, 
	  	lastTalkTime: Date
	  }
	], 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var dpRelationModel = mongoose.model('dpRelation', dpRelationSchema);

function DpRelation(dpRelation) {
	this.dpRelation = dpRelation;
}

DpRelation.prototype.save = function(callback) {
	var dpRelation = this.dpRelation;
	var newDpRelation = new dpRelationModel(dpRelation);
	newDpRelation.save(function(err, dpRelationItem) {
		if (err) {
			return callback(err);
		}
		callback(null, dpRelationItem);
	});
}

DpRelation.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	dpRelationModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, dpRelationInfo) {
			if(err){
				return callback(err);
			}
			callback(null, dpRelationInfo);
		});
};


DpRelation.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	dpRelationModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, dpRelations) {
			if(err) {
				return callback(err);
			}
			callback(null, dpRelations);
		});
};

DpRelation.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	dpRelationModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, updpRelation) {
			if(err){
				return callback(err);
			}
			callback(null, updpRelation);
		});
};




module.exports = DpRelation;
