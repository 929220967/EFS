# EFS

本项目基于fabric1.4+IPFS+Intel SGX，进行创新设计，提供一种保护客户隐私的、可审 计的区块链文件存储系统（简称为：EFS）。

## 目录结构

```
.
├── Chaincode
│   ├── zallDisk
│   └── zallDisk.go
├── client
│   ├── Html
│   │   ├── background.jpg
│   │   ├── css
│   │   │   ├── bootstrap.css
│   │   │   ├── bootstrap.css.map
│   │   │   ├── bootstrap-grid.css
│   │   │   ├── bootstrap-grid.css.map
│   │   │   ├── bootstrap-grid.min.css
│   │   │   ├── bootstrap-grid.min.css.map
│   │   │   ├── bootstrap.min.css
│   │   │   ├── bootstrap.min.css.map
│   │   │   ├── bootstrap-reboot.css
│   │   │   ├── bootstrap-reboot.css.map
│   │   │   ├── bootstrap-reboot.min.css
│   │   │   └── bootstrap-reboot.min.css.map
│   │   ├── index.html
│   │   └── js
│   │       ├── bootstrap.bundle.js
│   │       ├── bootstrap.bundle.js.map
│   │       ├── bootstrap.bundle.min.js
│   │       ├── bootstrap.bundle.min.js.map
│   │       ├── bootstrap.js
│   │       ├── bootstrap.js.map
│   │       ├── bootstrap.min.js
│   │       └── bootstrap.min.js.map
│   ├── httpclient.js
│   ├── LocalWebServer.js
│   ├── package-lock.json
│   └── sgx_protect_file
├── README.md
├── server
│   ├── bufferSplit.js
│   ├── chaincode.js
│   ├── httpserver.js
│   ├── ipfsApi.js
│   ├── package.json
│   ├── package-lock.json
│   ├── sgx_protect_file
│   ├── upload
│   │   ├── demo.txt
│   │   └── encrypted_example.txt
│   └── wallet
│       └── admin
│           ├── 50903b380f64b25831d5d82978cabf58b6baf741102d62fef9f85d650b099c0b-priv
│           ├── 50903b380f64b25831d5d82978cabf58b6baf741102d62fef9f85d650b099c0b-pub
│           └── admin
├── startFabric.sh
└── stopFabric.sh
```

## 运行项目

## 服务端

### 1. 复制zallDiskSDK文件夹到fabric-samples目录

`$ sudo cp -r zallDiskSdk/ $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/`

`$ cd $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/`

### 2. 复制Chaincode的zallDisk文件夹到fabric-samples/Chaincode目录

`$ sudo cp -r zallDiskSdk/Chaincode/zallDisk $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/Chaincode`

### 3. 启动fabric网络

`$ cd /GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/`

`$ sudo ./startFabric.sh`

### 4. 启动IPFS

`$ ipfs daemon`

### 5. 设置sgx环境变量

`$ source /opt/intel/sgxsdk/environment` 

### 6. 启动httpserver.js

`$ cd ./server`

`$ npm install`

`$ sudo node httpserver.js`

- 请求处理过程：

    - 接收加密文件，存储到./server/upload文件夹

    - 启动Enclave，解密文件，并执行审计规则。

       - 审计通过，会返回"Pass Audit"消息给客户端
   
       - 审计未通过，会返回“Fail Audit”消息给客户端。
   
    - 调用ipfsApi.js，add文件到IPFS网络，生成hash。

    - 调用chaincode.js，调用链码。

       - 如果用户存在，则上链：hash, filename, 用户名
   
       - 如果用户不存在，先创建用户上链：用户名，再上链：hash, filename, 用户名 *
   
### 8.SGX执行解密和审计

`$ cd sgx_protected_file/`

`$ sudo make`

`$ sudo ./app decrypt -i encrypted_example.txt -u wuliangshun`


## 客户端

### 1. 运行web server

`$ cd client/`

`$ npm install`

`$ sudo node LocalWebServer.js`

### 2. 进入操作界面

浏览器输入http://127.0.0.1:8080

### 3. 执行操作

注意：前端与后端的交互尚未完成。可手动继续4-6，完成文件加密和上传

### 4. 设置sgx环境变量

`$ source /opt/intel/sgxsdk/environment` 

### 5.执行文件加密

`$ cd client/sgx-protected-file`

`$ sudo make`

`$ sudo ./app encrypt -i example.txt -u wuliangshun`

### 6.上传文件

`$ cd ..`

`$ sudo node httpclient.js ../sgx-protected-file/encrypted_example.txt`





# 附：依赖环境安装
## IPFS
### 一.ipfs安装
#### 1.下载go-ipfs 

https://dist.ipfs.io/#go-ipfs(需要翻墙)

如果网络没翻墙去github下载 地址https://github.com/ipfs/go-ipfs/releases

#### 2.获取安装包之后

`$ sudo tar xvfz go-ipfs.tar.gz`

`$ cd go-ipfs`

`$ sudo ./install.sh` 
 
`$ sudo ipfs init`  

会生成提示，界面有一串哈希地址，通过 

`$ sudo ipfs cat $(FILE_HASH)` 

出现界面安装成功。


### 二.创建秘钥

#### 1.下载秘钥工具

`$ sudo git clone https://github.com/Kubuxu/go-ipfs-swarm-key-gen.git`

（也可以通过go get 安装，但是go get经常失败）

`$ sudo go get -u github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen`

#### 2.编译

`$ sudo go build -o ipfs-swarm-key-gen go-ipfs-swarm-key-gen/ipfs-swarm-key-gen/main.go`

#### 3. 生成秘钥

`$ sudo ./ipfs-swarm-key-gen > swarm.key`  

源码就是随机生成一个32位的随机数，然后用 hex.Encode 成一个 64 位 16进制数

#### 4.复制秘钥

将生成的秘钥复制到多主机的.ipfs（ipfs的）本地目录。

### 三.配置共享网络，假设两台主机

#### 1.删除ipfs默认的网关节点

`$ ipfs bootstrap rm all`
  
#### 2.修改第一台主机的./ipfs的ip地址

  ```
  "Addresses": {
  
    "Swarm": [
    
      "/ip4/0.0.0.0/tcp/4001",   //0.0.0.0需要修改为当前主机的ip，通用192.168.1.11
      
      "/ip6/::/tcp/4001"
      
    ],
    
    "Announce": [],
    
    "NoAnnounce": [],
    
    "API": "/ip4/127.0.0.1/tcp/5001",        //127.0.0.1需要修改为当前主机的ip，通用192.168.1.11
    
    "Gateway": "/ip4/127.0.0.1/tcp/8080" //127.0.0.1需要修改为当前主机的ip，通用192.168.1.11
    
  },
  ```
  
#### 3.查看第一台主机ipfs节点的ID值。

`$ ipfs id`

#### 4.启动第一台ipfs的网络

`$ ipfs daemon`

#### 5.添加第一台节点的地址到另一台节点的bootstrap列表中。

`$ ipfs bootstrap add /ip4/被添加节点的ip地址/tcp/4001/ipfs/被添加节点的ID值`

#### 6.可以查看ipfs网络已经加入的节点。

`$ ipfs  swarm peers`

### 四.测试

#### 1.第一台机器执行该命令会返回文件哈希，保存下来

`$ ipfs add $(FILE_PATH)`


#### 2.第二台机器  在当前目录生成该文件,可以查看文件内容

`$ ipfs get $(FILE_HASH)` 

`$ ipfs cat $(FILE_HASH)`


### 五. （有一个配套的ipfs界面）

 安装运行WebUI：
 
`$ git clone https://github.com/ipfs/webui`
        
`$ cd webui`
        
`$ npm install`
        
 Runs server on port 3000.
    
`$ npm start`
        
### 六. 访问WebUI：

http://localhost:3000





## fabric1.4 （centos）

### 一. 安装golang：

#### 1.官网下载golang包

#### 2.解压到 /usr/local 

`$ tar -C /usr/local -zxf go1.12.7.linux-amd64.tar.gz` 

#### 3.编辑环境变量

`$ vim /etc/profile`

末端插入：

```

export PATH=$PATH:/usr/local/go/bin    //goroot可执行文件路径

export GOROOT=/usr/local/go       //goroot路径，安装路径

export GOPATH=$HOME/go           //go项目启动路径

export PATH=$PATH:$HOME/go/bin  //gopath可执行文件路径

```

`$ source /etc/profile` 

`$ go version`


### 二.docker安装

#### 1.安装必要的工具

`$ yum install -y yum-utils device-mapper-persistent-data lvm2`

#### 2.通过工具增加docker源

`$ yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`

#### 3.安装

`$ yum install docker-ce`

#### 4.启动

`$ systemctl start docker`

`$ systemctl enable docker`

#### 5.是否成功

`$ docker version`

#### 6.把用户加入docker组，非root用户下运行docker，不需要执行sudo

`$ sudo groupadd docker`

`$ sudo usermod -aG docker $USER`

#### 7.重启docker服务

`$ sudo service docker restart`


### 三.配置docker-compose

#### 1.输入命令行 

`$ sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

（没安装curl，输入命令行yum install -y curl安装）

#### 2.切换到安装包的界面

`$ cd /usr/local/bin/`

会有一个docker-compose的文件，可以输入ls查看。

#### 3.给该文件增加权限

`$ sudo chmod +x docker-compose`

#### 4. 查看是否有输出对应版本。

`$ docker-compose version`

### 四.下载Fabric源码

#### 1.创建文件夹 

`$ mkdir -p go/src/github.com/hyperledger/`

#### 2.进入 

`$ cd go/src/github.com/hyperledger/`

#### 3.clone

`$ git clone "https://github.com/hyperledger/fabric.git"`

#### 4.cd

`$ cd fabric/`

#### 5. 切换版本

`$ git checkout release-1.4`     

#### 6.cd scripts/

这一步会下载官方的例子以及所需要的Docker镜像,下载是比较慢的，如果出现错误或者长时间没有速度只需要重新运行就可以了

`$ sudo ./bootstrap.sh`          

此处说明，跟网络关系很大，二进制文件如果下载失败，去github上下载对应版本，源网址网站我今年尝试已经关闭了。如果上一步操作下载二进制文件太慢或者没速度，可以直接对源码进行编译,执行以下命令(前提是以上相关路径配置没有错误)：如果失败，去github上下载对应二进制文件放到此文件夹下，要不然网络无法启动，因为缺少configtxgen  configtxlator  cryptogen  这些工具. 如果文件夹内有如下文件的话说明编译成功:configtxgen  configtxlator  cryptogen  discover  idemixgen  orderer  peer


`$ cd ~/go/src/github.com/hyperledger/fabric/`

`$ make release`     

`$ cd release/linux-amd64/bin`     


##### 环境变量生效

`$ vim ~/.profile`

##### 文件中最后添加以下内容

`$ export PATH=$PATH:$GOPATH/src/github.com/hyperledger/fabric/release/linux-amd64/bin`

##### 更新一下
`$ source ~/.profile`


##### 进入first-network文件夹

`$ cd ~/go/src/github.com/hyperledger/fabric/scripts/fabric-samples/first-network/`

##### 执行命令

 `$ ./byfn.sh up`     
 
 --大概率失败，如果是干净容器第一次部署的机器成功很大，fabric受镜像版本影响很大，如果出错查看弹窗说明，百度搜索或者stackoverflow去搜索。
 

##### 最后执行以下命令关闭网络

`$ ./byfn.sh down`   

如果要开始其他网络必须执行此步，要不然环境不干净。


## SGX (Ubuntu 16.04)

#### 1. 下载SDK源码

`$ git clone https://github.com/occlum/linux-sgx.git`

#### 2. 安装依赖 (SDK)

`$ sudo apt-get install build-essential ocaml automake autoconf libtool wget python libssl-dev`

#### 3. 安装依赖 (PSW)

`$ sudo apt-get install libssl-dev libcurl4-openssl-dev protobuf-compiler libprotobuf-dev debhelper cmake`

#### 4. 下载二进制文件

`$ ./download_prebuilt.sh`

#### 5. 编译SDK

`$ make sdk`

#### 6. 编译PSW（需开启硬件支持，SIM模式不需要）

`$ make psw`

#### 7. 测试是否成功

```
  $ cd SampleCode/LocalAttestation
  $ make SGX_MODE=SIM
  $ ./app
```

## 安装nodejs库

#### 切换到服务器目录

`$ cd server`

#### 安装依赖

`$ npm install node-gyp`

`$ npm install node-pre-gyp`

`$ npm install grpc`

#### 安装express框架

`$ npm install express -save`

#### 安装ipfs-api

`$ npm install ipfs-api`

#### 安装fabric-nodejs-sdk

`$ sudo npm install --registry=https://registry.npm.taobao.org --unsafe-perm=true --allow-root`




