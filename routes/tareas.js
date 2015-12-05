var express = require('express');
var router = express.Router();
//var passport = require('passport');

/* GET home page. */
router.get('/',  function(req, res, next) {
	// console.log(req.session.user);

	// console.log('session user', req.session.user);
	if (req.session.user){
  		res.render('tareas/appTarea', { user: req.session.user });
	}else{
  		res.redirect('/login');
	}
});

var mongoose = require('mongoose');
var Tareas = mongoose.model('Tareas'); // Instancia del modelo tareas que creamos anteriormente

//GET - Metodo para listar todas las tareas
router.get('/tareas', function(req, res, next){
	Tareas.find().populate('users').populate('projects').exec(function(err, tareas){
		if(err){return next(err)}

		res.json(tareas)
	})
});

//GET - Metodo para listar tareas pertenecientes a un proyecto
// router.get('/tareas_pend', function(req, res, next){
// 	console.log('aqui estoy');
// 	Tareas.find()
// 		.or([{status : 'PAUSA'}, {status : 'PROCESO'}, {status : 'ESPERA'}])
// 		.populate('users')
// 		.populate('projects')
// 		.exec(function(err, tareas){
// 			if(err){return next(err)}

// 			res.json(tareas)
// 		});
// });

//GET - Metodo para listar tareas pendientes
router.get('/tareas_pend', function(req, res, next){
	console.log('aqui estoy');
	Tareas.find()
		// .where('status').equals('PAUSA')
		.or([{status : 'PAUSA'}, {status : 'PROCESO'}, {status : 'ESPERA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
});

//GET - Metodo para listar tareas finalizadas
router.get('/tareas_fin', function(req, res, next){
	console.log('aqui estoy');
	Tareas.find()
		// .where('status').equals('PAUSA')
		.or([{status : 'TERMINADA'}, {status : 'CANCELADA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
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
		tarea.descripcion = req.body.descripcion;
		tarea.tipo = req.body.tipo;
		tarea.fecha_plan = req.body.fecha_plan;
		tarea.fecha_termino = req.body.fecha_termino;
		tarea.status = req.body.status;
		tarea.users = req.body.users;
		tarea.projects = req.body.projects;
		tarea.createdby = req.body.createdby;

		console.log('antes de guardado');

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