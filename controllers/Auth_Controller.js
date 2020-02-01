const passport = require('passport');
const VacantesModel = require('../models/Vacantes_Model');
const UsuariosModel = require('../models/UsuariosModel');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/administracion',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios',
});

exports.verificarUsuario = (req, res, next) => {
  // REVISAR USUARIO AUTENTICADO (FUNCION DE PASSPORT) 
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {

  const vacantes = await VacantesModel.find({ autor: req.user._id});
  const vacantesFiltered = vacantes.map(vacante => ({
    id: "" + vacante._id,
    empresa: vacante.empresa,
    titulo: vacante.titulo,
    candidatos: vacante.candidatos,
    url: vacante.url,
  }));
  
  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crea y Administra tus vacantes desde aquí',
    vacantes: vacantesFiltered,
    imagen: req.user.imagen,
    cerrarSesion: true,
    nombre: req.user.nombre 
  });
};

exports.cerrarSesion = (req, res) => {
  // DESTUIR SESION (FUNCION DE PASSPORT)
  req.logout();
  req.flash('correcto', 'exito al cerrar sesión')
  res.redirect('/iniciar-sesion');
};

exports.reestablecerPassword = (req, res) => {
  res.render('reestablecer-password', {
    nombrePagina: 'Reestablece tu Password',
    tagline: 'Si ya tiene una cuenta pero olvidaste tu password, coloca tu email'
  });
}

exports.enviarToken = async (req, res) => {
  const { email } = req.body;
  const usuario = await UsuariosModel.findOne({ email });

  if(!usuario) {
      req.flash('error', 'No existe esa cuenta');
      return res.redirect('/iniciar-sesion');
  }

  // el usuario existe, generar token
  usuario.token = crypto.randomBytes(20).toString('hex');
  usuario.expira = Date.now() + 3600000;

  // Guardar el usuario
  await usuario.save();
  const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
  
  // Enviar notificacion por email
  await enviarEmail.enviar({
      usuario,
      subject : 'Password Reset',
      resetUrl,
      archivo: 'reset'
  });

  // Todo correcto
  req.flash('correcto', 'Revisa tu email para las indicaciones');
  res.redirect('/iniciar-sesion');
}


// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
      token : req.params.token
  });

  if(!usuario) {
      req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
      return res.redirect('/reestablecer-password');
  }

  // Todo bien, mostrar el formulario
  res.render('nuevo-password', {
      nombrePagina : 'Nuevo Password'
  })
}

// almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
      token : req.params.token
  });

  // no existe el usuario o el token es invalido
  if(!usuario) {
      req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
      return res.redirect('/reestablecer-password');
  }

  // Asignar nuevo password, limpiar valores previos
  usuario.password = req.body.password;
  usuario.token = undefined;
  usuario.expira = undefined;

  // agregar y eliminar valores del objeto
  await usuario.save();

  // redirigir
  req.flash('correcto', 'Password Modificado Correctamente');
  res.redirect('/iniciar-sesion');
}