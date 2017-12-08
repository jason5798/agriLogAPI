var Redmine = require('node-redmine');
var configs =  require('../configs.js');
///////////////////////////////////////////////////////////////
var hostname =  configs.redmine_server;

function initByUser (user_name,user_pwd) {
  var config = {
      username: user_name, password: user_pwd
  };
  var redmine = new Redmine(hostname, config);
  return redmine;
}

function initByApiKey (api_key) {
  var config = {
    apiKey: api_key
  };
  var redmine = new Redmine(hostname, config);
  return redmine;
}

var updateJson = {
  "issue":{
    "done_ratio": 640
  }
};

var issueJson = {
  "issue": {
    "project_id": configs.project_id,
    "subject": "農場A",
    "assigned_to_id": 67,
    "priority_id": 4,
    "tracker_id" : 3
  }
};

//id:136 agri 
//id:47  Secom HS iOS APP

/**
 * Create issue in redmine database.
 * ex:
 * {
 *  "issue": {
 *    "project_id": 136,
 *    "subject": "農場A",
 *     "assigned_to_id": 67,
 *    "notes": "灑水五分鐘",
 *     "priority_id": 4,
 *    "tracker_id" : 3
 *   }
 * }
 * @param {*} issue
 * @param string, number params
 */
function inserUser (redmine, user) {
  return new Promise(function (resolve, reject) {
    redmine.create_user(user, function(err, data) {
      if (!err) {
        console.log('Insert user success', data)
        resolve(data)
      } else {
        console.log('Insert user error', err)
        reject(err)
      }
    });
  })
}

/**
 * query user 
 * parameters : offset, limit, sort,include
 * Optional filters :status, name [login, firstname, lastname and mail], group_id
 * ex:
 * {
 *   "offset": 0,
 *   "limit": 100,
 *   "id": 136
 * }
 * @param {*} query
 */
function queryUser (redmine, params) {

  return new Promise(function (resolve, reject) {
    redmine.users(params, function(err, data) {
      if (!err) {
        if(data){
          console.log('Query user success : ' + data.users.length);
        }
        resolve(data)
      } else {
        console.log('Query users error', err)
        reject(err)
      }
    });
  })
}

/**
* Removes issue id of issue from redmine database.
* ex: issue_id = 4424;
* 
* @param {*} issue_id
*/
function removeUser (redmine, user_id) {
  return new Promise(function (resolve, reject) {
    redmine.delete_user(user_id, function(err) {
      if (!err) { 
        console.log('Delete user success')
        resolve('Delete user success')
      } else {
        console.log('Delete user error', err)
        reject(err)
      }
    })
  })
 }
  
function updateUser (redmine, user_id, params) {
  return new Promise(function (resolve, reject) {
    redmine.update_user(user_id, params, function(err,data) {
      if (!err) {
        console.log('Update user success')
        resolve('Update user success')
      } else {
        console.log('Update user error', err)
        reject(err)
      }
    });
  })
}

function queryUserById (redmine, user_id, params) {
    return new Promise(function (resolve, reject) {
        redmine.get_user_by_id(user_id, params, function(err,data) {
        if (!err) {
            console.log('Query user by id success')
            resolve(data)
        } else {
            console.log('Query user by id error ' + err)
            reject(err)
        }
        });
    })
}

module.exports = {
    initByUser,
    initByApiKey,
    inserUser,
    removeUser,
    updateUser,
    queryUser,
    queryUserById
}