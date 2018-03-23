var express = require('express');
var router = express.Router();
var project = require('../server/project.js');
var configs =  require('../configs.js');
var tools =  require('../server/tools.js');
var async  = require('async');
/*
*Parameters:
*
*include: fetch associated data (optional). Possible values: trackers, issue_categories,
*enabled_modules (since 2.6.0). Values should be separated by a comma ",".
*/

/* GET projects listing. */
router.route('/')
  .get(function(req, res) {
    
    var json = {};
    // Require
    json.api_key = req.query.api_key;
    // Optional
    if(req.query.limit) json.limit = req.query.limit;
    // if(req.query.offset ) json.offset  = req.query.offset;
    //Post params check --- start
    var verifyResult = tools.validateValue (json);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    delete json.api_key;
    var obj = tools.getPage(req);
    json.offset = obj.offset;
    //Post params check --- end
    json.include = 'trackers';
    //Http request
    var redmine = project.initByApiKey(req.query.api_key);
    if (req.query.page === '0') {
      getAllProjects(req,res,redmine,json);
    } else {
      project.queryProject(redmine, json).then(function(data) {
        // on fulfillment(已實現時)
        var result = {
          total: data.total_count,
          previous: obj.previous,
          next: obj.next,
          page: obj.page,
          last: Math.ceil(data.total_count/obj.limit),
          limit: obj.limit,
          data: data.projects
        };
        res.status(200).send(result);
      }, function(reason) {
        // 失敗時
        res.send({
          "status": "401",
          "message": reason
        });
      });
    }
  })

  //New project
  .post(function(req, res) {
    var params = {project:{}};
    var now = new Date();
    var identifier = 'projects_' + now.getTime();
    // Require
    params.project.api_key = req.body.api_key;
    params.project.name = req.body.name;
    params.project.description = req.body.description;
    // Post params check --- start
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    delete params.project.api_key
    // Post params check --- end
    params.project.identifier = identifier;
    params.project.enabled_module_names = ['boards', 'calendar', 'documents', 'files', 'gantt', 
                                      'issue_tracking', 'news', 'repository', 'time_tracking', 'wiki'];
    params.project.tracker_ids = ['1', '2'];
    if (req.body.parent_id) {
      params.project.parent_id = req.body.parent_id;
    } // else {
      // params.project.parent_id = configs.project_id;
    // }
    /*params.project.is_public = '1';*/
    //Http request
    var redmine = project.initByApiKey(req.body.api_key);
    project.insertProject(redmine, params).then(function(result) {
      // on fulfillment(已實現時)
      res.send({
        "status": "200",
        "message": result
      });
      result
    }, function(reason) {
      // 失敗時
      res.send({
        "status": "401",
        "message": reason
      });
    });
  })

  //Update bind device
  .put(function(req, res) {
    var params = {project:{}};
    // Require
    params.project.api_key = req.body.api_key;
    params.project.project_id = req.body.project_id;
    // Optional
    if (req.body.name) {
      params.project.name = req.body.name;
    }
    if (req.body.parent_id) {
      params.project.parent_id = req.body.parent_id;
    }
    if (req.body.description) {
      params.project.description = req.body.description;
    }
    
    // Post params check --- start
    var verifyResult = tools.validateValue (params.project);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    delete params.project.api_key;
    delete params.project.project_id;
    // Post params check --- end
    var redmine = project.initByApiKey(req.body.api_key);
    project.updateProject(redmine, req.body.project_id, params).then(function(user) {
      // on fulfillment(已實現時)
      res.send({
        "status": "200",
        "message": result
      });
    }, function(reason) {
      // 失敗時
      res.send({
        "status": "401",
        "message": reason
      });
    });
  })

    //Delete bind device
  .delete(function(req, res) {
    var json = {};
    // Require
    json.api_key = req.body.api_key;
    json.project_id = req.body.project_id;
    // Post params check --- start
    var verifyResult = tools.validateValue (json);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    // Post params check --- end
    //Http request
    var redmine = project.initByApiKey(req.body.api_key);
    project.removeProject(redmine, req.body.project_id).then(function(result) {
      // on fulfillment(已實現時)
      res.send({
        "status": "200",
        "message": result
      });
    }, function(reason) {
      // 失敗時
      res.send({
        "status": "401",
        "message": reason
      });
    });
  })

router.route('/:id')
  .get(function(req, res) {
    var json = {};
    var params = {};
    // Require
    json.api_key = req.query.api_key;
    json.project_id = req.params.id;
    // Post params check --- start
    var verifyResult = tools.validateValue (json);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    // Post params check --- end
    params.include = 'trackers,issue_categories,enabled_modules';
    //Http request
    var redmine = project.initByApiKey(req.query.api_key);
    project.queryProjectById(redmine, json.project_id, params).then(function(users) {
      // on fulfillment(已實現時)
      res.status(200).send(users);
    }, function(reason) {
      // 失敗時
      res.send({
        "status": "401",
        "message": reason
      });
    });
  })

module.exports = router;

function getAllProjects(req,res,redmine,params) {
  
  async.waterfall([
    function(next){
      params.limit = 100;
      getProject(redmine, params, function(err1, result1){
        if(result1.total_count < params.limit) {
          res.status(200).send(result1.projects);
          return;
        } 
        next(err1, result1);
      });
    },
    function(rst1, next){
      getOtherProject(redmine, params, rst1, function(err2, result2){
          next(err2, result2);
      });
    }
    ], function(err, rst){
        if (err === 'finish') {
          res.status(200).send(rst);
        } else {
          var message = err;
          if (typeof(err) === 'string') {
            var err = JSON.parse(err);
            message = err.Message;
          }
          if (message===null) {
            message = err;
          }
          res.send({
            "status": "401",
            "message": message
          });
        }
        //console.log(rst);   // 收到的 rst = 上面的 result4
    });
}

function getOtherProject(redmine, params, rst,callback) {
  var total = rst.total_count;
  var offset = rst.offset;
  var limit = rst.limit;
  params.offset = 0;
  
  async.forever(function(next){
    params.offset = params.offset + limit;
    getProject(redmine, params, function(err, result){
        if (!err) {
          rst.projects = rst.projects.concat(result.projects);
        } 
        
        if (rst.projects.length === rst.total_count) {
          err = 'finish';//If has err
        }
        next(err);
        if(err === 'finish') {
          return callback(err, rst.projects);
        } else if(err) {
          return callback(err, null);
        }
    });

  }, function(err){
      console.log('error!!!');
      console.log(err);
  });
}

function getProject(redmine, params, callback) {
  project.queryProject(redmine, params).then(function(data) {
    // on fulfillment(已實現時)
    return callback(null,data);
  }, function(reason) {
    // 失敗時
    return callback(reason,null);
  });
}