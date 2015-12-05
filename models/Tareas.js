var mongoose = require('mongoose');
require('./Usuarios');
require('./Proyectos');

var tipos = {
  values: 'PLANIFICADA MEJORA CORRECCION'.split(' '),
  message: 'TIPOS validator failed for path `{PATH}` with value `{VALUE}`'
};

var status = {
  values: 'ESPERA PROCESO PAUSA TERMINADA CANCELADA'.split(' '),
  message: 'STATUS validator failed for path `{PATH}` with value `{VALUE}`'
};

var TareasSchema = new mongoose.Schema({
	nombre: String,
	descripcion : String,
	tipo : { type: String, enum: tipos },
	fecha_plan : Date,
	fecha_termino : Date,
	status : { type: String, enum: status },
	users : [{type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios'}],
	projects : {type: mongoose.Schema.Types.ObjectId, ref: 'Proyectos'},
	created : { type: Date, default: Date.now },
	createdby : String,
	prioridad: Number //quitar despues este campo, no se utilizará
}); //tendra la esctructura de la tabla

module.exports = mongoose.model('Tareas', TareasSchema);