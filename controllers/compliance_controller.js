var config = require('../config');
var Compliance = require('../models/compliance');


exports.insertOne = function(req, res) {
	

	var newDictTypeTwo = new DictTypeTwo(categoryData);
	newDictTypeTwo.save(function(err, dictTypeTwoInfo) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: dictTypeTwoInfo});
	});
}


exports.getCategory = function(req, res) {
  var category = req.query.category
  var query = {category:category};

  DictTypeTwo.getOneCategory(query, function(err, item) {
    if (err) {
          return res.status(500).send(err.errmsg);
      }
      res.json({results: item});
  });
}

