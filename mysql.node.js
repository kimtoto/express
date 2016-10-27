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
var crypto = require('crypto');
var mysql = require('mysql');

var app = express();

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

var pool = mysql.createPool({
    connectionLimt: 10,
    host: 'localhost',
    user: 'root',
    password: 'rlarudxo11',
    database: 'test',
    debug: false
});

var addUser = function(id,name,age,password,callback) {
    console.log("adduser 호출");

    pool.getConnection(function(err,conn) {
        if(err) {
            // 연결을 해제
            conn.release();
            return;
        }

        console.log('데이터베이스 연결 스레드 아이디: ' + conn.threadId);

        var data = {id:id, name:name, age:age, password: password};

        var exec = conn.query('insert into user set ?', data, function(err, result) {
        conn.release();
        console.log('실행 대상 SQL:' + exec.sql);

        if(err) {
            console.log('SQL 실행시 에러 발생');
            console.dir(err);

            callback(err,null);
            return;
        }

        callback(null, result);
    }); 
        
    });
};

var authUser = function(id,password,callback) {
    console.log('authUser호출됨');

    pool.getConnection(function(err,conn) {
        if(err) {
            conn.release();
            return;
        }

        console.log('thread id' + conn.threadId);

        var columns = ['id','name','age'];
        var tablename = 'user';

        var exec = conn.query('select ?? from ?? where id = ? and password = ?',
                                [columns, tablename, id, password], function(err, rows) {
            conn.release();
            console.log('실행대상 SQL' + exec.sql);

            if(rows.length > 0) {
                console.log('아이디 [%s], 비밀번호[%s]가 일치한 사용자를 찾았습니다.');
                callback(null,rows);
            } else {
                console.log('아이디와 비밀번호가 일치 하지 않음');
                callback(null,null);
            }
        });
    });
};

app.post('/process/adduser', function(req,res) {
    console.log('/process/adduser 호출');

    var paramId = req.param('id');
    var paramName = req.param('name');
    var paramPassword = req.param('password');
    var paramAge = req.param('age');

    if(pool) {
        addUser(paramId,paramName,paramAge,paramPassword, function(err,result) {
            if(result) {
                console.dir(result);

                console.log('inserted' + result.insertId + 'rows');

                    var insertId = result.insertId;
                    console.log('추가된 레코드 아이디' + insertId);

                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>mysql 사용자 추가완료</h2>');
                    res.end();

            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>mysql 사용자 추가실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('데이터 베이스 접속 에러');
        res.end();
    }
});

app.post('/process/login', function(req,res) {
    console.log('/process/login 호출됨');
    
    var paramId = req.param('id');
    var paramPassword = req.param('password');

    if (pool) {
        authUser(paramId, paramPassword, function(err, rows) {
            if(err) {throw err;}

            if(rows) {
                console.dir(rows);

                var username = rows[0].name;

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('로그인 성공');
                res.end();
            }
        });
    } else {
         res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('로그인 성공');
                res.end();
    }
});
http.createServer(app).listen(app.get('port'), function() {
    console.log('node js server connection' + app.get('port'));
});


