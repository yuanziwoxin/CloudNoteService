// 导入express模块
var express = require('express');
var router = express.Router();
// 导入mysql_connect模块
var Database = require('./mysql_connect.js');
// 创建Database类的实例
var db = new Database();
// 定义 /addNote路由，用于添加云笔记
router.get('/addNote',function (req,res,next) {
  // 将云笔记内容保存到以太坊网络上，并返回交易地址
  var txaddress = global.database.addNote(req.query.id,req.query.name,req.query.content);
  // 将交易地址保存到req中名为txaddress的查询字段中
  req.query['txaddress'] = txaddress;
  // 将笔记除了内容以外的数据保存到MySQL数据库中
  db.addNote(req,res);
});

// 定义/updateNote路由，用于更新云笔记的内容
router.get('/updateNote',function (req,res,next) {
    // 更新以太坊网络上对应的云笔记内容
    req.query['txaddress'] = global.database.updateNote(req.query.id,req.query.name,req.query.content);
    // 更新MySQL数据库中该条云笔记的内容
    db.updateNote(req,res);
});
// 定义/getNote路由，用于根据用户ID和云笔记名称从以太坊上获取云笔记内容
router.get('/getNote',function (req,res,next) {
    // 从以太坊上获取云笔记内容
    res.send({content:global.database.getNote(req.query.id,req.query.name)});
});
// 定义/status路由，用于获取特定交易的状态
router.get('/status',function (req,res,next) {
    // 从以太坊网络上获取req.query.hash指定的交易的状态
    var result = global.database.queryTransactionStatus(req.query.hash);
    // 交易待处理
    if (result == null){
      res.send({info:2});
    }
    // 交易成功
    else if (result == 1) {
      res.send({info:1});
    }
    // 交易失败
    else {
      res.send({info:0});
    }
});
// 定义/getList路由，用于获取某一用户的云笔记列表
router.get('/getList',function (req,res,next) {
    db.getNoteList(req,res);
});
//
// router.get('/transfer',function (req,res,next) {
//     var result = global.tokens.transfer(res.query.from,req.query.to,req.query.value);
//     res.render('index',{title:result});
// });
// //
// router.get('/allowance',function (req,res,next) {
//     res.render('index',{title:global.tokens.allowance(req.query.from,req.query.to)});
// })
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// 导出路由
module.exports = router;
