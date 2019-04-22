// 导入web3模块
var Web3 = require('web3');
// 导入fs模块
var fs = require('fs');
// 导入ethereumjs-tx模块
var Tx = require('ethereumjs-tx');
// 导入web3-eth-abi模块
var ethabi = require('web3-eth-abi');
class Database{
    // 在构造函数中完成初始化操作
    constructor(){
        // 指定CloudNote合约的部署地址，就是将CloudNote部署到以太坊网络（主网和测试网）的地址
        // 部署在rinkeby网络的合约地址：0xa222a773d3964f7f3b12e6f9e6e39818fa18e136
        // 部署在ropsten网络的合约地址：0xebe80ac5ad6f2206c6697f8cfa0cb30f85b888fb
        this.contractAddress = '0xebe80ac5ad6f2206c6697f8cfa0cb30f85b888fb';
        // 指定gasPrice,这里使用1Gwei,用十六进制表示就是0x3B9ACA00。1Gwei是大多数矿工可以接受的价格
        this.gasPrice = '0x3B9ACA00';
        // 创建Web3对象，HttpProvider构造类方法的参数值一定要指定为infura.io节点ropsten测试节点的URL
        this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/01da1f984af44c74a212d8ea91594618"));
        // 读取abi文件的内容，并转化为JSON对象
        this.abi = JSON.parse(fs.readFileSync("./CloudNote_sol_CloudNote.abi").toString());
        // 创建与CloudNote合约绑定的contract实例
        this.contract = this.web3.eth.contract(this.abi).at(this.contractAddress);
        // this.contract =new this.web3.eth.Contract(this.abi,this.contractAddress);
    }
    // 获取当前账户已经发布的交易数
    getNonce(){
        // getTransactionCount函数的参数值就是用于调用CloudNote合约函数的以太坊账户
        // rinkeby网络的账户Account4：0x6Cf0f35A847685c3e09EA78786183Df92E8A5Ecf
        // ropsten网络的账户Account1：0x7598615ae0bd71e9d3ca951caf10f0ba5c1d48e4
        var nonce = this.web3.eth.getTransactionCount("0x7598615ae0bd71e9d3ca951caf10f0ba5c1d48e4");
        // console.log('database nonce:'+nonce); //[object Promise]
        return nonce;
    }
    // 添加或更新笔记，id：用户ID；name：笔记标题名称；content：笔记内容
    // notefun：描述CloudNote合约中函数的十六进制数据
    addUpdateNote(id,name,content,notefun){
        // 预估调用notefun表示的函数需要多少gas
        var estimateGas = this.web3.eth.estimateGas({
            to:this.contractAddress,
            data:notefun
        });
        // console.log(estimateGas);
        estimateGas = this.web3.toHex(estimateGas);
        console.log("estimateGas: "+estimateGas);
        // 将gas预估值转换为十六进制 web3.toHex已修改为web3.utils.toHex(新版本)
        // estimateGas = this.web3.utils.toHex(estimateGas);
        // console.log(estimateGas);
        // 获取当前交易的nonce值
        var nonce = global.getNextNonce();
        // 定义交易对象
        var rawTx = {
            nonce:nonce,                // nonce值，每笔交易加1
            gasPrice:this.gasPrice,     // gas单价
            gasLimit: estimateGas,      // 完成交易需要多少gas（预估值）
            to:this.contractAddress,    // 合约地址
            value:'0x00',               // 这里设为0x00
            data:notefun,                // 如果是调用合约函数，需要指定合约函数的十六进制数据
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: 3
        }
        // 创建Tx对象风险rawTx对象
        var tx = new Tx(rawTx);
        // 设置账户的私钥
        // rinkeby网络的账户Account4的私钥：9114d6fc2b04f44d8f9beee48b226eed9b5c88ea5fca671cc0baf44822280fe8
        // ropsten网络的账户Account1的私钥：503A8AFDF4FC951F0ED11676F0237C9903AEF654E3E42F4E8443C18535835E0F
        const privateKey = new Buffer.from('503A8AFDF4FC951F0ED11676F0237C9903AEF654E3E42F4E8443C18535835E0F','hex');
        // 用户账户的私钥对rawTx中的数据进行签名
        tx.sign(privateKey);
        // 将签名结果进行序列化
        var serializedTx = tx.serialize();
        // console.log(serializedTx);
        // console.log('0x' + serializedTx.toString('hex'));
        return this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
        // 发送经过签名后的交易数据 sendRawTransaction已经改为sendSignedTransaction
        // return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    // 添加笔记
    addNote(id,name,content){
         // 获取描述CloudNote合约中addNote函数的十六进制数据
        var addNote = this.contract.addNote.getData(id,name,content); //(web3 0.2X.0的写法)
        // var addNote = this.contract.methods.addNote(id,name,content).encodeABI(); // (web3 1.0.0之后的写法)
        //  调用addUpdateNote方法添加笔记
        // return this.web3.utils.sha3(this.addUpdateNote(id,name,content,addNote).toString())
        return this.addUpdateNote(id,name,content,addNote);
    }
    // 更新笔记
    updateNote(id,name,content){
        // 获取描述CloudNote合约中updateNote函数的十六进制数据
        var updateNote = this.contract.updateNote.getData(id,name,content); //(web 0.2.x的写法)
        // var updateNote = this.contract.methods.updateNote(id,name,content).encodeABI();
        // 调用addUpdateNote方法添加笔记
        return this.addUpdateNote(id,name,content,updateNote);
    }
    // 根据用户ID和笔记名称获取笔记的内容
    getNote(id,name){
        // 获取描述CloudNote合约中getNote函数的十六进制数据
        var getNote = this.contract.getNote.getData(id,name); //(web 0.2.x的写法)
        // var getNote = this.contract.methods.getNote(id,name).encodeABI();
        // 通过web3.eth.call函数调用CloudNote合约中的getNote函数
        // 在调用过程中不需要对数据进行签名
        var result = this.web3.eth.call({
            to:this.contractAddress,
            data:getNote
        });
        // 使用ethabi.decodeParameter函数对getNote函数返回结果解码
        console.log("result: "+result);
        console.log(ethabi.decodeParameter('string',result));
        return ethabi.decodeParameter('string',result);
    }
    // 返回交易状态；1：成功；0：失败；null：未处理
    queryTransactionStatus(hash){
        // 获取hash指定的交易数据
        var result = this.web3.eth.getTransactionReceipt(hash);
        // console.log("result: "+result);
        // console.log("result.status(): "+result.status());
        // console.log("result.status:"+result.status);
        if (result != null){
            return parseInt(result.status,16);
        }
        return null;
    }
}

// 导出Database类，否则其他JavaScript文件无法使用Database类
module.exports = Database;