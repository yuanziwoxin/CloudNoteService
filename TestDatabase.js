// 导入database模块
var Database = require('./routes/database.js');
// 导入system-sleep模块
var sleep = require('system-sleep');
// 创建Database类的实例
var database = new Database();

// 获取指定账户发布的交易总数
var nonce = database.getNonce();
console.log('nonce: '+nonce);

global.nonce = --nonce;
// 将获取当前交易nonce值的匿名函数赋值给global变量的getNextNonce变量，
// 因为在Database类内部会将getNextNonce变量当成一个函数使用。
global.getNextNonce = function () {
    global.nonce++;
    // 返回nonce值的十六进制字符串
    return '0x'+global.nonce.toString(16);
}
// 随机生成用户id
/*
 这里是一种产生一定长度随机字符串的技巧，36表示36进制，36进制包括0~9十个数字，
 以及a~z二十六个英文字母，所以36进制包括了所有的阿拉伯数字和所有的英文字母。
 而Math.random().toString(36)会产生小数点后11位的36进制小数，如0.ikzlucihnig.
 小数点后面的ikzlucihnig明显是一个11位的随机字符串，但前面多了个‘0.’，所以需要使用
 substr(2)截取掉前两个字符（或者说从第2个字符开始截取，一直截到字符串末尾），
 即只保留小数点后面的部分
  */
var id = Math.random().toString(36).substr(2);
// 随机生成笔记name
var name = Math.random().toString(36).substr(2);

console.log('id: '+id);
console.log('name: '+name);

// 调用Database类的addNote方法将笔记添加到以太坊网络中
var hash = database.addNote(id,name,"Hello,Ethereum!Nice to meet you!");
console.log('添加笔记交易hash：'+hash);

var status = null;
// console.log(status = database.queryTransactionStatus(hash));
// 循环监听添加笔记交易的状态，不管是成功还是失败，都会退出循环
while ((status = database.queryTransactionStatus(hash))==null){
    sleep(1000); // 休眠1秒，也就是每1秒查询一次交易状态
}
// console.log((status = database.queryTransactionStatus(hash))==1);
// console.log("status: "+status);
// 添加笔记交易成功
if(status==1){
    console.log('添加笔记成功');
    // 调用Database类的getNote方法获取刚添加的云笔记内容
    console.log('云笔记内容：'+database.getNote(id,name));
    // 随机产生云笔记内容
    var content = Math.random().toString(36).substr(2);
    console.log('随机产生的修改内容为: '+content);
    // 调用Database类的updateNote方法修改云笔记的内容
    hash = database.updateNote(id,name,content);
    console.log('修改笔记交易hash：'+hash);
    // 循环监听修改笔记交易的状态，不管是成功还是失败，都会退出循环
    while ((status = database.queryTransactionStatus(hash))==null){
        sleep(1000); // 休眠1秒，也就是每1秒查询一次交易状态
    }
    // 修改交易成功
    if(status == 1){
        console.log('云笔记修改成功！');
        // 调用Database类的getNote方法获取刚修改的云笔记内容
        console.log('云笔记内容：'+database.getNote(id,name));
    }
    else if(status == 0){
        console.log('云笔记修改失败！');
    }
}

else if (status == 0){
    console.log('云笔记添加失败！');
}