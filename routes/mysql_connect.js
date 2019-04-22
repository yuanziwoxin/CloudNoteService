var mysql = require('mysql');
class Database{
    constructor(){
        // 连接mysql数据库
        this.connection = mysql.createConnection({
            host:'127.0.0.1',
            user:'root',
            password:'root',
            database:'cloudnote',
            port:3306,
            charset:"UTF8_GENERAL_CI",
            timezone:'local',
            multipleStatements:false
        });
    }
    // 向note表添加记录，req和res用于获取用户请求和用户响应，这两个参数会从相应的路由函数传入
    addNote(req,res){
        // 通过insert into语句将数据插入到note表中
        this.connection.query("insert into note set ?",
            {   user_id:req.query.id,
                name:req.query.name,
                txaddress:req.query.txaddress
            },function (err,result) {
                if (err){
                    console.log(err);
                } else{
                    console.log(result);
                    // 如果成功插入数据，将结果数据返回给客户端（小程序），
                    // 其中包括note表中id字段的值
                    res.send(result);
                }
            });
    }
    // 根据登录用户的id获取云笔记的name列表
    getNoteList(req,res){
        this.connection.query("select * from note where ?",
            {
                user_id:req.query.id
            },function (err,result) {
                if (err){
                    console.log(err);
                } else{
                    // 将查询结果发送给客户端
                    res.send(result);
                }
            });
    }
    // 更新云笔记
    updateNote(req,res){
        this.connection.query("update note set ? where id ="+req.query.sqlid,
            {
                name:req.query.name,
                txaddress:req.query.txaddress
            },function (err,result) {
                if (err){
                    console.log(err);
                } else{
                    // 将更新结果返回给客户端（小程序）
                    console.log(result);
                    res.send(result);
                }
            });
    }
}
// 导出Database类
module.exports = Database;