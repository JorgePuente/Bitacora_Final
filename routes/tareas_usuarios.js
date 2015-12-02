var express = require('express');
var router = express.Router();
//var passport = require('passport');

var mongoose = require('mongoose');
var TareasUsuarios = mongoose.model('TareasUsuarios'); // Instancia del modelo TareasUsuarios que creamos anteriormente

//GET - Metodo para listar tareas_users
router.get('/tareas_users', function(req, res, next){
	TareasUsuarios.find(function(err, tareas_users){
		if(err){return next(err)}

		res.json(tareas_users)
	})
});

//POST - Agregar TareasUsuarios
router.post('/tareas_user', function(req, res, next){
	var tareas_user = new TareasUsuarios(req.body); //creo una nueva instancia de mi modelo de datos

	tareas_user.save(function(err, tareas_user){
		if (err) {return next(err)}

		res.json(tareas_user);
	})
});

//PUT - Actualizar TareasUsuarios
router.put('/tareas_user/:id', function(req, res){
	TareasUsuarios.findById(req.params.id, function(err, tareas_user){//is es el parametro que enviamos a traves de la ruta //tareas_user es el elemento de la base de datos que ya encontro
		tareas_user.nombre = req.body.nombre;
		tareas_user.prioridad = req.body.prioridad;

		tareas_user.save(function(err){
			if (err) {res.send(err)}

			res.json(tareas_user);
		});
	});
});

//DELETE _ Borrar TareasUsuarios
router.delete('/tareas_user/:id', function(req, res){
	TareasUsuarios.findByIdAndRemove(req.params.id, function(err, tareas_user){
		if (err) {res.send(err)}
		res.json({message: 'El tareas_user se ha eliminado'});
	})
});


module.exports = router;