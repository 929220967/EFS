var http = require('http');
var path = require('path');
var fs = require('fs');

function postFile(fileKeyValue, req) {
  var boundaryKey = Math.random().toString(16);
  var enddata = '\r\n----' + boundaryKey + '--';
 
  var files = new Array();
  for (var i = 0; i < fileKeyValue.length; i++) {
   var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].urlKey + "\"; filename=\"" + path.basename(fileKeyValue[i].urlValue) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
   var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
   files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlValue});
  }
  var contentLength = 0;
  for (var i = 0; i < files.length; i++) {
   var stat = fs.statSync(files[i].filePath);
   contentLength += files[i].contentBinary.length;
   contentLength += stat.size;
  }
 
  req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
  req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));
 
  // 将参数发出
  var fileindex = 0;
  var doOneFile = function(){
   req.write(files[fileindex].contentBinary);
   var fileStream = fs.createReadStream(files[fileindex].filePath, {bufferSize : 4 * 1024});
   fileStream.pipe(req, {end: false});
   fileStream.on('end', function() {
     fileindex++;
     if(fileindex == files.length){
      req.end(enddata);
     } else {
      doOneFile();
     }
   });
  };
  if(fileindex == files.length){
    req.end(enddata);
  } else {
    doOneFile();
  }      
}
 
// GET
//http://127.0.0.1:3000/chaincode?Event=invoke&Func=addUser&Args=lihan,common  
//http://127.0.0.1:3000/chaincode?Event=query&Func=queryFileByHash&Args=Qmb64o6w185r37cmyjhhSPyKTi7e968o3oLpfHjPN6qiZs
//http://127.0.0.1:3000/ipfs?Func=upload&Args=query.js
//http://127.0.0.1:3000/ipfs?Func=upload&Args=demo.txt
var optionsGet = {
   host: '127.0.0.1',
   port: '3000',
   path: '/ipfs?Func=upload&Args=demo.txt'
};

//POST
var files = [
 {urlKey: "wuliangshun", urlValue: "sgx_protect_file/encrypted_example.txt"}
]
var optionsPost = { 
 host: "127.0.0.1", 
 port: "3000" , 
 method: "POST", 
 path: "/Upload"
}

var arguments = process.argv.splice(2);
console.log('所传递的参数是：', arguments);

//////////////////////////
// print process.argv
//process.argv.forEach(function (val, index, array) {
 // console.log(index + ': ' + val);
//});
files[0]["urlValue"] = arguments[0]
console.log(files[0]["urlValue"])

 
var req = http.request(optionsPost, function(res){
 console.log("RES:" + res);
 console.log('STATUS: ' + res.statusCode);
 console.log('HEADERS: ' + JSON.stringify(res.headers));
 //res.setEncoding("utf8");
 res.on("data", function(chunk){
  console.log("BODY:" + chunk);
 })
})
 
req.on('error', function(e){
 console.log('problem with request:' + e.message);
 console.log(e);
})
postFile(files, req);
console.log("done");
