var express = require('express');
var router = express.Router();
var user = require('../server/user.js');
var membership = require('../server/membership.js');
var tools =  require('../server/tools.js');
/*
status: get only users with the given status. See app/models/principal.rb for a list of available statuses. Default is 1 (active users). Possible values are:
1: Active (User can login and use their account)
2: Registered (User has registered but not yet confirmed their email address or was not yet activated by an administrator. User can not login)
3: Locked (User was once active and is now locked, User can not login)
name: filter users on their login, firstname, lastname and mail ; if the pattern contains a space, it will also return users whose firstname match the first word or lastname match the second word.
group_id: get only users who are members of the given group
*/

/* GET users listing. */
router.route('/')
  .get(function(req, res) {
    
    var params = {};
    //Require
    params.api_key = req.query.api_key;
    //Optional
    if(req.query.limit) params.limit = req.query.limit;
    if(req.query.offset ) params.offset  = req.query.offset;
    if(req.query.name ) params.name  = req.query.name;
    if(req.query.group_id) params.group_id = req.query.group_id;
    //Post params check
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    var redmine = user.initByApiKey(params.api_key);
    console.log('redmine : ' + JSON.stringify(redmine));
    user.queryUser(redmine,params).then(function(users) {
      // on fulfillment(已實現時)
      console.log('users : ' + JSON.stringify(users));
      res.status(200).send(users);
    }, function(reason) {
      // 失敗時
      console.log('get users err: ' + reason);
      res.send(reason);
    });
  })

  //New bind device
  .post(function(req, res) {
    var params = {'user':{}};
    // Require
    params.user.api_key = req.body.api_key;
    params.user.login = req.body.login;
    params.user.password = req.body.password;
    params.user.firstname = req.body.firstname;
    params.user.lastname = req.body.lastname;
    params.user.mail = req.body.mail;
    // params.user.auth_source_id = 0;
    //Post params check
    var verifyResult = tools.validateValue (params.user);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete params.api_key;
    var redmine = user.initByApiKey(req.body.api_key);
    user.inserUser(redmine, params).then(function(user) {
      // on fulfillment(已實現時)
      // Add membership to project
      res.status(200).send(user);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

  //Update user data
  .put(function(req, res) {
    var params = {'user':{}};
    params.user.api_key = req.body.api_key;
    params.user.user_id = req.body.user_id;
    if (req.body.password) {
      params.user.password = req.body.password;
    }
    if (req.body.firstname) {
      params.user.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
      params.user.lastname = req.body.lastname;
    }
    if (req.body.mail) {
      params.user.mail = req.body.mail;
    }
    if (req.body.firstname) {
      params.user.firstname = req.body.firstname;
    }
    //Post params check
    var verifyResult = tools.validateValue (params.user);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    delete params.user.api_key;
    delete params.user.user_id;
    var redmine = user.initByApiKey(req.body.api_key);
    user.updateUser(redmine, req.body.user_id, params).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

    //Delete user by user id
  .delete(function(req, res) {
    var params = {};
    // Require
    params.api_key = req.body.api_key;
    params.user_id = req.body.user_id;
    //Post params check
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    // http request
    var redmine = user.initByApiKey(req.body.api_key);
    user.removeUser(redmine, req.body.user_id).then(function(result) {
      // on fulfillment(已實現時)
      res.status(200).send(result);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

//Get user by user id
router.route('/:id')
  .get(function(req, res) {
    var params = {};
    // Require
    params.api_key = req.query.api_key;
    params.id = req.params.id;
    // Post params check
    var verifyResult = tools.validateValue (params);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    params = {};
    params.include = 'memberships,groups';
    // http request
    var redmine = user.initByApiKey(req.query.api_key);
    user.queryUserById(redmine, req.params.id, params).then(function(users) {
      // on fulfillment(已實現時)
      res.status(200).send(users);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

module.exports = router;