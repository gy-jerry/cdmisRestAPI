
var mongoose = require('mongoose');

var communicationSchema = new mongoose.Schema({
	messageNo:String,
	messageType:Number,
	sendStatus:Number,
	readStatus:Number,
	sendBy:String,
	reciever:String,
	sendDateTime:Date,
	title:String,
	content:String
});


communicationModel = mongoose.model('communication', communicationSchema);

function Communication(communication) {
	this.communication = communication;
}

communication.prototype.save = function(callback) {
	var communication = this.communication;
	var newcommunication = new communicationModel(communication);
	newCommunication.save(function(err, communicationItem) {
		if (err) {
			return callback(err);
		}
		callback(null, communicationItem);
	});
}

communication.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	communicationModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, communicationInfo) {
			if(err){
				return callback(err);
			}
			callback(null, communicationInfo);
		});
};


communication.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	communicationModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, communications) {
			if(err) {
				return callback(err);
			}
			callback(null, communications);
		});
};

communication.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	communicationModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upcommunication) {
			if(err){
				return callback(err);
			}
			callback(null, upcommunication);
		});
};




module.exports = Communication;