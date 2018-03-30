'use strict()';
var express = require('express');
var router = express.Router();
var issue = require('../server/issue.js');
var tools =  require('../server/tools.js');
var async  = require('async');
/*
Parameters:

offset: skip this number of issues in response (optional)
limit: number of issues per page (optional)
sort: column to sort with. Append :desc to invert the order.
include: fetch associated data (optional, use comma to fetch multiple associations). Possible values:
attachments - Since 3.4.0
relations
Optional filters:

issue_id: get issue with the given id or multiple issues by id using ',' to separate id.
project_id: get issues from the project with the given id (a numeric value, not a project identifier).
subproject_id: get issues from the subproject with the given id. You can use project_id=XXX&subproject_id=!* to get only the issues of a given project and none of its subprojects.
tracker_id: get issues from the tracker with the given id
status_id: get issues with the given status id only. Possible values: open, closed, * to get open and closed issues, status id
assigned_to_id: get issues which are assigned to the given user id. me can be used instead an ID to fetch all issues from the logged in user (via API key or HTTP auth)
parent_id: get issues whose parent issue is given id.
cf_x: get issues with the given value for custom field with an ID of x. (Custom field must have 'used as a filter' checked.)
...
*/

/* GET issue listing. */
router.route('/')
  .get(function(req, res) {

    var params = {};
    // Require
    params.api_key = req.query.api_key;
    // Optional for
    if (req.query.limit) params.limit = req.query.limit;
    // if (req.query.offset ) params.offset  = req.query.offset;
    if (req.query.sort ) params.sort  = req.query.sort;
    if (req.query.group_id) params.group_id = req.query.group_id;
    if (req.query.project_id) params.project_id = req.query.project_id;
    if (req.query.tracker_id) params.tracker_id = req.query.tracker_id;
    if (req.query.start_date) params.start_date = req.query.start_date;
    if (req.query.assigned_to_id) params.assigned_to_id = req.query.assigned_to_id;
    if (req.query.sort) params.sort = req.query.sort;
    if (req.query.author_id) params.author_id = req.query.author_id;
    // Post params check -- start
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      tools.returnFormateErr (res, verifyResult);
      return;
    }
    delete params.api_key;
    
    // Post params check -- end
    params.include = 'attachments';
    var redmine = issue.initByApiKey(req.query.api_key);
    if (req.query.page === '0') {
      getAllissues(req,res,redmine,params);
    } else {
      // Http request
      var obj = tools.getPage(req);
      params.offset = obj.offset;
      issue.queryIssue(redmine, params).then(function(data) {
        // on fulfillment(已實現時)
        var result = {
          total: data.total_count,
          previous: obj.previous,
          next: obj.next,
          page: obj.page,
          last: Math.ceil(data.total_count/obj.limit),
          limit: obj.limit,
          data: data.issues
        };
        tools.returnQueryResult (res, result);
      }, function(reason) {
        // 失敗時
        tools.returnServerErr (res, reason);
      });
    }
  })

  /**
   * POST /issues.json
    {
      "issue": {
        "project_id": "1",
        "subject": "Creating an issue with a uploaded file",
        "uploads": [
          {"token": "7167.ed1ccdb093229ca1bd0b043618d88743", "filename": "image.png", "content_type": "image/png"}
        ]
      }
    }
   */

  //New Issue
  .post(function(req, res) {
    var params = {'issue':{}};
    // Require
    params.issue.api_key = req.body.api_key;
    params.issue.project_id = req.body.project_id;
    params.issue.subject = req.body.subject;
    params.issue.tracker_id = req.body.tracker_id;
    params.issue.status_id = req.body.status_id;
    params.issue.start_date = req.body.start_date;
    // Optional
    if (req.body.priority_id) {
      params.issue.priority_id = req.body.priority_id;
    }
    if (req.body.description) {
      params.issue.description = req.body.description;
    }
    if (req.body.assigned_to_id) {
      params.issue.assigned_to_id = req.body.assigned_to_id;
    }
    if (req.body.category_id) {
      let id = req.body.category_id;
      params.issue.category_id = parseInt(id);
    }
    //Start Date
    if (req.body.start_date) {
      params.issue.start_date = req.body.start_date;
    }
    //done_ratio - Complete percentage
    if (req.body.done_ratio) {
      params.issue.done_ratio = req.body.done_ratio;
    }
    //estimated_hours
    if (req.body.estimated_hours) {
      params.issue.estimated_hours = req.body.estimated_hours;
    }
    // Custom fields check
    if (req.body.custom_fields_id) {
      params.issue.custom_fields_id = req.body.custom_fields_id;
    }
    if (req.body.custom_fields_value) {
      params.issue.custom_fields_value = req.body.custom_fields_value;
    }
    if (req.body.uploads) {
      params.issue.uploads = req.body.uploads;
    }
    // Post params check -- start
    var verifyResult = tools.validateValue (params.issue);
    if(verifyResult !== 'ok') {
      tools.returnFormateErr (res, verifyResult);
      return;
    }
    delete params.issue.api_key;
    // Delete custom fileds params of check
    if (req.body.custom_fields_value) {
      delete params.issue.custom_fields_value;
    }
    if (req.body.custom_fields_id) {
      delete params.custom_fields_id;
    }
    // Delete upload params of check
    if (req.body.uploads) {
      delete params.issue.uploads;
    }
    // Post params check -- end
    // Set custom field params
    if(req.body.custom_fields_id) {
      params = getCustomFielsParams(params, req.body.custom_fields_id,req.body.custom_fields_value);
    }
    if (req.body.uploads) {
      params =  getUploadParams (params, req.body.uploads);
      if(params === null) {
        tools.returnFormateErr (res, "uploads format error");
        return;
      }
    }
    
    // Http request
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.insertIssue(redmine, params).then(function(issue) {
      // on fulfillment(已實現時)
      tools.returnExcuteResult (res, issue);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

  //Update issue
  .put(function(req, res) {
    var params = {'issue':{}};
    // Require
    params.issue.api_key = req.body.api_key;
    params.issue.issue_id = req.body.issue_id;

    if (req.body.project_id) {
      params.issue.project_id = req.body.project_id;
    }
    if (req.body.subject) {
      params.issue.subject = req.body.subject;
    }
    if (req.body.tracker_id) {
      params.issue.tracker_id = req.body.tracker_id;
    }
    if (req.body.status_id) {
      params.issue.status_id = req.body.status_id;
    }
    if (req.body.priority_id) {
      params.issue.priority_id = req.body.priority_id;
    }
    if (req.body.description) {
      params.issue.description = req.body.description;
    }
    if (req.body.assigned_to_id) {
      params.issue.assigned_to_id = req.body.assigned_to_id;
    }
    if (req.body.category_id) {
      params.issue.category_id = req.body.category_id;
    }
    //Start Date
    if (req.body.start_date) {
      params.issue.start_date = req.body.start_date;
    }
    //End Date 
    if (req.body.due_date) {
      params.issue.due_date = req.body.due_date;
    }
    //done_ratio - Complete percentage
    if (req.body.done_ratio) {
      params.issue.done_ratio = req.body.done_ratio;
    }
    //estimated_hours
    if (req.body.estimated_hours) {
      params.issue.estimated_hours = req.body.estimated_hours;
    }
    // Custom fields check
    if (req.body.custom_fields_id) {
      params.issue.custom_fields_id = req.body.custom_fields_id;
    }
    if (req.body.custom_fields_value) {
      params.issue.custom_fields_value = req.body.custom_fields_value;
    }
    if (req.body.uploads) {
      params.issue.uploads = req.body.uploads;
    }
    // Upload file
    /*if (req.body.token) {
      params.issue.token = req.body.token;
    }
    if (req.body.filename) {
      params.issue.filename= req.body.filename;
    } */
    // Post params check -- start
    var verifyResult = tools.validateValue (params.issue);
    if(verifyResult !== 'ok') {
      tools.returnFormateErr (res, verifyResult);
      return;
    }
    delete params.issue.api_key;
    delete params.issue.issue_id;
    // Delete custom fileds params of check
    if (req.body.custom_fields_value) {
      delete params.issue.custom_fields_value;
    }
    if (req.body.custom_fields_id) {
      delete params.issue.custom_fields_id;
    }
    // Delete upload params of check
    if (req.body.uploads) {
      delete params.issue.uploads;
    }
    // Post params check -- end
    // Set custom field params
    if(req.body.custom_fields_id) {
      params = getCustomFielsParams(params, req.body.custom_fields_id,req.body.custom_fields_value);
    }
    if (req.body.uploads) {
      params =  getUploadParams (params, req.body.uploads);
      if(params === null) {
        tools.returnFormateErr (res, "uploads format error");
        return;
      }
    }
    //Http request
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.updateIssue(redmine, req.body.issue_id, params).then(function(result) {
      // on fulfillment(已實現時)
      tools.returnExcuteResult (res, result);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

  //Delete issue by issue id
  .delete(function(req, res) {
    var params = {};
    // Require
    params.api_key = req.body.api_key;
    params.issue_id = req.body.issue_id;
    // Post params check -- start
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      tools.returnFormateErr (res, "uploads format error");
      return;
    }
    // Post params check -- end
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.removeIssue(redmine, req.body.issue_id).then(function(result) {
      // on fulfillment(已實現時)
      tools.returnExcuteResult (res, result);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

router.route('/:id')
  .get(function(req, res) {
    var params = {};
    var json = {};
    // Require
    json.api_key = req.query.api_key;
    json.issue_id = req.params.id;
    // Post params check -- start
    var verifyResult = tools.validateValue (json);
    if(verifyResult !== 'ok') {
      res.send({
        "status": "400",
        "message": verifyResult
      });
      return;
    }
    // Post params check -- end
    params.include = 'memberships,attachments';
    var redmine = issue.initByApiKey(json.api_key);
    var id = req.params.id;
    issue.queryIssueById(redmine, Number(id), params).then(function(issues) {
      // on fulfillment(已實現時)
      tools.returnQueryResult (res, issues);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

module.exports = router;

function getCustomFielsParams (params,id,value) {
  let filed = {
    'id': id,
    'value':value
   };
  params.issue.custom_fields = [];
  params.issue.custom_fields.push(filed);
  return params;
}

function getUploadParams (params, uploads) {
  var json = null;
  try {
    var json = JSON.parse(uploads);
  } catch (error) {
    console.log('Upload parser error');
    return null;
  }
  params.issue.uploads = json;
  return params;
}

function getAllissues(req,res,redmine,params) {
  
  async.waterfall([
    function(next){
      params.limit = 100;
      getIssue(redmine, params, function(err1, result1){
          next(err1, result1);
      });
    },
    function(rst1, next){
      getOtherIssue(redmine, params, rst1, function(err2, result2){
        if(result2.total_count <= params.limit) {
          var result = {
            total: result2.issues.length,
            data: result2.issues
          };
          tools.returnQueryResult (res, result);
          return;
        }   
        next(err2, result2);
      });
    }
    ], function(err, rst){
        if (err === 'finish') {
          var result = {
            total: rst.issues.length,
            data: rst.issues
          };
          tools.returnQueryResult (res, result);
        } else {
          tools.returnServerErr (res, err);
        }
        //console.log(rst);   // 收到的 rst = 上面的 result4
    });
}

function getOtherIssue(redmine, params, rst,callback) {
  var total = rst.total_count;
  var offset = rst.offset;
  var limit = rst.limit;
  params.offset = 0;
  
  async.forever(function(next){
    params.offset = params.offset + limit;
    getIssue(redmine, params, function(err, result){
        if (!err) {
          rst.issues = rst.issues.concat(result.issues);
        } 
        
        if (rst.issues.length === rst.total_count) {
          err = 'finish';//If has err
        }
        next(err);
        if(err === 'finish') {
          return callback(err, rst);
        } else if(err) {
          return callback(err, null);
        }
    });

  }, function(err){
      console.log('error!!!');
      console.log(err);
  });
}

function getIssue(redmine, params, callback) {
  issue.queryIssue(redmine, params).then(function(data) {
    // on fulfillment(已實現時)
    return callback(null,data);
  }, function(reason) {
    // 失敗時
    return callback(reason,null);
  });
}