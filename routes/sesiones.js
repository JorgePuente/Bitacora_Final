var express = require('express');
var router = express.Router();
//var passport = require('passport');

var mongoose = require('mongoose');
var Sesiones = mongoose.model('Sesiones'); // Instancia del modelo Sesiones que creamos anteriormente

//GET - Metodo para listar sesiones
router.get('/sesiones', function(req, res, next){
	Sesiones.find(function(err, sesiones){
		if(err){return next(err)}

		res.json(sesiones)
	})
});

//POST - Agregar Sesiones
router.post('/sesion', function(req, res, next){
	var sesion = new Sesiones(req.body); //creo una nueva instancia de mi modelo de datos

	sesion.save(function(err, sesion){
		if (err) {return next(err)}

		res.json(sesion);
	})
});

//PUT - Actualizar Sesiones
router.put('/sesion/:id', function(req, res){
	Sesiones.findById(req.params.id, function(err, sesion){//is es el parametro que enviamos a traves de la ruta //sesion es el elemento de la base de datos que ya encontro
		sesion.nombre = req.body.nombre;
		sesion.prioridad = req.body.prioridad;

		sesion.save(function(err){
			if (err) {res.send(err)}

			res.json(sesion);
		});
	});
});

//DELETE _ Borrar Sesiones
router.delete('/sesion/:id', function(req, res){
	Sesiones.findByIdAndRemove(req.params.id, function(err, sesion){
		if (err) {res.send(err)}
		res.json({message: 'El sesion se ha eliminado'});
	})
});


module.exports = router;