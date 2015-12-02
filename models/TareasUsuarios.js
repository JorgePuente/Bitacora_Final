var mongoose = require('mongoose');

var TareasUsuariosSchema = new mongoose.Schema({
	usuario_id: String,
	tarea_id : String,
	createdby : String,
}); //tendra la esctructura de la tabla

mongoose.model('TareasUsuarios', TareasUsuariosSchema);