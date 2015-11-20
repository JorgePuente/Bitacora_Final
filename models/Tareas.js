var mongoose = require('mongoose');

var TareasSchema = new mongoose.Schema({
	nombre: String,
	prioridad: Number
}); //tendra la esctructura de la tabla

mongoose.model('Tareas', TareasSchema);