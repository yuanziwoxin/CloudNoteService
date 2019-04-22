const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// 导入database模块
const Database = require('./routes/database.js');
database = new Database();
// 注意：global是Node.js的全局变量，在任何JavaScript文件中都可以直接使用global变量。
// 通常将全局使用的资源（如变量、函数等）保存在global变量中，以便在任何地方都可以使用。
global.database = database;
// 调用Database类的getNonce方法获取指定账号发布的交易数量
let nonce = database.getNonce();

// 由于每次调用getNextNonce函数都要将global.nonce加1，所以这里需减1
// 因为nonce值从0开始
global.nonce = --nonce;
// 将一个获取当前交易nonce值的匿名函数赋给global.getNextNonce变量
global.getNextNonce = function(){
    global.nonce++;
    //将nonce值转换为十六进制形式
    return '0x'+global.nonce.toString(16);
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
