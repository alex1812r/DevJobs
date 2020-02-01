const mongoose = require('mongoose');
const VacantesModel = mongoose.model('vacantes');
const multer = require('multer');
const shortId = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
  res.render('nueva_vacante', {
    nombrePagina: 'Nueva Vacante',
    tagline: 'llena el fomulario y publica tu vacante',
    nombre: req.user.nombre,
    cerrarSesion: true,
    imagen: req.user.imagen
  })
};

exports.agregarVacante = async (req, res, next) => {
  const vacante = new VacantesModel(req.body);
  vacante.skills = req.body.skills.split(',');
  
  vacante.autor = req.user._id;
  
  const nuevaVacante = await vacante.save();

  if(!nuevaVacante) return next();

  res.redirect(`/vacantes/${nuevaVacante.url}`);
};

exports.mostrarVacante = async (req, res, next) => {
  const { url } = req.params;
  //POPULATE SIMILA UN JOIN DE SQL MEDIANTE REF ASIGNADA EN MODELO
  const vacante = await VacantesModel.findOne({ url }).populate('autor'); 
  
  if(!vacante) return next();
  
  const vacanteFiltered = {
    empresa: vacante.empresa,
    ubicacion: vacante.ubicacion,
    contrato: vacante.contrato,
    salario: vacante.salario,
    descripcion: vacante.descripcion,
    skills: vacante.skills,
    autor: {
      nombre: vacante.autor.nombre,
      imagen: vacante.autor.imagen
    },
    url: vacante.url,
  };

  res.render('vacante',{
    vacante: vacanteFiltered,
    nombrePagina: vacante.titulo,
    barra: true,
  });

};

exports.formularioEditarVacante = async (req, res, next) => {
  const { url } = req.params;
  const vacante = await VacantesModel.findOne({ url });

  if(!vacante) return next();

  const vacanteFiltered = {
    titulo: vacante.titulo,
    empresa: vacante.empresa,
    ubicacion: vacante.ubicacion,
    contrato: vacante.contrato,
    salario: vacante.salario,
    descripcion: vacante.descripcion,
    skills: vacante.skills,
    url: vacante.url,
  };

  res.render('editar-vacante', {
    vacante: vacanteFiltered,
    nombrePagina: `Editar - ${vacanteFiltered.titulo}`,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    cerrarSesion: true,
  });

};

exports.editarVacante = async (req, res, next) => {
  const { url } = req.params;
  const vacanteCambios = req.body;
  vacanteCambios.skills =  req.body.skills.split(',');
  
  const vacanteAcualizada = await VacantesModel.findOneAndUpdate(
    { url }, vacanteCambios,
    // new para que traiga el documento actualizado y no antes de ser actualizado
    // runValidators para que tome todo lo del modelo
    { new: true, runValidators: true }
  );
 
  res.redirect(`/vacantes/${vacanteAcualizada.url}`);
};

exports.validarVacante = (req, res, next) => {
  // SANITIZAR LOS CAMPOS
  req.sanitizeBody('titulo').escape();
  req.sanitizeBody('empresa').escape();
  req.sanitizeBody('ubicacion').escape();
  req.sanitizeBody('salario').escape();
  req.sanitizeBody('contrato').escape();
  req.sanitizeBody('skills').escape();

  // VALIDAR
  req.checkBody('titulo', 'Agrega un titulo a la vacante').notEmpty();
  req.checkBody('empresa', 'Agrega una empresa').notEmpty();
  req.checkBody('ubicacion', 'Agrega una ubicación').notEmpty();
  req.checkBody('contrato', 'selecciona el tipo de contrato').notEmpty();
  req.checkBody('skills', 'Agrega almenos una habilidad').notEmpty();
  
  const errores = req.validationErrors();

  if(errores) {
    req.flash('error', errores.map(error => error.msg));
    
    res.render('nueva_vacante', {
      nombrePagina: 'Nueva Vacante',
      tagline: 'llena el fomulario y publica tu vacante',
      nombre: req.user.nombre,
      cerrarSesion: true,
      mensajes: req.flash(),
    });
    
    return;
  }

  next();
};


exports.eliminarVacante = async (req, res) => {
  const { id } = req.params;
  const vacante = await VacantesModel.findById(id);
  if(vacante.autor.equals(req.user._id)) {
    await vacante.remove();
    res.status(200).send('Vacante Eliminada con exito');
  }else {
    res.status(403).send('ERROR DE PERSMISOS');
  }
};


exports.subirCV = (req, res, next) => {
  upload(req, res, function(error) {
    if(error) {
      // SI EL ERROR ES DE MULTER
      if(error instanceof multer.MulterError) {
        if(error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archivo es muy grande, maximo permitido 5MB');
        
        } else {
          req.flash('error', error.message);
        }

      } else {
        // ERRORES CREADOS EN EL CONFIGMULTER
        req.flash('error', error.message);
      }
      res.redirect('back'); // REGRESA A LA PAGINA
      return;
    
    }
    next();
  });
};

const configMulter = {
  // LIMITE DE 100KB DE TAMAÑO DEL ARCHIVO
  limits: { fileSize: 5000000 },
   // DONDE SE VAN ALMACENAR LOS ARCHIVOS (Servidor - DiscoLocal)
  storage: fileStorage = multer.diskStorage({
    // RUTA DONDE SE VA A GUARDAR
    destination:  (req, file, callback) => {
      callback(null, __dirname + '../../public/uploads/cvs'); 
    },
    filename: (req, file, callback) => {
      const extension = file.mimetype.split('/')[1];
      callback(null,  `${shortId.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, callback) {
    // VALIDAR QUE EL TIPO DE ARCHIVO SEA DE TIPO IMAGEN
    console.log('file :', file);
    if(file.mimetype === 'application/pdf') {
      callback(null, true);
    } else {
      callback(new Error('Formato no Valido'), false);
    }
  },
};

// DENTRO DE SINGLE INDICAR EL NAME DEL INPUT QUE TRAE EL ARCHIVO
const upload = multer(configMulter).single('cv');


exports.contactar = async (req, res, next) => {
  const { url } = req.params; 
  const vacante = await VacantesModel.findOne({ url });
  if(!vacante) return next();
  
  const { nombre, email } = req.body;
  const { file: { filename } } = req;
  const nuevoCandidato = { nombre, email, cv: filename };

  vacante.candidatos.push(nuevoCandidato);

  try{
    await vacante.save();

  } catch(error) {
    req.flash('error', 'Hubo un error');
    res.redirect('back');
    return  
  }

  req.flash('correcto', 'Se Envio tu CV con exito');
  res.redirect('/');
};


exports.mostrarCandidatos = async (req, res, next) => {
  const { id } = req.params;
  const vacante = await VacantesModel.findById(id);
  if(!vacante) {
    req.flash('error', 'no existe la vacante');
    return res.redirect('/administracion');
  } else if (vacante.autor + "" !== req.user._id + ""){
    req.flash('error', 'no tiene permisos para esta vacante');
    return res.redirect('/administracion');
  }

  const candidatos = vacante.candidatos.map(candidato => ({
    nombre: candidato.nombre,
    email: candidato.email,
    cv: candidato.cv,
  }));

  res.render('candidatos', {
    nombrePagina: `candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos
  });
}