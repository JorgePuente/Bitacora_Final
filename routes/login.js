var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('login/appLogin', { title: 'Express' });
});


var mongoose = require('mongoose');
var Usuarios = mongoose.model('Usuarios'); // Instancia del modelo Usuarios que creamos anteriormente

//GET - Metodo para listar tareas
router.get('/usuarios', function(req, res, next){
	Usuarios.find(function(err, usuarios){
		if(err){return next(err)}

		res.json(usuarios)
	})
});

//get - Obtener usuario por id
router.get('/usuario/:id', function(req, res, next){
	Usuarios.findById(req.params.id, function(err, usuario){//is es el parametro que enviamos a traves de la ruta //tarea es el elemento de la base de datos que ya encontro
		console.log('usuario');
		// console.log(usuario);
		req.session.user = usuario;
		if (err) {return next(err)}else{

			res.json({'success' : true});
			//window.location.href = '/'; 
		}

	});
});

//POST - Agregar Usuarios
router.post('/usuario', function(req, res, next){
	var usuario = new Usuarios(req.body); //creo una nueva instancia de mi modelo de datos

	usuario.save(function(err, usuario){
		if (err) {return next(err)}

		res.json(usuario);
	})
});

//PUT - Actualizar Usuarios
router.put('/usuario/:id', function(req, res){
	Usuarios.findById(req.params.id, function(err, usuario){//is es el parametro que enviamos a traves de la ruta //tarea es el elemento de la base de datos que ya encontro
	
		usuario.nombre = req.body.nombre;
		usuario.correo_electronico = req.body.correo_electronico;
		usuario.password = req.body.password;

		usuario.save(function(err){
			if (err) {res.send(err)}

			res.json(usuario);
		});
	});
});

//DELETE _ Borrar Usuarios
router.delete('/usuario/:id', function(req, res){
	Usuarios.findByIdAndRemove(req.params.id, function(err, usuario){
		if (err) {res.send(err)}
		res.json({message: 'El usuario se ha eliminado'});
	})
});


module.exports = router;