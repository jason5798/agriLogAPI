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
var axios = require('axios');
var api_key = configs.redmine_apikey; 
getApikey();
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
      tools.returnFormateErr (res, verifyResult);
      return;
    }
    
    var redmineByUser = issue.initByUser(params.user.login, params.user.password);
    var redmine2ByApiKey = user.initByApiKey(api_key);
    //Check user auth by user accound and password
    user.queryUser(redmineByUser, {name: req.body.login}).then(function(data) {
      console.log('user : ' + JSON.stringify(data));
      toGetUserAllData(req, res, redmineByUser, data);
    }, function(reason) {
      // 失敗時
      var obj = reason;
	    if(typeof(reason) !== 'object') {
        obj = JSON.parse(reason);
      }
      if (Object.is(obj.Message, 'Forbidden')){ //No query limit
        user.queryUser(redmine2ByApiKey, {name: req.body.login}).then(function(data) {
          // Get user id is OK
          console.log('user : ' + JSON.stringify(data));
          toGetUserAllData(req, res, redmineByUser, data);
        }, function(reason) {
          // 失敗時
          tools.returnServerErr(res, reason);
        });
      } else {
        tools.returnServerErr(res, reason);
      }
    });
  })

router.route('/custom_fields')
  .get(function(req, res) {

    // Http request
    var redmine = issue.initByApiKey(api_key);
    issue.queryCustomFields(redmine).then(function(fields) {
      // on fulfillment(已實現時)
      tools.returnQueryResult (res, fields);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

router.route('/trackers')
  .get(function(req, res) {

    // Http request
    var redmine = issue.initByApiKey(api_key);
    issue.queryTrackers(redmine).then(function(trackers) {
      // on fulfillment(已實現時)
      tools.returnQueryResult (res, trackers);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

router.route('/roles')
  .get(function(req, res) {
    // Http request
    var redmine = issue.initByApiKey(api_key);
    issue.queryRoles(redmine).then(function(oles) {
      // on fulfillment(已實現時)
      tools.returnQueryResult (res, roles);
    }, function(reason) {
      // 失敗時
      tools.returnServerErr (res, reason);
    });
  })

router.route('/upload')
  .post(function(req, res) {
    // Require
    var form = new formidable.IncomingForm();
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;
    // store all uploads in the /uploads directory
    // form.uploadDir = path.join(__dirname, '../uploads');

    form.parse(req, function (err, fields, files) {
      console.log('fields : \n%s',JSON.stringify(fields));
      console.log('files : \n%s',JSON.stringify(files));
      var verifyResult = tools.validateValue (fields);
      if(verifyResult !== 'ok') {
        tools.returnFormateErr (res, verifyResult);
        return;
      }
      try {
        let keys = Object.keys(fields);
        let api_key = fields[keys[0]];
        // Post params check -- start
        console.log('api_key : \n%s',api_key);
        let keys2 = Object.keys(files);
        let file = files[keys2[0]];
        console.log('file path : \n%s',file.path);
        myhttpreq.initByApiKey(api_key);
        var stream = fs.createReadStream(file.path);
      } catch (error) {
        tools.returnErr(res, error);
        return;
      }
      
      myhttpreq.uploadFile(stream,function(err,result){
        //fs.unlinkSync(file.path);
        if (err) {
          console.log('upload err : \n%s', err);
          tools.returnServerErr (res, str);
        } else {
	        console.log('upload finish : \n%s', result);
          if (typeof(result) === 'string') {
            result = JSON.parse(result);
          }
          tools.returnExcuteResult (res, result)
        }
      });
    });
})

module.exports = router;

function toGetUserAllData (req, res, redmine ,data) {
  var params = {};
  params.include = 'memberships,groups';
  let userId = -1;
  let target = null;
  if(data['users']){
    let users = data.users;
    users.forEach(function (user) {
        if (Object.is(user.login.toLowerCase(), req.body.login.toLowerCase())) {
          userId = user.id;
          target = user;
        }
    });
  }
  if (userId !== -1) {
    user.queryUserById(redmine, userId, params).then(function(data) {
      // Get use apikey and membership is OK
      // console.log('user : ' + JSON.stringify(user));
      if (user.mail === undefined) {
        data.user.mail = target.mail;
      }
      tools.returnQueryResult (res, data);
    }, function(reason) {
      // Get use apikey and membership is fail
      tools.returnServerErr (res, str);
    });
  } else {
    tools.returnServerErr (res, 'This account is not exist!');
  }
}

function getApikey(callback) {
  var url = 'http://localhost:'+configs.port+'/login';
  axios.post(url, {
      login: configs.redmine_username,
      password: configs.redmine_password
  })
  .then(function (response) {
    console.log(JSON.stringify(response.data.user));
    api_key = response.data.user.api_key;
  })
  .catch(function (error) {
    console.log(error);
  });
}