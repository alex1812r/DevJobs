const { Schema, model } = require('mongoose');
const slug = require('slug');
const shortId = require('shortid');

const vacanteSchema = new Schema({
  titulo: {
    type: String,
    required: 'El Nombre de la Vacante es Obligatorio',
    trim: true
  },
  empresa: {
    type: String,
    trim: true
  },
  ubicacion: {
    type: String,
    trim: true,
    required: 'La ubicación es Obligatoria'
  },
  salario: {
    type: Number,
    default: 0,
  },
  contrato: {
    type: String,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    lowercase: true,

  },
  skills: [String],
  candidatos: [{
    nombre: String,
    email: String,
    cv: String
  }],
  autor: {
    type: Schema.ObjectId,
    ref: 'usuarios', // referencia a otra Collección
    required: 'El autor es obligatorio'
  }
});

// MIDDLEWARES
vacanteSchema.pre('save', function(next){

  const url = slug(this.titulo);
  const id = shortId.generate();
  
  this.url = `${url}-${id}`;

  next();
}); // ANTES DE GUARDAR(SAVE)

module.exports = model('vacantes', vacanteSchema);