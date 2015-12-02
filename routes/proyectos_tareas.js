var express = require('express');
var router = express.Router();
//var passport = require('passport');

var mongoose = require('mongoose');
var ProyectosTareas = mongoose.model('ProyectosTareas'); // Instancia del modelo ProyectosTareas que creamos anteriormente

//GET - Metodo para listar proyectos_tareas
router.get('/proyectos_tareas', function(req, res, next){
	ProyectosTareas.find(function(err, proyectos_tareas){
		if(err){return next(err)}

		res.json(proyectos_tareas)
	})
});

//POST - Agregar ProyectosTareas
router.post('/proyectos_tarea', function(req, res, next){
	var proyectos_tarea = new ProyectosTareas(req.body); //creo una nueva instancia de mi modelo de datos

	proyectos_tarea.save(function(err, proyectos_tarea){
		if (err) {return next(err)}

		res.json(proyectos_tarea);
	})
});

//PUT - Actualizar ProyectosTareas
router.put('/proyectos_tarea/:id', function(req, res){
	ProyectosTareas.findById(req.params.id, function(err, proyectos_tarea){//is es el parametro que enviamos a traves de la ruta //proyectos_tarea es el elemento de la base de datos que ya encontro
		proyectos_tarea.nombre = req.body.nombre;
		proyectos_tarea.prioridad = req.body.prioridad;

		proyectos_tarea.save(function(err){
			if (err) {res.send(err)}

			res.json(proyectos_tarea);
		});
	});
});

//DELETE _ Borrar ProyectosTareas
router.delete('/proyectos_tarea/:id', function(req, res){
	ProyectosTareas.findByIdAndRemove(req.params.id, function(err, proyectos_tarea){
		if (err) {res.send(err)}
		res.json({message: 'El proyectos_tarea se ha eliminado'});
	})
});


module.exports = router;