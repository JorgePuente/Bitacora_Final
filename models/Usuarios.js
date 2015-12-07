var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UsuariosSchema = new mongoose.Schema({
	username: String,
	correo_electronico: String,
	password : String,
	roles : Array,
	created: { type: Date, default: Date.now }
}); //tendra la esctructura de la tabla

UsuariosSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Usuarios', UsuariosSchema);;