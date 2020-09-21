package main

/*
 CORE_PEER_ADDRESS=peer:7052 CORE_CHAINCODE_ID_NAME=mycc:0 ./zallDisk
 peer chaincode install -p chaincodedev/chaincode/zallDisk -n mycc -v 0
 peer chaincode instantiate -n mycc -v 0 -c '{"Args":[]}' -C myc
 peer chaincode invoke -n mycc -c '{"Args":["initLedger"]}' -C myc
 peer chaincode invoke -n mycc -c '{"Args":["addUser","wuliangshun","common"]}' -C myc
 peer chaincode invoke -n mycc -c '{"Args":["addFile","Qmb64o6w185r37cmyjhhSPyKTi7e968o3oLpfHjPN6qiZs","test.txt","wuliangshun"]}' -C myc
 peer chaincode invoke -n mycc -c '{"Args":["queryFileByHash","Qmb64o6w185r37cmyjhhSPyKTi7e968o3oLpfHjPN6qiZs"]}' -C myc
*/



import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {

	return shim.Success(nil)
}

type Msg struct {
	Status  bool   `json:"Status"`
	Code    int    `json:"Code"`
	Message string `json:"Message"`
}

type User struct{
	UserName string `json:"user_name"`
	UserType string `json:"user_type"`
}

type File struct{
	FileHash string `json:"file_hash"`
	FileName string `json:"file_name"`
	UserName string `json:"user_name"`
}

//Invoke函数
func (t *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function,args:=stub.GetFunctionAndParameters()
	if function=="queryFileByName"{
		return t.queryFileByName(stub,args)
	}else if function=="queryFileByHash"{
		return t.queryFileByHash(stub,args)
	}else if function=="addFile"{
		return t.addFile(stub,args)
	}else if function=="addUser"{
		return t.addUser(stub,args)
	}else if function=="initLedger"{
		return t.initLedger(stub,args)
	}
	return shim.Error("Invalid function name，input correct function name.")
}



//初始化账本
func (s *SmartContract) initLedger(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	uname := "admin"
	utype := "admin"
	
	existAsBytes, err := stub.GetState(uname)
	fmt.Printf("GetState(%s) %s \n", uname, string(existAsBytes))
	if string(existAsBytes) != "" {
		fmt.Println("Failed to create user, Duplicate user name.")
		return shim.Error("Failed to create user, Duplicate user name.")
	}

	user := User{
		UserName:   uname,
		UserType:   utype}

	userAsBytes, _ := json.Marshal(user)
	err = stub.PutState(uname, userAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("add User %s \n", string(userAsBytes))

	return shim.Success(userAsBytes)
}

//添加用户
func (t *SmartContract) addUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	uname := args[0]
	existAsBytes, err := stub.GetState(uname)
	fmt.Printf("GetState(%s) %s \n", uname, string(existAsBytes))
	if string(existAsBytes) != "" {
		fmt.Println("Failed to add user, Duplicate user name.")
		return shim.Error("Failed to add user, Duplicate user name.")
	}

	utype := args[1]
	user := User{
		UserName:   uname,
		UserType:   utype}

	userAsBytes, _ := json.Marshal(user)
	err = stub.PutState(uname, userAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("add User %s \n", string(userAsBytes))
	
	return shim.Success(userAsBytes)
}

//添加文件
func (t *SmartContract) addFile(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	if len(args)!=3{
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}
	
	fhash := args[0]
	fname := args[1]
	uname := args[2]
	
	existAsBytes, err := stub.GetState(fhash)
	fmt.Printf("GetState(%s) %s \n", fhash, string(existAsBytes))
	if string(existAsBytes) != "" {
		fmt.Println("File already exists!")
		return shim.Error("File already exists!")
	}

	file := File{
		FileHash:   fhash,
		FileName:   fname,
		UserName:   uname}

	fileAsBytes, _ := json.Marshal(file)
	err = stub.PutState(fhash, fileAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("add File %s \n", string(fileAsBytes))

	return shim.Success(fileAsBytes)
}


// 根据文件名找到文件
func (t *SmartContract) queryFileByName(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args)!=1{
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	file_name:=args[0]
	// 查询信息状态
	b, err := stub.GetState(file_name)
	if err != nil {
		return shim.Error("error in finding")
	}
	if b == nil {
		return shim.Error("no such file")
	}

	return shim.Success(b)

}

// 根据文件哈希找到文件
func (t *SmartContract) queryFileByHash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args)!=1{
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	file_hash:=args[0]
	// 查询信息状态
	b, err := stub.GetState(file_hash)
	if err != nil {
		return shim.Error("error in finding")
	}
	if b == nil {
		return shim.Error("no such file")
	}

	return shim.Success(b)

}


// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}







