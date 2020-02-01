const moongose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

moongose.connect(process.env.DATABASE, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true
});

moongose.connection.on('error', error => {
  console.log('ERROR AL CONECTAR CON LA BASE DE DATOS : ', error);
})

require('../models/UsuariosModel');
require('../models/Vacantes_Model'); 