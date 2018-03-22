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


/**
 * Create project in redmine database.
 * ex:
 * {
 *  "project": {
 *    "name": 'test_project',
 *    "identifier": "test_project",
 *    "enabled_module_names": ['boards', 'calendar', 'documents', 'files', 'gantt', 
 *                                     'issue_tracking', 'news', 'repository', 'time_tracking', 'wiki'],
 *    "tracker_ids": ['1', '2', '3', '5', ''],
 *    "parent_id": 4
 *   }
 * }
 * @param {*} project name,identifier,parent_id
 * @param string,string,number
 */
function insertProject (redmine, params) {
  return new Promise(function (resolve, reject) {
    redmine.create_project(params, function(err, data) {
      if (!err) {
        console.log('Insert project success', data)
        resolve(data)
      } else {
        console.log('Insert project error', err)
        reject(err)
      }
    });
  })
}

/**
 * query project 
 * parameters : offset, limit, sort,include
 * Optional filters :status, name [login, firstname, lastname and mail], group_id
 * ex:
 * {
 *   "offset": 0,
 *   "limit": 100,
 *   "include": "tracker"
 * }
 * @param {*} query
 */
function queryProject (redmine, params) {
  return new Promise(function (resolve, reject) {
    redmine.projects(params, function(err, data) {
      if (!err) {
        if(data){
          console.log('Query project success : ' + data.projects.length);
        }
        resolve(data)
      } else {
        console.log('Query project error', err)
        reject(err)
      }
    });
  })
}

/**
* Removes project by id from redmine database.
* ex: project_id = 4424;
* 
* @param {*} project_id
*/
function removeProject (redmine, project_id) {
  return new Promise(function (resolve, reject) {
    redmine.delete_project(project_id, function(err) {
      if (!err) { 
        console.log('Delete project success')
        resolve('Delete project success')
      } else {
        console.log('Delete project error', err)
        reject(err)
      }
    })
  })
 }

/**
* Update project by id from redmine database.
* ex: project_id = 4424;
* 
* @param {*} project_id
*/
function updateProject (redmine, project_id, params) {
  return new Promise(function (resolve, reject) {
    redmine.update_project(project_id, params, function(err,data) {
      if (!err) {
        console.log('Update poject success')
        resolve('Update project success')
      } else {
        console.log('Update poject error', err)
        reject(err)
      }
    });
  })
}

function queryProjectById (redmine, poject_id, params) {
    return new Promise(function (resolve, reject) {
        redmine.get_project_by_id(poject_id, params, function(err,data) {
        if (!err) {
            console.log('Query project by id success')
            resolve(data)
        } else {
            console.log('Query project by id error ' + err)
            reject(err)
        }
        });
    })
}

module.exports = {
    initByUser,
    initByApiKey,
    insertProject,
    removeProject,
    updateProject,
    queryProject,
    queryProjectById
}