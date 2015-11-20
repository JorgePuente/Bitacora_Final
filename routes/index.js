var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Tareas = mongoose.model('Tareas'); // Instancia del modelo tareas que creamos anteriormente

//GET - Metodo para listar tareas
router.get('/tareas', function(req, res, next){
	Tareas.find(function(err, tareas){
		if(err){return next(err)}

		res.json(tareas)
	})
});

//POST - Agregar Tareas
router.post('/tarea', function(req, res, next){
	var tarea = new Tareas(req.body); //creo una nueva instancia de mi modelo de datos

	tarea.save(function(err, tarea){
		if (err) {return next(err)}

		res.json(tarea);
	})
});

//PUT - Actualizar Tareas
router.put('/tarea/:id', function(req, res){
	Tareas.findById(req.params.id, function(err, tarea){//is es el parametro que enviamos a traves de la ruta //tarea es el elemento de la base de datos que ya encontro
		tarea.nombre = req.body.nombre;
		tarea.prioridad = req.body.prioridad;

		tarea.save(function(err){
			if (err) {res.send(err)}

			res.json(tarea);
		});
	});
});

//DELETE _ Borrar Tareas
router.delete('/tarea/:id', function(req, res){
	Tareas.findByIdAndRemove(req.params.id, function(err, tarea){
		if (err) {res.send(err)}
		res.json({message: 'La tarea se ha eliminado'});
	})
});


module.exports = router;