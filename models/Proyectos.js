var mongoose = require('mongoose');

var ProyectosSchema = new mongoose.Schema({
	titulo: String,
	descripcion : String,
	// tareas: [{type: mongoose.Schema.Types.ObjectId, ref: 'TareasSchema'}],
	created : { type: Date, default: Date.now },
	createdby : String,
}); //tendra la esctructura de la tabla

module.exports = mongoose.model('Proyectos', ProyectosSchema);