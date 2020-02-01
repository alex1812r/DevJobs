const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/Home_Controller');
const VacantesController = require('../controllers/Vacantes_Controller');
const UsuariosController = require('../controllers/Usuarios_Controller');
const AuthController = require('../controllers/Auth_Controller');

module.exports = () => {
 
  router.get('/', HomeController.mostrarTrabajos);

  router.get('/vacantes/nueva', 
    AuthController.verificarUsuario, 
    VacantesController.formularioNuevaVacante
  );

  router.post('/vacantes/nueva', 
    AuthController.verificarUsuario, 
    VacantesController.validarVacante, 
    VacantesController.agregarVacante
  );

  router.get('/vacantes/:url', VacantesController.mostrarVacante);

  router.get('/vacantes/editar/:url',
    AuthController.verificarUsuario,
    VacantesController.formularioEditarVacante
  );

  router.post('/vacantes/editar/:url', 
    AuthController.verificarUsuario,
    VacantesController.editarVacante
  );

  router.delete('/vacantes/eliminar/:id', AuthController.verificarUsuario, VacantesController.eliminarVacante);

  router.get('/crear-cuenta', UsuariosController.formularioCrearCuenta);

  router.post('/crear-cuenta', 
    UsuariosController.validarRegistro,  
    UsuariosController.crearUsuario
  );
  
  router.get('/editar-perfil', 
    AuthController.verificarUsuario,
    UsuariosController.formularioEditarPerfil,
  );

  router.post('/editar-perfil',
    AuthController.verificarUsuario,
    // UsuariosController.validarPerfil,
    UsuariosController.subirImagen,
    UsuariosController.editarPerfil
  );

  router.get('/iniciar-sesion', UsuariosController.formularioIniciarSesion);

  router.post('/iniciar-sesion', AuthController.autenticarUsuario);
  
  router.get('/cerrar-sesion', 
    AuthController.verificarUsuario, 
    AuthController.cerrarSesion
  );

  router.get('/reestablecer-password', AuthController.reestablecerPassword);
  router.post('/reestablecer-password', AuthController.enviarToken);

  router.get('/administracion', 
    AuthController.verificarUsuario, 
    AuthController.mostrarPanel
  );
  
  router.post('/vacantes/:url', VacantesController.subirCV, VacantesController.contactar);

  router.get('/candidatos/:id', AuthController.verificarUsuario, VacantesController.mostrarCandidatos);


  return router;
};