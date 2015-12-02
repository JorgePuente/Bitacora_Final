var express = require('express');
var router = express.Router();
//var passport = require('passport');

var mongoose = require('mongoose');
var Proyectos = mongoose.model('Proyectos'); // Instancia del modelo Proyectos que creamos anteriormente

//GET - Metodo para listar proyectos
router.get('/proyectos', function(req, res, next){
	Proyectos.find(function(err, proyectos){
		if(err){return next(err)}

		res.json(proyectos)
	})
});

//POST - Agregar Proyectos
router.post('/proyecto', function(req, res, next){
	var proyecto = new Proyectos(req.body); //creo una nueva instancia de mi modelo de datos

	proyecto.save(function(err, proyecto){
		if (err) {return next(err)}

		res.json(proyecto);
	})
});

//PUT - Actualizar Proyectos
router.put('/proyecto/:id', function(req, res){
	Proyectos.findById(req.params.id, function(err, proyecto){//is es el parametro que enviamos a traves de la ruta //proyecto es el elemento de la base de datos que ya encontro
		proyecto.titulo = req.body.titulo;
		proyecto.descripcion = req.body.descripcion;

		proyecto.save(function(err){
			if (err) {console.log('hay error', err);res.send(err)}

			res.json(proyecto);
		});
	});
});

//DELETE _ Borrar Proyectos
router.delete('/proyecto/:id', function(req, res){
	Proyectos.findByIdAndRemove(req.params.id, function(err, proyecto){
		if (err) {res.send(err)}
		res.json({message: 'El proyecto se ha eliminado'});
	})
});


module.exports = router;