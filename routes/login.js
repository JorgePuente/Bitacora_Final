var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('login/appLogin', { title: 'Express', user : req.user });
});


var mongoose = require('mongoose');
var Usuarios = mongoose.model('Usuarios'); // Instancia del modelo Usuarios que creamos anteriormente

// passport ///////////////////////////////////////////////////////
// router.get('/register', function(req, res) {
//     res.render('register', { });
// });

router.post('/register', function(req, res) {
    Usuarios.register(new Usuarios({ username : req.body.username, correo_electronico : req.body.correo_electronico}), req.body.password, function(err, usuario) {
        if (err) {
        	console.log(err);
            return res.render('login/appLogin', { usuario : usuario });
        }

        console.log('aqui estoy');

        passport.authenticate('local')(req, res, function () {
        	console.log('aqui entro');
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
	// console.log(req);
    res.render('login/appLogin', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	//console.log('user req', req.user);
	// req.user = req.user;
	// req.prueba = 'prueba';
	req.session.user = req.user;
    res.redirect('/');
});

router.get('/logout', function(req, res) {
	console.log('logout', req.session.user);
    req.logout();
    
    req.session = null;
	// req.session.user = req.user;
    res.redirect('/login');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

// FIN PASSPORT ////////////////////////////////////

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
	
		usuario.username = req.body.username;
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