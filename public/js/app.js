import axios from 'axios';
import Swal from 'sweetalert2';


document.addEventListener('DOMContentLoaded', () => {
  const skills = document.querySelector('.lista-conocimientos');

  // LIMPIAR ALERTAS
  let alertas = document.querySelector('.alertas');

  if(alertas) {
    limpiarAlertas();
  }

  if(skills) {
    skills.addEventListener('click', agregarSkills);
    // cuando se este en editar llamar la funcion
    skillsSeleccionados();
  }

  const vacantesListado = document.querySelector('.panel-administracion');

  if(vacantesListado) {
    vacantesListado.addEventListener('click', accionesListado);
  }

});

const skills = new Set();

const agregarSkills =  ({ target }) => {

  if(target.tagName === 'LI') {
    if(target.classList.contains('activo')) {
      skills.delete(target.textContent);
      target.classList.remove('activo');
    }else{ 
      skills.add(target.textContent);
      target.classList.add('activo');
    }
  }

  const skillsArray = [...skills];
  document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
  const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
  
  seleccionados.forEach(seleccionada => skills.add(seleccionada.textContent))

  const skillsArray = [...skills];
  document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
  const alertas = document.querySelector('.alertas');
  const interval = setInterval(() => {
    if(alertas.children.length > 0) {
      alertas.removeChild(alertas.children[0]);
    } else if(alertas.children.length === 0) {
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
    console.log('2 segundos')
  }, 2000);
}

const accionesListado = e => {
  e.preventDefault();
  if(e.target.dataset.eliminar) {

    Swal.fire({
      title: 'Confirmar Eliminación',
      text: 'Una vez eliminada no se puede recuperar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar',
      cancelButtonText: 'No, Cancelar'
    }).then(result => {
      if(result.value) {
        
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

        axios.delete(url, { params: url })
          .then(function({ status, data }) {
            if(status === 200) {
              e.target.parentElement.parentElement.parentElement.removeChild(
                e.target.parentElement.parentElement
              );
              
              Swal.fire(
                'Eliminado',
                data,
                'success'
              );

            }
          }).catch(error => {
            console.log('error :', error);
            
            Swal.fire({
              icon: 'error',
              title:'Hubo un error',
              text: 'no se pudo eliminar'
            });

          });

      }
    });
  } else if(e.target.href){
    window.location.href = e.target.href;
  }
}