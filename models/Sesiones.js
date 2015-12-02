var mongoose = require('mongoose');

var SesionesSchema = new mongoose.Schema({
	usuario_id: String,
	createdby : String,
}); //tendra la esctructura de la tabla

mongoose.model('Sesiones', SesionesSchema);