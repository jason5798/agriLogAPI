var Redmine = require('node-redmine');
var configs =  require('../configs.js');
///////////////////////////////////////////////////////////////
var hostname =  configs.redmine_server;
/* var config = {
    username: configs.redmine_username, password: configs.redmine_password
};

var redmine = new Redmine(hostname, config); */

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

var queryJson = {
     "offset": 0,
     "limit": 100,
     "project_id":136,
     "start_date": "><2017-11-21|2017-11-21"
   };

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
 *    "tracker_id" : 3 // 3: Support,4: operation 
 *   }
 * }
 * @param {*} issue
 * @param string, number params
 */
function insertIssue (redmine, params) {
  return new Promise(function (resolve, reject) {
    redmine.create_issue(params, function(err, data) {
      if (!err) {
        console.log('insert issue success', data)
        resolve(data)
      } else {
        console.log('insert issue error', err)
        reject(err)
      }
    });
  })
}

/**
 * query issue 
 * parameters : offset, limit, sort,include
 * Optional filters :issue_id, project_id, subproject_id,t racker_id,status_id,
 *                   assigned_to_id, parent_id, cf_x
 * ex:
 * {
 *   "offset": 0,
 *   "limit": 100,
 *   "project_id": 136
 * }
 * @param {*} query
 */
function queryIssue (redmine, params) {
  return new Promise(function (resolve, reject) {
    redmine.issues(params, function(err, data) {
      if (!err) {
        if(data){
          console.log('query Doc success : ' + JSON.stringify(data.issues.length));
        }
        resolve(data)
      } else {
        console.log('queryIssue error', err)
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
function removeIssue (redmine, issue_id) {
  return new Promise(function (resolve, reject) {
    redmine.delete_issue(issue_id, function(err) {
      if (!err) {
        console.log('removeDoc success')
        resolve('ok')
      } else {
        console.log('removeDoc error', err)
        reject(err)
      }
    })
  })
 }
  
 function updateIssue (redmine, issue_id,issue) {
  return new Promise(function (resolve, reject) {
    redmine.update_issue(issue_id,issue, function(err,data) {
      if (!err) {
        console.log('update issue success')
        resolve('ok')
      } else {
        console.log('update issue error', err)
        reject(err)
      }
    });
  })
}

function queryIssueById (redmine,issue_id, params) {
  return new Promise(function (resolve, reject) {
    redmine.get_issue_by_id(issue_id, params, function(err,data) {
      if (!err) {
          console.log('Query issue by id success')
          resolve(data)
      } else {
          console.log('Query issue by id error ' + err)
          reject(err)
      }
    });
  })
}

/**
 * query issue 
 * parameters : offset, limit, sort,include
 * Optional filters :issue_id, project_id, subproject_id,t racker_id,status_id,
 *                   assigned_to_id, parent_id, cf_x
 * ex:
 * {
 *   "offset": 0,
 *   "limit": 100,
 *   "project_id": 136
 * }
 * @param {*} query
 */
function queryCustomFields (redmine, params) {
  return new Promise(function (resolve, reject) {
    redmine.custom_fields(function(err, data) {
      if (!err) {
        if(data){
          console.log('query custom fields success : ' + JSON.stringify(data.custom_fields.length));
        }
        resolve(data)
      } else {
        console.log('query custom fields error', err)
        reject(err)
      }
    });
  })
}

function queryTrackers (redmine) {
  return new Promise(function (resolve, reject) {
    redmine.trackers(function(err, data) {
      if (!err) {
        if(data){
          console.log('query trackers success : ' + JSON.stringify(data.trackers.length));
        }
        resolve(data)
      } else {
        console.log('query trackers error', err)
        reject(err)
      }
    });
  })
}

function queryRoles (redmine) {
  return new Promise(function (resolve, reject) {
    redmine.roles(function(err, data) {
      if (!err) {
        if(data){
          console.log('query roles success : ' + JSON.stringify(data.roles.length));
        }
        resolve(data)
      } else {
        console.log('query roles error', err)
        reject(err)
      }
    });
  })
}

module.exports = {
  initByUser,
  initByApiKey,
  insertIssue,
  removeIssue,
  updateIssue,
  queryIssue,
  queryIssueById,
  queryCustomFields,
  queryTrackers,
  queryRoles
}
