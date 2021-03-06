var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// passport config
app.use(passport.initialize());
app.use(passport.session());
var User = require('./models/Usuarios');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



mongoose.connect('mongodb://localhost/tareas');

require('./models/Tareas'); //Agregar modelo, o esquema de la base de datos
require('./models/TareasUsuarios'); //Agregar modelo, o esquema de la base de datos
require('./models/Proyectos'); //Agregar modelo, o esquema de la base de datos
require('./models/ProyectosTareas'); //Agregar modelo, o esquema de la base de datos
require('./models/Sesiones'); //Agregar modelo, o esquema de la base de datos
//require('./models/Usuarios'); // Agregar por cada modelo que tengamos creado

var routes = require('./routes/tareas');
var proyectos = require('./routes/proyectos');
var sesiones = require('./routes/sesiones');
var tareas_usuarios = require('./routes/tareas_usuarios');
var proyectos_tareas = require('./routes/proyectos_tareas');
var login = require('./routes/login');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'eoncore',
    store: new MongoStore({mongooseConnection: mongoose.connection })
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/login', login);
app.use('/proyectos', proyectos);
app.use('/sesiones', sesiones);
app.use('/tareas_usuarios', tareas_usuarios);
app.use('/proyectos_tareas', proyectos_tareas);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
