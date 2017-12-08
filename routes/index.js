var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var issue = require('../server/issue.js');
var myhttpreq = require('../server/myhttpreq.js');
var tools =  require('../server/tools.js');
var user =  require('../server/user.js');
var configs =  require('../configs.js');
/* GET home page. */
router.route('/')
  .get(function(req, res) {
    res.render('index', { title: 'Express' });
  })

router.route('/login')
  .post(function(req, res) {
    var params = {'user':{}};
    params.user.login = req.body.login;
    params.user.password = req.body.password;
    //Post params check
    var verifyResult = tools.validateValue (params.user);
    if(verifyResult !== 'ok') {
      res.status(400).send(verifyResult);
      return;
    }
    
    var redmine = issue.initByUser(params.user.login, params.user.password);
    var redmine2 = user.initByApiKey(configs.redmine_apikey);
    
    params = {};
    // User authentication 
    issue.queryIssue(redmine, params).then(function(issues) {
      // on fulfillment(已實現時)
      // User authentication is OK
      params.name = req.body.login
      // Get user id
      user.queryUser(redmine2, params).then(function(data) {
        // Get user id is OK
        // Get use apikey and membership
        params = {};
        params.include = 'memberships,groups';
        user.queryUserById(redmine2, data.users[0].id, params).then(function(user) {
          // Get use apikey and membership is OK
          res.status(200).send(user);
        }, function(reason) {
          // Get use apikey and membership is fail
          ressend(reason);
        });
      }, function(reason) {
        // 失敗時
        res.send(reason);
      });
    }, function(reason) {
      // User authentication is fail
      res.send(reason);
    });
    
  })

router.route('/custom_fields')
  .get(function(req, res) {
    
    // Http request
    var redmine = issue.initByApiKey(configs.redmine_apikey);
    issue.queryCustomFields(redmine).then(function(fields) {
      // on fulfillment(已實現時)
      res.status(200).send(fields);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

router.route('/trackers')
  .get(function(req, res) {
    
    // Http request
    var redmine = issue.initByApiKey(configs.redmine_apikey);
    issue.queryTrackers(redmine).then(function(trackers) {
      // on fulfillment(已實現時)
      res.status(200).send(trackers);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

router.route('/roles')
  .get(function(req, res) {
    // Http request
    var redmine = issue.initByApiKey(configs.redmine_apikey);
    issue.queryRoles(redmine).then(function(roles) {
      // on fulfillment(已實現時)
      res.status(200).send(roles);
    }, function(reason) {
      // 失敗時
      res.send(reason);
    });
  })

router.route('/upload')
  .post(function(req, res) {
    // Require
    var form = new formidable.IncomingForm();
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;
    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../uploads');

    form.parse(req, function (err, fields, files) {
      var verifyResult = tools.validateValue (fields);
      if(verifyResult !== 'ok') {
        res.status(400).send(verifyResult);
        return;
      }
      let keys = Object.keys(fields);
      let api_key = fields[keys[0]];
      // Post params check -- start
      
      let keys2 = Object.keys(files);
      let file = files[keys2[0]];
      myhttpreq.initByApiKey(api_key);
      var stream = fs.createReadStream(file.path);
      myhttpreq.uploadFile(stream,function(err,result){
        fs.unlinkSync(file.path);
        if (err) {
          res.send(err);
        } else {
          res.status(200).send(result);
        } 
      });
    });
})

module.exports = router;