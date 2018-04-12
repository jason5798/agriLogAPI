var request = require('request')
var configs =  require('../configs.js');
var path = require('path');
var fs = require('fs');
///////////////////////////////////////////////////////////////
var url = configs.redmine_server + '/uploads.json';
var opt = {
    url: url,
    method: "POST",
    headers: {
        'Content-Type': 'application/octet-stream'
    }
};

function initByUser (user_name,user_pwd) {
    var auth = "Basic " + new Buffer(user_name+ ":" + user_pwd).toString("base64");
    opt.headers['Authorization'] = auth;
  }
  
function initByApiKey (api_key) {
    opt.headers['X-Redmine-API-Key'] = api_key;
  }
    
function uploadFile(stream, callback) {
    opt.body = stream;
    request(opt, function (error, response, body){
        if(error) {
            callback(error, null);
        }
        console.log(body);
        if (body==='') {
            callback(response,null);
        } else {
            callback(null,body);
        }
    });
}

module.exports = {
    initByUser,
    initByApiKey,
    uploadFile
}