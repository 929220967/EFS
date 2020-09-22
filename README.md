# EFS

# 运行项目

## 服务端

### 1. 复制zallDiskSDK文件夹到fabric-samples目录

`sudo cp -r zallDiskSdk/ $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/`

cd $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/

### 2. 复制Chaincode的zallDisk文件夹到fabric-samples/Chaincode目录

sudo cp -r zallDiskSdk/Chaincode/zallDisk $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/Chaincode

###3. 启动fabric网络

cd /GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/zallDiskSDK/

./startFabric.sh

### 4. 启动IPFS

ipfs daemon

### 5. 设置sgx环境变量

source /opt/intel/sgxsdk/environment 

### 6. 启动httpserver.js

cd ./server

node httpserver.js

请求处理过程：

1)接收加密文件，存储到./server/upload文件夹

2)启动Enclave，解密文件，并执行审计规则。

   a) 审计通过，会返回"Pass Audit"消息给客户端，执行步骤3)；
   
   b) 审计未通过，会返回“Fail Audit”消息给客户端。
   
3)调用ipfsApi.js，add文件到IPFS网络，生成hash。

4)调用chaincode.js，调用链码。

   a) 如果用户存在，则上链：hash, filename, 用户名
   
   b) 如果用户不存在，先创建用户上链：用户名，再上链：hash, filename, 用户名
   
### 8.SGX执行解密和审计

cd sgx_protected_file/

make

./app decrypt -i encrypted_example.txt -u wuliangshun







#附：依赖环境安装
一.ipfs安装
1.下载go-ipfs : https://dist.ipfs.io/#go-ipfs(需要翻墙)

如果网络没翻墙去github下载 地址https://github.com/ipfs/go-ipfs/releases

2.获取安装包之后

解压 tar xvfz go-ipfs.tar.gz

切换到cd go-ipfs

 ./install.sh 执行该脚本会自动安装成功
 
3.执行ipfs init  会生成提示，界面有一串哈希地址，通过 ipfs cat 该哈希地址出现界面安装成功。


二创建秘钥（私人网络共享时需要，由于只有一台主机，只能单机测试）

1.下载秘钥工具（也可以通过go get 安装，go get -u github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen，但是go get经常失败）

git clone https://github.com/Kubuxu/go-ipfs-swarm-key-gen.git

2.编译该工具 生成执行文件

go build -o ipfs-swarm-key-gen go-ipfs-swarm-key-gen/ipfs-swarm-key-gen/main.go

3. 执行该可执行文件生成秘钥--源码就是随机生成一个32位的随机数，然后用 hex.Encode 成一个 64 位 16进制数

./ipfs-swarm-key-gen > swarm.key  

4.将生成的秘钥复制到多主机的.ipfs（ipfs的）本地目录。


三.配置共享网络，假设两台主机

1.删除ipfs默认的网关节点

  ipfs bootstrap rm all
  
2.修改第一台主机的./ipfs的ip地址

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
  
3.执行ipfs id查看第一台主机ipfs节点的ID值。

4.ipfs daemon 启动第一台ipfs的网络

5.添加第一台节点的地址到另一台节点的bootstrap列表中。

ipfs bootstrap add /ip4/被添加节点的ip地址/tcp/4001/ipfs/被添加节点的ID值

6.  ipfs  swarm peers 可以查看ipfs网络已经加入的节点。


四 测试

1.第一台机器  ipfs add 上传的文件

执行该命令会返回文件哈希，保存下来

2.第二台机器 ipfs get 第一台机器的文件哈希

在当前目录生成该文件，执行ipfs cat 文件哈希可以查看文件内容。


五 （有一个配套的ipfs界面）

 安装运行WebUI：
 
        > git clone https://github.com/ipfs/webui
        
        > cd webui
        
        > npm install
        
    # Runs server on port 3000.
    
        > npm start
        
六 访问WebUI：

        http://localhost:3000





fabric1.4搭建（centos）

1. 安装golang：

1.官网下载golang包，将包上传到linux服务器

2.解压到 /usr/local 

tar -C /usr/local -zxf go1.12.7.linux-amd64.tar.gz 

3.编辑环境变量

vim /etc/profile

末端插入：

#go

export PATH=$PATH:/usr/local/go/bin    //goroot可执行文件路径

export GOROOT=/usr/local/go       //goroot路径，安装路径

export GOPATH=$HOME/go           //go项目启动路径

export PATH=$PATH:$HOME/go/bin  //gopath可执行文件路径


vim编辑器输入：wq保存，source /etc/profile，

source /etc/profile生效，通过go version查看是否成功



2.docker安装



1.安装必要的工具
yum install -y yum-utils device-mapper-persistent-data lvm2

2.通过工具增加docker源

yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

3.安装

yum install docker-ce

4.启动

systemctl start docker

systemctl enable docker

5.docker version是否成功

6.把用户加入docker组，非root用户下运行docker，不需要执行sudo

# step 1: 创建docker用户组

sudo groupadd docker

# step 2:将当前用户添加到docker用户组

sudo usermod -aG docker $USER

7.重启docker服务 sudo service docker restart


3.配置docker-compose

1.输入命令行 sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose（没安装
curl，输入命令行yum install -y curl安装）

2.输入命令行cd /usr/local/bin/切换到安装包的界面

会有一个docker-compose的文件，可以输入ls查看。

3.命令行sudo chmod +x docker-compose给该文件增加权限

4.命令行 docker-compose version 查看是否有输出对应版本。


4.下载Fabric源码

1.创建文件夹 mkdir -p go/src/github.com/hyperledger/

2.进入 cd go/src/github.com/hyperledger/

3.git clone "https://github.com/hyperledger/fabric.git"

4.cd fabric/

5.git checkout release-1.4     

6.cd scripts/

#这一步会下载官方的例子以及所需要的Docker镜像

#下载是比较慢的，如果出现错误或者长时间没有速度只需要重新运行就可以了

sudo ./bootstrap.sh          //此处说明，跟网络关系很大，二进制文件如果下载失败，去github上下载对应版本，源网址网站我今年尝试已经关闭了。


如果上一步操作下载二进制文件太慢或者没速度，可以直接对源码进行编译,执行以下命令(前提是以上相关路径配置没有错误)：

#首先进入fabric文件夹

cd ~/go/src/github.com/hyperledger/fabric/

#编译源码

make release     --这一步看运气

#查看生成的文件

cd release/linux-amd64/bin     --如果失败，去github上下载对应二进制文件放到此文件夹下，要不然网络无法启动，因为缺少configtxgen  configtxlator  cryptogen  这些工具
#如果文件夹内有如下文件的话说明编译成功

#configtxgen  configtxlator  cryptogen  discover  idemixgen  orderer  peer

环境变量生效--1.4版本的例子这样写的，实际上我操作不需要，环境变量我一般添加在/etc/propfile

vim ~/.profile

#文件中最后添加以下内容

export PATH=$PATH:$GOPATH/src/github.com/hyperledger/fabric/release/linux-amd64/bin

#更新一下
source ~/.profile


#进入first-network文件夹

cd ~/go/src/github.com/hyperledger/fabric/scripts/fabric-samples/first-network/

#执行命令

 ./byfn.sh up     --大概率失败，如果是干净容器第一次部署的机器成功很大，fabric受镜像版本影响很大，如果出错查看弹窗说明，百度搜索或者stackoverflow去搜索。
 

#最后执行以下命令关闭网络

./byfn.sh down   如果要开始其他网络必须执行此步，要不然环境不干净。






快速启动1.4fabric进行环境部署

1.进入$GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/basic-network

2在hyperledger下创建sdk-node-study目录（你自己想要的任何目录）

3.将第一步basic-network的内容复制到该目录下

4.该目录下的文件创建会包括 一个orderer组织  一个peer节点

5.$ mkdir chaincode  -- 在该文件下创建链码目录

 cp -r $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/chaincode/fabcar  ./chaincode   复制已有链码到创建的链码目录，
 
如果要自己写链码，可以自己把链码放到./chaincode下，以为启动容器的时候会自动识别该路径。

6.进入复制过来的basic-network目录

7.生成证书

./generate.sh

8../start.sh启动容器，自动创建通道，加入通道

9.docker-compose -f ./docker-compose.yml up -d cli 启动cli容器，在该容器内执行创建通道，加入通道，实例化链码，测试等操作

10.进入该cli容器  docker exec -it cli bash

11.安装链码

peer chaincode install -n fabcar -v 1.0 -p github.com/fabcar/go -l golang  

-n 链码名字  -v是版本 -p是容器内的链码位置  -l 语言

12.实例化链码 这一步才是算真正可以调用链码

peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l golang -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member')"

-o orderer节点  -C通道名字 -n链码名字 -l语言 -v版本 -c 链码执行的参数，第一个参数是链码名字，第二个及剩下的是具体参数 -P 背书策略

13.初始化链码的账本（根据链码功能）

peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{"function":"initLedger","Args":[]}'

此处就是执行链码的initLedger功能，传入参数为空


安装nodejs库

切换到javascript目录 

cd javascript

(1)安装依赖

npm install node-gyp

npm install node-pre-gyp

npm install grpc

(2)安装express框架

npm install express -save

(3)安装ipfs-api

npm install ipfs-api

(4)安装fabric-nodejs-sdk

sudo npm install --registry=https://registry.npm.taobao.org --unsafe-perm=true --allow-root




