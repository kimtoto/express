var debug = require('debug')('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var http = require('http');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var app = express();

var database;
var UsersSchma;
var UserModel;
var authUser;
var addUser;

function connectDB() {

  var databaseUrl = 'mongodb://localhost:27017/shopping';

  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on('error', console.error.bind(console,'mongoose connection error.'));
  database.on('open', function() {
      console.log('mongooes databases connection :' + databaseUrl);

      UsersSchma = mongoose.Schema({
          id: {type: String, required:true, unique:true},
          name: String,
          password: String
      });

      console.log('UserSchme define');

      // User 모델 정의
      UserModel = mongoose.model('users', UsersSchma);
      console.log('users를 정의함');
  });

  database.on('disconnected', connectDB);
}

authUser = function(database, id, password, callback) {
    console.log('authUer call');

    UserModel.find({'id':id, 'password':password}, function(err, results) {
        if(err) {
            callback(err, null);
            return;
        }

        console.log('아이디: [%s], 비밀번호[%s]로 사용자 검색 결과',id,password);
        console.dir(results);

        if(results.length > 0 ) {
            console.log('일치하는 사용자를 찾음', id, password);
            callback(null, results);
        } else {
            Console.log('일치하는 사용자를 찾지 못함');
            callback(null,null);
        }
    });
};

addUser = function(database, id, password, name, callback) {
    console.log('addUser connection');

    var user = new UserModel({"id":id, "password":password, "name":name});

    user.save(function(err) {
        if(err) {
            callback(err, null);
            return;
        }

        console.log('사용자 데이터 추가함.');
        callback(null, user);    
    });    
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true
}));

app.post('/process/login', function(req,res) {
    var paramId = req.param('id');
    var paramPassword = req.param('password');

    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if (err) { throw err;}

            if(docs) {
                console.dir(docs);

                res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디' + paramId + '</p></div>');
                res.end();

            } else {

                res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>you not connection mongodb</h1>');
                res.end();
            }

        });
    }

});

app.post('/process/adduser', function(req,res) {
    console.log('/process/adduser connection');

    var paramId = req.param('id');
    var paramPassword = req.param('password');
    var paramName = req.param('name');

    if(database) {
        addUser(database, paramId, paramPassword, paramName, function(err,result) {
            if(err) {throw err;}

            if(result) {
                console.dir(result);

                res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가</h2>');
                res.end();
            } else {
                res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터 베이스 연결 실패</h2>');
        res.end();
    }
});

http.createServer(app).listen(app.get('port'), function() {
    debug('connection port:' + app.get('port'));
    connectDB();
});
