var config = require('../config');
var Compliance = require('../models/compliance');


exports.insertOne = function(req, res) {
	var data = {
    userId: req.body.userId,              //doctest01
    type: req.body.type,                //新01
    code: req.body.code,        //1956-01-01
    date: req.body.date,              //1
    status: req.body.status,                
    description: req.body.description
  };


	var newCompliance = new Compliance(data);
	newCompliance.save(function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}

exports.getComplianceByDay = function(req, res) {
  userId = req.query.userId;
  date = req.query.date;

  query = {userId:userId};
  if(date != "")
  {
    query["date"] = date
  }

  Compliance.getSome(query, function(err, items) {
    if (err) {
          return res.status(500).send(err.errmsg);
      }
      res.json({results: items});
  });
}
