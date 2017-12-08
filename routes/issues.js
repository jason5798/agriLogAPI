'use strict()';
var express = require('express');
var router = express.Router();
var issue = require('../server/issue.js');
var tools =  require('../server/tools.js');
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
    if (req.query.offset ) params.offset  = req.query.offset;
    if (req.query.sort ) params.sort  = req.query.sort;
    if (req.query.group_id) params.group_id = req.query.group_id;
    if (req.query.project_id) params.project_id = req.query.project_id;
    if (req.query.tracker_id) params.tracker_id = req.query.tracker_id;
    if (req.query.start_date) params.start_date = req.query.start_date;
    if (req.query.assigned_to_id) params.assigned_to_id = req.query.assigned_to_id;
    // Post params check -- start
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete params.api_key;
    // Post params check -- end
    params.include = 'attachments';
    // Http request
    var redmine = issue.initByApiKey(req.query.api_key);
    issue.queryIssue(redmine, params).then(function(issues) {
      // on fulfillment(已實現時)
      res.status(200).send(issues);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
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
    // Optional
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
      let id = req.body.category_id;
      params.issue.category_id = parseInt(id);
    }
    // Custom fields check
    if (req.body.custom_fields_id) {
      params.issue.custom_fields_id = req.body.custom_fields_id;
    }
    if (req.body.custom_fields_value) {
      params.issue.custom_fields_value = req.body.custom_fields_value;
    }
    // Upload file
    if (req.body.token) {
      params.issue.token = req.body.token;
    }
    if (req.body.filename) {
      params.issue.filename= req.body.filename;
    }
    // Post params check -- start
    var verifyResult = tools.validateValue (params.issue);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
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
    if (req.body.token) {
      delete params.issue.token;
    }
    if (req.body.filename) {
      delete params.issue.filename;
    }
    // Post params check -- end
    // Set custom field params
    if(req.body.custom_fields_id) {
      params = getCustomFielsParams(params, req.body.custom_fields_id,req.body.custom_fields_value);
    }
    if (req.body.token) {
      params =  getUploadParams (params, req.body.token, req.body.filename);
    }
    // Http request
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.insertIssue(redmine, params).then(function(issue) {
      // on fulfillment(已實現時)
      res.status(200).send(issue);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

  //Update issue
  .put(function(req, res) {
    var params = {'issue':{}};
    // Require
    params.issue.api_key = req.body.api_key;
    params.issue.issue_id = req.body.issue_id;
    // Optional
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
    // Custom fields check
    if (req.body.custom_fields_id) {
      params.issue.custom_fields_id = req.body.custom_fields_id;
    }
    if (req.body.custom_fields_value) {
      params.issue.custom_fields_value = req.body.custom_fields_value;
    }
    // Upload file
    if (req.body.token) {
      params.issue.token = req.body.token;
    }
    if (req.body.filename) {
      params.issue.filename= req.body.filename;
    }
    // Post params check -- start
    var verifyResult = tools.validateValue (params.issue);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete params.issue.api_key;
    delete params.issue.issue_id;
    // Delete custom fileds params of check
    if (req.body.custom_fields_value) {
      delete params.issue.custom_fields_value;
    }
    if (req.body.custom_fields_id) {
      delete params.custom_fields_id;
    }
    // Delete upload params of check
    if (req.body.token) {
      delete params.issue.token;
    }
    if (req.body.filename) {
      delete params.issue.filename;
    }
    // Post params check -- end
    // Set custom field params
    if(req.body.custom_fields_id) {
      params = getCustomFielsParams(params, req.body.custom_fields_id,req.body.custom_fields_value);
    }
    if (req.body.token) {
      params =  getUploadParams (params, req.body.token, req.body.filename);
    }
    //Http request
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.updateIssue(redmine, req.body.issue_id, params).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
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
      res.status(400).send(verifyResult);
      return;
    }
    // Post params check -- end
    var redmine = issue.initByApiKey(req.body.api_key);
    issue.removeIssue(redmine, req.body.issue_id).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
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
      res.status(400).send(verifyResult);
      return;
    }
    // Post params check -- end
    params.include = 'memberships,attachments';
    var redmine = issue.initByApiKey(json.api_key);
    var id = req.params.id;
    issue.queryIssueById(redmine, Number(id), params).then(function(users) {
      // on fulfillment(已實現時)
      res.status(200).send(users);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

module.exports = router;

function getCustomFielsParams (params,id,value) {
  let filed = {
    'value': id,
    'id':value
   };
  params.issue.custom_fields = [];
  params.issue.custom_fields.push(filed);
  return params;
}

function getUploadParams (params,token,filename) {
  var arr = filename.split(".");
  if (arr.length < 2) {
    return params;
  }
  var attached = arr[1];
  if (attached !=='jpg' && attached !== 'png' && attached !=='gif') {
    return params;
  }
  let type = 'image/' + attached;
  let filed = {
    'token': token,
    'filename': filename,
    'content_type': type
   };
  params.issue.uploads = [];
  params.issue.uploads.push(filed);
  return params;
}