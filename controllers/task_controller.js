var	config = require('../config'),
		Task = require('../models/task');


exports.getTasks = function(req, res) {
	var userId = req.query.userId;
	var query = {userId:userId};

	Task.getSome(query, function(err, tasks) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}

    	if(tasks.length == 0)
    	{
    		query = {userId:"Admin"};
    	}

    var sortNo = req.query.sortNo;
	
		if(sortNo != "")
		{
			query["sortNo"] = sortNo;

		}

		Task.getSome(query, function(err, tasks) {
			if (err) {
      			return res.status(500).send(err.errmsg);
    		}

    		res.json({results: tasks});
		});
	});

	
}

exports.updateStatus = function(req, res) {
	var userId = req.query.userId,
	    sortNo = req.query.sortNo,
	    type = req.query.type,
	    code = req.query.code,
	    status = req.query.status;
      console.log(sortNo);


	var query = {userId:userId,sortNo:sortNo};  
	Task.getOne(query, function(err, item) {
    	  if (err) {
          return res.status(500).send(err.errmsg);
      	}
      	
      	// res.json({results: item});
      	// console.log(item.task);
        if(item != null)
        {
          flag = 0;
          for(var i =0; i < item.task.length; i++)
          {
            if(item.task[i].type == type)
            {
              for(var j =0; j<item.task[i].details.length;j++)
              {
                if(item.task[i].details[j].code == code)
                {
                  // console.log(item.task[i].details[j].status);
                  item.task[i].details[j].status = status;
                  flag = 1;
                  break;
                }
              }
            }
            if(flag == 1)
              break;
          }
          var upObj = {$set:{task:item.task}};
        
          Task.updateOne(query, upObj,function(err, task) {
            if (err) {
              return res.status(500).send(err.errmsg);
            }

          res.json({results: 0});
  
          });
        }
        else
        {
          res.json({results: 1});
        }
      	

  	});
	
}

exports.updateStartTime = function(req, res) {
	var userId = req.query.userId,
	    sortNo = req.query.sortNo,
	    type = req.query.type,
	    code = req.query.code,
	    startTime = req.query.startTime;


	var query = {userId:userId,sortNo:sortNo};  
	Task.getOne(query, function(err, item) {
    	if (err) {
        	return res.status(500).send(err.errmsg);
      	}
      	flag = 0;
      	// res.json({results: item});
      	// console.log(item.task);
      	for(var i =0; i < item.task.length; i++)
      	{
      		if(item.task[i].type == type)
      		{
      			for(var j =0; j<item.task[i].details.length;j++)
      			{
      				if(item.task[i].details[j].code == code)
      				{
      					// console.log(item.task[i].details[j].status);
      					item.task[i].details[j].status = 1;
      					item.task[i].details[j].startTime = startTime;
      					flag = 1;
      					break;
      				}
      			}
      		}
      		if(flag == 1)
      			break;
      	}
		var upObj = {$set:{task:item.task}};
      	
      	Task.updateOne(query, upObj,function(err, task) {
			if (err) {
      			return res.status(500).send(err.errmsg);
    		}

    		res.json({results: 0});
	
		});

  	});
	
}

//插入任务模板 2017-04-15 GY
exports.getTaskModel = function(req, res, next) {
  //var userId = 'Admin';
  var query = {userId:'Admin', sortNo: req.body.sortNo};

  Task.getOne(query, function(err, task) {
    if (err) {
        return res.status(500).send(err.errmsg);
    }
    req.body.task = task;
    //return res.json({result:req.body.task});
    next();
  }); 
}
exports.insertTaskModel = function(req, res) {
  if (req.body.userId == null || req.body.userId == '') {
    return res.json({result:'请填写userId!'});
  }

  var task = req.body.task;

  var taskData = {
    userId:req.body.userId, 
    sortNo:req.body.sortNo, 
    name:task.name, 
    date:task.date, 
    description:task.description, 
    invalidFlag:task.invalidFlag, 
    task:task.task
  };


  var newTask = new Task(taskData);
  newTask.save(function(err, taskInfo) {
    if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({result:'插入成功', newResults: taskInfo});
  });
}