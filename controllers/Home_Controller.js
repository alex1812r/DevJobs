const moongose = require('mongoose');
const VacantesModel = moongose.model('vacantes');

exports.mostrarTrabajos = async (req, res, next) => {

  const vacantes = await VacantesModel.find(error => {
    if(error){
      res.send('HUBO UN ERROR AL CONSULTAR LAS VACANTES');
      res.end();
    }
  });

  if(!vacantes) return next();

  const vacantesFiltered = vacantes.map(vacante  => ({
    empresa: vacante.empresa,
    titulo: vacante.titulo,
    ubicacion: vacante.ubicacion,
    contrato: vacante.contrato,
    url: vacante.url
  }));
  
  res.render('home', {
    nombrePagina: 'DevJobs',
    tagline: 'Encuentra y Pública trabajos para desarrolladores web',
    barra: true,
    boton: true,
    vacantes: vacantesFiltered  
  });
};