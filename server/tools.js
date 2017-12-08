var fs = require('fs');

function validateValue (json) {
  var keys = Object.keys(json);
  var result = 'ok';
  if (keys.length === 0) {
    return result;
  }
  for (let key in keys) {
    let value = json[keys[key]];
    if (value === null || value === undefined || value === '') {
      result = 'Missing parameter : '+ keys[key];
      break;
    }
    if(keys[key] === 'mail') {
      if (!validateEmail(value)) {
        result = 'Mail parameter format error';
      }
    }
  }
  return result;
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
  }
  
  // function to create file from base64 encoded string
  function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
  }

module.exports = {
    validateValue,
    validateEmail,
    base64_encode,
    base64_decode
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}