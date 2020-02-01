const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const usuariosSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  token: String,
  expira: Date,
  imagen: String, 
});

// HASEAR LAS PASSWORDS
usuariosSchema.pre('save', async function(next) {
  // SI LA PASSWORD HA SIDO MODIFICADA(HASHEADA)
  if(!this.isModified('password')) return next();

  const hash = await bcrypt.hash(this.password, 12);

  this.password = hash;

});

// ENVIAR ALERTA CUANDO UN USUARIO YA ESTA REGISTRADO
usuariosSchema.post('save', function(error, document, next) {
  if(error.name === 'MongoError' && error.code === 11000) {
    next('Ese correo ya esta registrado');
  } else {
    next(error);
  }
});

// AUTENTICAR PASSWORDS
usuariosSchema.methods = {
  compararPassword: function(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

module.exports = model('usuarios', usuariosSchema);