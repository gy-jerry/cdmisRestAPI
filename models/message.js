
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	messageId:String,
	type:Number,
	time:Date,
	title:String,
	description:String,
	url:String,
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}

});


messageModel = mongoose.model('message', messageSchema);

function Message(message) {
	this.message = message;
}

message.prototype.save = function(callback) {
	var message = this.message;
	var newmessage = new messageModel(message);
	newMessage.save(function(err, messageItem) {
		if (err) {
			return callback(err);
		}
		callback(null, messageItem);
	});
}

message.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	messageModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, messageInfo) {
			if(err){
				return callback(err);
			}
			callback(null, messageInfo);
		});
};


message.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	messageModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, messages) {
			if(err) {
				return callback(err);
			}
			callback(null, messages);
		});
};

message.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	messageModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upmessage) {
			if(err){
				return callback(err);
			}
			callback(null, upmessage);
		});
};




module.exports = Message;