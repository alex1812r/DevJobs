const mongoose = require('mongoose');
const UsuariosModel = mongoose.model('usuarios');
const multer = require('multer'); // MANEJAR SUBIDA DE ARCHIVOS
const shortId = require('shortid');

exports.formularioCrearCuenta = (req, res) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea tu cuenta en DevJobs',
    tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
  });
};

exports.validarRegistro = (req, res, next) => {
  // SANITIZAR LOS CAMPOS
  req.sanitizeBody('nombre').escape();
  req.sanitizeBody('email').escape();
  req.sanitizeBody('password').escape();
  req.sanitizeBody('confirmar').escape();
  
  console.log('req.body', req.body);
  
  // VALIDAR CAMPOS
  req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
  req.checkBody('email', 'El email es obligatorio').notEmpty();
  req.checkBody('email', 'El email debe ser valido').isEmail();
  req.checkBody('password', 'El password no puede ir vacio').notEmpty();
  req.checkBody('password', 'El password debe de ser almenos 8 caracteres').isLength({ min: 8 });
  req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
  req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

  const errores = req.validationErrors();
  
  if(errores) {
    console.log('errores : ', errores);
    req.flash('error', errores.map(error => error.msg));

    res.render('crear-cuenta', {
      nombrePagina: 'Crea tu cuenta en DevJobs',
      tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
      mensajes: req.flash()
    });

    return;
  }

  next();
};

exports.crearUsuario = async (req, res, next) => {  
  const usuario = new UsuariosModel(req.body);

  try {
    await usuario.save();
    res.redirect('/iniciar-session');
  
  } catch(error) {
    req.flash('error', error);
    res.redirect('/crear-cuenta')
  
  }
};

exports.formularioIniciarSesion = (req, res) => {
  res.render('iniciar-sesion', {
    nombrePagina: 'Iniciar Sesion DevJobs'
  })
};

exports.formularioEditarPerfil = (req, res) => {

  const usuario = {
    id: "" + req.user._id,
    nombre: req.user.nombre,
    email: req.user.email,
    password: req.user.password,
    imagen: req.user.imagen,
  };
  
  res.render('editar-perfil', {
    nombrePagina: 'Edita tu perfil en DevJobs',
    usuario,
    nombre: req.user.nombre,
    cerrarSesion: true,
    imagen: req.user.imagen
  })
};

exports.editarPerfil = async (req, res) => {
  const { nombre, email, password } = req.body;
  const usuario = await UsuariosModel.findById(req.user._id);
  
  usuario.nombre = nombre;
  usuario.email = email;
  
  if(password) {
    usuario.password = password;
  }
  console.log('FILE :', req.file);
  if(req.file) {
    usuario.imagen = req.file.filename;
  }
  await usuario.save();

  req.flash('correcto', 'Cambios Guardados correctamente');

  res.redirect('/administracion');
}

exports.validarPerfil = (req, res, next) => {
  req.sanitizeBody('nombre').escape();
  req.sanitizeBody('email').escape();
  if(req.body.password) {
    req.sanitizeBody('password').escape();
    req.checkBody('password', 'El password debe de ser almenos 8 caracteres').isLength({ min: 8 });
  }
  
  req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
  req.checkBody('email', 'El email es obligatorio').notEmpty();
  req.checkBody('email', 'El email debe ser valido').isEmail();

  const errores = req.validationErrors();

  if(errores) {
    req.flash('error', errores.map(error => error.msg));
    
    const usuario = { nombre: req.user.nombre, email: req.user.email };

    res.render('editar-perfil', {
      nombrePagina: 'Edita tu perfil en DevJobs',
      usuario,
      nombre: req.user.nombre,
      cerrarSesion: true,
      mensajes: req.flash(),
      imagen: req.user.imagen
    });
  }

  next();

};

exports.subirImagen = (req, res, next) => {
  upload(req, res, function(error) {
    if(error) {
      // SI EL ERROR ES DE MULTER
      if(error instanceof multer.MulterError) {
        if(error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archivo es muy grande, maximo permitido 100KB');
        
        } else {
          req.flash('error', error.message);
        }

      } else {
        // ERRORES CREADOS EN EL CONFIGMULTER
        req.flash('error', error.message);
      }
      res.redirect('/administracion');
      return;
    
    }
    next();
  });
};

const configMulter = {
  // LIMITE DE 100KB DE TAMAÑO DEL ARCHIVO
  limits: { fileSize: 100000 },
   // DONDE SE VAN ALMACENAR LOS ARCHIVOS (Servidor - DiscoLocal)
  storage: fileStorage = multer.diskStorage({
    // RUTA DONDE SE VA A GUARDAR
    destination:  (req, file, callback) => {
      callback(null, __dirname + '../../public/uploads/perfiles'); 
    },
    filename: (req, file, callback) => {
      const extension = file.mimetype.split('/')[1];
      callback(null,  `${shortId.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, callback) {
    // VALIDAR QUE EL TIPO DE ARCHIVO SEA DE TIPO IMAGEN
    console.log('file :', file);
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('Formato no Valido'), false);
    }
  },
};

const upload = multer(configMulter).single('imagen');
