const mongoose = require('mongoose');
require('./config/database');
const express = require('express');
const router = require('./routes');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('./config/passport');

// DOTEENV PARA OBTENER CONFIGURACIONES EN ARCHIVOS ENV
require('dotenv').config({ path: 'variables.env', });

// CREAR APP
const app = express();

// HABILITAR BODY PARSER
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // RECIBIR JSON

// VALIDAR CAMPOS CON EXPRESS-VALIDATOR
app.use(expressValidator());

// HABILITAR HANDLEBARS COMO TEMPLATE ENGINE
app.engine('handlebars', 
  exphbs({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
  })
);
app.set('view engine', 'handlebars');

// ARCHIVOS STATICOS
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// HABILITAR USO DE SESIONES
app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  sotre: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

// ALERTAS Y FLASH MESSAGES
app.use(flash());

// MIDDLEWARE PROPIO
app.use((req, res, next) => {
  // GUARDAR FLASH EN VARIABLES LOCALES
  res.locals.mensajes = req.flash();
  next();
});

// IMPORTANDO RUTAS
app.use('/', router());

// INICIAR APP CON PUERTO CONFIGURADO EN EL ARCHIVO ENV
app.listen(process.env.PUERTO);