var request = require('request');
var fs = require('fs');
var pegjs = require('pegjs');

//load
module.exports = function (single, all) {
  var i, n;
  
  var flag = 0;

  var flagcb = function () {
    if (flag < 1) {
      all();
    }
  };

  var makeParU = function (url, name) {
    name = name || url.split("/")[3]
    flag += 1;
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var scheem = pegjs.buildParser(body); 

        var par = function (str, start) {
          try {
            return scheem.parse(str, start);
          } catch (e) {
            return undefined;
          }
        };
        //console.log(name, "loaded");
        single(par, name);
      } else {
        console.log("Error in fetching", url, error);
      }
      flag -= 1;
      flagcb();
    });
  };

  var urls = fs.readFileSync("repos.txt", "utf8").split("\n");
  var u;
  n = urls.length;
  for (i = 0; i < n; i += 1){
    u = urls[i].trim();
    if (!u || u[0] === "!") {
      continue;
    }
    console.log(u)
    makeParU(u);
  }
  
  
};
