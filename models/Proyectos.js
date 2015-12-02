var mongoose = require('mongoose');

var ProyectosSchema = new mongoose.Schema({
	titulo: String,
	descripcion : String,
	users: ['UsuariosSchema'],
	created : { type: Date, default: Date.now },
	createdby : String,
}); //tendra la esctructura de la tabla

mongoose.model('Proyectos', ProyectosSchema);