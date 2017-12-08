var express = require('express');
var router = express.Router();
var project = require('../server/project.js');
var configs =  require('../configs.js');
var tools =  require('../server/tools.js');
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
    if(req.query.offset ) json.offset  = req.query.offset;
    //Post params check --- start
    var verifyResult = tools.validateValue (json);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete json.api_key;
    //Post params check --- end
    json.include = 'trackers';
    //Http request
    var redmine = project.initByApiKey(req.query.api_key);
    project.queryProject(redmine, json).then(function(obj) {
      // on fulfillment(已實現時)
      res.status(200).send(obj);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
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
      res.status(400).send(verifyResult);
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
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
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
    // Post params check --- start
    var verifyResult = tools.validateValue (params.project);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete params.project.api_key;
    delete params.project.project_id;
    // Post params check --- end
    var redmine = project.initByApiKey(req.body.api_key);
    project.updateProject(redmine, req.body.project_id, params).then(function(user) {
      // on fulfillment(已實現時)
      res.status(200).send(user);
    }, function(reason) {
      // 失敗時
      res.send(reason);
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
      res.status(400).send(verifyResult);
      return;
    }
    // Post params check --- end
    //Http request
    var redmine = project.initByApiKey(req.body.api_key);
    project.removeProject(redmine, req.body.project_id).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
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
      res.status(400).send(verifyResult);
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
      res.send(reason);
    });
  })

module.exports = router;