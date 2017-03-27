var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
	userId: String,						
	sortNo: Number, 
	name: String, 
	date: Date, 
	description: String, 
	task: [
	  {
	  	type: String, 
	  	code: String, 
	  	instruction: String, 
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


var taskModel = mongoose.model('task', taskSchema);

function Task(task) {
	this.task = task;
}

Task.prototype.save = function(callback) {
	var task = this.task;
	var newTask = new taskModel(task);
	newTask.save(function(err, taskItem) {
		if (err) {
			return callback(err);
		}
		callback(null, taskItem);
	});
}

Task.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	taskModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, taskInfo) {
			if(err){
				return callback(err);
			}
			callback(null, taskInfo);
		});
};


Task.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	taskModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, tasks) {
			if(err) {
				return callback(err);
			}
			callback(null, tasks);
		});
};

Task.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	taskModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, uptask) {
			if(err){
				return callback(err);
			}
			callback(null, uptask);
		});
};




module.exports = Task;
