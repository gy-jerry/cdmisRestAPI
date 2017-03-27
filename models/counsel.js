var mongoose = require('mongoose');

var counselSchema = new mongoose.Schema({
	counselId: String,						
	doctorId: String, 
	patientId: String, 
	type: Number, 
	time: Date, 
	status: Number, 
	topic: String, 
	content: String, 
	title: String, 
	sickTime: String, 
	visited: Number, 
	symptom: String, 
	symptomPhotoUrl: String, 
	descirption: String, 
	drugs: String, 
	history: [String], 
	help: String, 
	comment: String, 
	messages: [
	  {
	  	sender: String, 
	  	receiver: String, 
	  	time: Date, 
	  	content: String
	  }
	], 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var counselModel = mongoose.model('counsel', counselSchema);

function Counsel(counsel) {
	this.counsel = counsel;
}

Counsel.prototype.save = function(callback) {
	var counsel = this.counsel;
	var newCounsel = new counselModel(counsel);
	newCounsel.save(function(err, counselItem) {
		if (err) {
			return callback(err);
		}
		callback(null, counselItem);
	});
}

Counsel.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	counselModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, counselInfo) {
			if(err){
				return callback(err);
			}
			callback(null, counselInfo);
		});
};


Counsel.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	counselModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, counsels) {
			if(err) {
				return callback(err);
			}
			callback(null, counsels);
		});
};

Counsel.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	counselModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upcounsel) {
			if(err){
				return callback(err);
			}
			callback(null, upcounsel);
		});
};




module.exports = Counsel;
