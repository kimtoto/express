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

var config = require('./config.node');
var user = require('./routes/users');
var database = require('./database/database.node');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || config.server_port);

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

app.post('/process/login', user.login);
app.post('/process/adduser', user.adduser);
app.post('/process/listuser', user.listuser);

http.createServer(app).listen(app.get('port'), function() {
    
    console.log('connection port:' + app.get('port'));
    database.init(app, config);
});
