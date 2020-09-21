/*

Local Web Server

*/

const http = require("http")
const url = require("url")
const queryString = require("querystring")
const path = require('path');
var fs = require('fs');

var port = 8000;

const server = http.createServer((req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    let methods = req.method;
    console.log("当前的访问方式是:"+ methods);
    if(methods == "GET"){
		try{
			let params = url.parse(req.url,true,true);
			console.log(params) 
			
			var fileName="./Html/index.html";
    		fs.readFile(fileName,function(err,data){
        		if(err)
            		console.log("对不起，您所访问的路径出错");
        		else{
            	res.write(data);
        		}
			})
		
		
		} catch (error) {
			console.error(`error: ${error}`);
		}
    }else if(methods == "POST"){
       	 
    }
	
	
	

})



server.listen(port,()=>{
    console.log("server is ready on port " + port);
})