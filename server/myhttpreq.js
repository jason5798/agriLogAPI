var request = require('request')
///////////////////////////////////////////////////////////////
var opt = {
    url: '',
    method: "DELETE",
    headers: {
        'Content-Type': 'x-www-form-urlencoded'
    }
};
function initByUser (user_name,user_pwd) {
    var auth = "Basic " + new Buffer(user_name+ ":" + user_pwd).toString("base64");
    opt.headers['Authorization'] = auth;
  }
  
function initByApiKey (api_key) {
    opt.headers['X-Redmine-API-Key'] = api_key;
  }

function deleteFile(newUrl,callback) {
    opt.url = newUrl;

    request(opt, function (error, response, body){
        if(error) {
            callback(error, null);
        }
        console.log(response);
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
    deleteFile
}