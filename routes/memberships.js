var express = require('express');
var router = express.Router();
var membership = require('../server/membership.js');
var tools =  require('../server/tools.js');
/*
membership (required): a hash of the membership attributes, including:
user_id (required): the numerical id of the user or group
role_ids (required): an array of roles numerical ids
role_ids
 3 : Manager
 4 : Developer
 5 : Reporter
 7 : Operator
*/

router.route('/')
/* GET memberships listing. 
*   example :http://localhost:8000/memberships?project_id=136
*/
  .get(function(req, res) {
    //Verify get params is not empty
    var params = {};
    // Require
    params.api_key = req.query.api_key;
    params.project_id = req.query.project_id;
    //Optional
    if(req.query.limit) params.limit = req.query.limit;
    if(req.query.offset ) params.offset  = req.query.offset;
    //Verify post data is empty or not
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    // Http request
    var redmine = membership.initByApiKey(req.query.api_key);
    membership.queryProjectMembership(redmine, req.query.project_id).then(function(memberships) {
      // on fulfillment(已實現時)
      res.status(200).send(memberships);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

/* Create the membership by id of project. Only the roles can be updated, 
*  the project and the user of a membership are read-only.
*  params : project_id,user_ids,user_ids
*  user_ids: string , Values should be separated by a comma ",".
*/
  .post(function(req, res) {
    var params = {'membership':{}};
    //Requild
    params.membership.project_id = req.body.project_id;
    params.membership.user_ids = req.body.user_ids;
    params.membership.api_key = req.body.api_key;
    params.membership.role_ids = req.body.role_ids;
    
    //Verify post data is empty or not
    var verifyResult = tools.validateValue (params.membership);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
/* parse ids string to array
*  example : role_ids=1,2,3=>['1', '2', '3']
*/
    var roleIdStr = req.body.role_ids;
    var userIdStr = req.body.user_ids;
    
    if (roleIdStr.includes(',')) {
      var roleIdArr = roleIdStr.split(",");
      params.membership.role_ids = roleIdArr;
    } else {
      params.membership.role_ids = [roleIdStr];
    }
    if (userIdStr.includes(',')) {
      var userIdArr = userIdStr.split(",");
      params.membership.user_ids = userIdArr;
    } else {
      params.membership.user_ids = [userIdStr];
    }
    
    //Remove project_id from membership, it's for check.
    delete params.membership.project_id;
    delete params.membership.api_key;
    // Http request
    var redmine = membership.initByApiKey(req.body.api_key);
    membership.insertProjectMembership(redmine, req.body.project_id, params).then(function(membership) {
      // on fulfillment(已實現時)
      res.status(200).send(membership);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

/* Updates the membership of given :id. Only the roles can be updated, 
*  the project and the user of a membership are read-only.
*/
  .put(function(req, res) {
    //Verify post data is not empty
    var params = {'membership':{}};
    //Requild
    params.membership.membership_id = req.body.membership_id;
    params.membership.role_ids =req.body.role_ids;
    params.membership.api_key = req.body.api_key;
    //Verify post data is empty or not
    var verifyResult = tools.validateValue (params.membership);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    /* parse ids string to array
    *  example : role_ids=3,4,5,7=>['3', '4', '5','7']        
    */
    var roleIdStr = req.body.role_ids;
    if (roleIdStr.includes(',')) {
      var roleIdArr = roleIdStr.split(",");
      params.membership.role_ids = roleIdArr;
    } else {
      params.membership.role_ids = [roleIdStr];
    }
    params.membership.role_ids = roleIdArr;
    //Remove project_id from membership, it's for check.
    delete params.membership.membership_id;
    delete params.membership.api_key;
    // Http request
    var redmine = membership.initByApiKey(req.body.api_key);
    membership.updateProjectMembership(redmine, req.body.membership_id, params).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

    //Delete bind device
  .delete(function(req, res) {
    var params = {};
    //Requild
    params.membership_id = req.body.membership_id;
    params.api_key = req.body.api_key;
    //Verify post data is empty or not
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    // Http request
    var redmine = membership.initByApiKey(req.body.api_key);
    membership.removeProjectMembership(redmine, req.body.membership_id).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

module.exports = router;