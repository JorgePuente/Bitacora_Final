var mongoose = require('mongoose');

var UsuariosSchema = new mongoose.Schema({
	nombre: String,
	correo_electronico: String,
	password : String,
	created: { type: Date, default: Date.now }
}); //tendra la esctructura de la tabla

mongoose.model('Usuarios', UsuariosSchema);