var config = require('../config');
var DictTypeTwo = require('../models/dictTypeTwo');


exports.insertCategory = function(req, res) {
	var categoryData = {
  			category: "VitalSigns",
  			contents:[{
  				type:"Bloodpressure",
  				typeName:"血压",
  				details:[
      				{   code:"Bloodpressure_1",
  		  				name:"收缩压",
  		  				inputCode:"SSY",
  		  				description:"",
        				invalidFlag:0}]
  					}
  				]
  			}
		

	var newDictTypeTwo = new DictTypeTwo(categoryData);
	newDictTypeTwo.save(function(err, dictTypeTwoInfo) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: dictTypeTwoInfo});
	});
}
