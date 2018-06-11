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

function insertProjectMembership (redmine, id, params) {
  return new Promise(function (resolve, reject) {
    redmine.create_project_membership(id, params, function(err, data) {
        if (!err) {
            console.log('Insert membership success', data)
            resolve(data)
        } else {
            console.log('Insert membership error', err)
            reject(err)
        }
    });
  })
}

/**
* Removes membership by id of project from redmine database.
* ex: project_id = 4424;
* 
* @param {*} project_id
* @param string params
*/
function removeProjectMembership (redmine, membership_id) {
  return new Promise(function (resolve, reject) {
    redmine.delete_project_membership(membership_id, function(err) {
        if (!err) { 
            console.log('Delete membership success')
            resolve('Delete membership success')
        } else {
            console.log('Delete membership error', err)
            reject(err)
        }
    })
  })
 }

/**
* Update membership by id of project from redmine database.
* ex: project_id = 4424;
* 
* @param {*} project_id, params
* @param string, object params
*/
function updateProjectMembership (redmine, membership_id, params) {
  return new Promise(function (resolve, reject) {
    redmine.update_project_membership(membership_id, params, function(err,data) {
        if (!err) {
            console.log('Update membership success')
            resolve('Update membership success')
        } else {
            console.log('Update membership error', err)
            reject(err)
        }
    });
  })
}

/**
* Query membership by id of project from redmine database.
* ex: project_id = 4424;
* 
* @param {*} project_id
* @param string params
*/
function queryProjectMembership (redmine, project_id, params) {
    return new Promise(function (resolve, reject) {
        redmine.membership_by_project_id(project_id, params, function(err,data) {
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
    insertProjectMembership,
    removeProjectMembership,
    updateProjectMembership,
    queryProjectMembership
}