const http = require("http")
const url = require("url")
const queryString = require("querystring")
const path = require('path');


//chaincode
const chaincode = require('./chaincode');
chaincode.enrollAdmin() 

//ipfs
const ipfs = require('./ipfsApi')
const fs = require('fs');

//upload
const bufferSplit = require('./bufferSplit')

//sgx


const server = http.createServer((req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    let methods = req.method;
    console.log("当前的访问方式是:"+ methods);
    if(methods == "GET"){
        let params = url.parse(req.url,true,true);
        console.log(params) 
        res.setHeader("content-type","text/html;charset=UTF-8")
        res.end("chaincode excuting! ")
		
		//GET    
		//http://127.0.0.1:3000/chaincode?Event=invoke&Func=addUser&Args=lihan,common  
		//http://127.0.0.1:3000/chaincode?Event=query&Func=queryFileByHash&Args=Qmb64o6w185r37cmyjhhSPyKTi7e968o3oLpfHjPN6qiZs
		//http://127.0.0.1:3000/ipfs?Func=add&Args=query.js
		//http://127.0.0.1:3000/ipfs?Func=download&Args=QmZe4TygdtxaXpwJHAamiYsfVnhTGLQSevHPfbv5KNhNG6
		try {
			if(params.pathname.includes('/chaincode')){
				var event = params.query.Event;
				var func = params.query.Func;
				var args = params.query.Args.split(',');
				if(event == 'invoke')
					chaincode.invoke(func, ...args);
				else if(event == 'query')
					chaincode.query(func, ...args);
			}else if(params.pathname.includes('ipfs')){
				var func = params.query.Func;
				if(func == 'add'){
					
					let addPath = params.query.Args;
					var filename = path.posix.basename(addPath);
					
					let buff = fs.readFileSync(addPath);
					ipfs.add(buff).then((hash)=>{
						console.log(hash);
						//哈希上链
					    chaincode.invoke("addFile", hash, filename, "wuliangshun");
					}).catch((err)=>{
						console.log(err);
					})
					
				}else if(func == 'download'){
					//获取文件
					let hash = params.query.Args;
					let getPath = "./invoke3.js";
					ipfs.get(hash).then((buff)=>{
						fs.writeFileSync(getPath, buff);
						console.log("file:"+getPath);
					}).catch((err)=>{
						console.log(err);
					})
				}
			}
		} catch (error) {
			console.error(`error: ${error}`);
		}
    }else if(methods == "POST"){
       	  //upload file
		  const boundary = `--${req.headers['content-type'].split('; ')[1].split('=')[1]}`  // 获取分隔符
		  let arr = []

		  req.on('data', (buffer) => {
			arr.push(buffer)
		  })

		  req.on('end', () => {
			const buffer = Buffer.concat(arr)
			console.log(buffer.toString())

			// 1. 用<分隔符>切分数据
			let result = bufferSplit(buffer, boundary)
			console.log(result.map(item => item.toString()))

			// 2. 删除数组头尾数据
			result.pop()
			result.shift()
			console.log(result.map(item => item.toString()))

			// 3. 将每一项数据头尾的的\r\n删除
			result = result.map(item => item.slice(2, item.length - 2))
			console.log(result.map(item => item.toString()))

			// 4. 将每一项数据中间的\r\n\r\n删除，得到最终结果
			result.forEach(item => {
			  console.log(bufferSplit(item, '\r\n\r\n').map(item => item.toString()))

			  let [info, data] = bufferSplit(item, '\r\n\r\n')  // 数据中含有文件信息，保持为Buffer类型

			  info = info.toString()  // info为字段信息，这是字符串类型数据，直接转换成字符串，若为文件信息，则数据中含有一个回车符\r\n，可以据此判断数据为文件还是为普通数据。

			  if (info.indexOf('\r\n') >= 0) {  // 若为文件信息，则将Buffer转为文件保存
				// 获取字段名
				let infoResult = info.split('\r\n')[1].split('; ')
				console.log(infoResult)
				let name = infoResult[1].split('=')[1]
				name = name.substring(1, name.length - 1)

				// 获取文件名
				let filename = infoResult[2].split('=')[1]
				filename = filename.substring(1, filename.length - 1)
				console.log(name)
				console.log(filename)

				// 将文件存储到服务器
				fs.writeFile(`./upload/${filename}`, data, err => {
				  if (err) {
					console.log(err)
				  } else {
					console.log('文件上传成功')
					
					// sgx
					
					
					//chaincode: addUser
					chaincode.invoke("addUser", name, 'common');
					  
					//IPFS
					let buff = fs.readFileSync('./upload/'+filename);
					ipfs.add(buff).then((hash)=>{
						console.log(hash);
						
						//chaincode: 哈希上链
					    chaincode.invoke("addFile", hash, filename, name);
					}).catch((err)=>{
						console.log(err);
					})
					
				  }
				})
			  } else {  // 若为数据，则直接获取字段名称和值
				let name = info.split('; ')[1].split('=')[1]
				name = name.substring(1, name.length - 1)
				const value = data.toString()
				console.log(name, value)
			  }
			})
		  })
		
		
		
		
		
    }

})



server.listen(3000,()=>{
    console.log("server is ready on port 3000")
})