var mongoose = require('mongoose');

var ProyectosTareasSchema = new mongoose.Schema({
	proyecto_id: String,
	tarea_id : String,
	createdby : String,
}); //tendra la esctructura de la tabla

mongoose.model('ProyectosTareas', ProyectosTareasSchema);