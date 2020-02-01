const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const UsuariosModel = mongoose.model('usuarios');

passport.use(new LocalStrategy({
  usernameField: 'email', // NOMBRE DE CAMPOS QUE USUARA
  passwordField: 'password'
  }, async (email, password, done) => { // "DONE" FUNCIONA SIMILAR A "NEXT" EN LAS RUTAS

    const usuario = await UsuariosModel.findOne({ email });
    if(!usuario) return done(null, false, {
      message: 'Usuario no existe'
    });

    const verificarPassword = usuario.compararPassword(password);
    if(!verificarPassword) return done(null, false, {
      message: 'Password incorrecto'
    });

    return done(null, usuario);
  }
));

passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (id, done) => {
  const usuario = await UsuariosModel.findById(id);
  return done(null, usuario);
});

module.exports = passport;