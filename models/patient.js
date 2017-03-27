var mongoose = require('mongoose');

var patientSchema = new mongoose.Schema({					
	userId: String, 
	name: String, 
	birthday: Date, 
	gender: Number, 
	IDNo: String, 
	height: String, 
	occupation: String, 
	bloodType: Number, 
	address: {
		nation: String, 
		province: String, 
		city: String
	}, 
	class: String, 
	class_info: [String], 
	VIP: Number, 
	hypertension: Number, 
	doctors: [
	  {
	  	doctorId: String, 
	  	firstTime: Date, 
	  	invalidFlag: Number
	  }
	], 
	diagnosisInfo: [
	  {
	  	name: String, 
	  	time: Date, 
	  	doctor: String
	  }
	], 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var patientModel = mongoose.model('patient', patientSchema);

function Patient(patient) {
	this.patient = patient;
}

Patient.prototype.save = function(callback) {
	var patient = this.patient;
	var newPatient = new patientModel(patient);
	newPatient.save(function(err, patientItem) {
		if (err) {
			return callback(err);
		}
		callback(null, patientItem);
	});
}

Patient.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	patientModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, patientInfo) {
			if(err){
				return callback(err);
			}
			callback(null, patientInfo);
		});
};


Patient.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	patientModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, patients) {
			if(err) {
				return callback(err);
			}
			callback(null, patients);
		});
};

Patient.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	patientModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, uppatient) {
			if(err){
				return callback(err);
			}
			callback(null, uppatient);
		});
};




module.exports = Patient;
