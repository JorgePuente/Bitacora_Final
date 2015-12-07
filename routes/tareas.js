var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jorge.alejandro.puente@gmail.com',
        pass: 'hwtv6cfn6ad'
    }
});

// var nodeExcel = require('excel-export');
var excelbuilder = require('msexcel-builder');
//var passport = require('passport');

/* GET home page. */
router.get('/',  function(req, res, next) {
	// console.log(req.session.user);

	console.log('session user', req.session.user);
	if (req.session.user){
  		res.render('tareas/appTarea', { user: req.session.user });
	}else{
  		res.redirect('/login');
	}
});

var mongoose = require('mongoose');
var Tareas = mongoose.model('Tareas'); // Instancia del modelo tareas que creamos anteriormente

router.get('/logout', function(req, res) {
	console.log('aqui llego');
	// console.log('logout', req.session.user);
    // req.session.reset();
	console.log('despues de reset');
    req.logout();
	console.log('despues de logout');

    
    delete req.session.user;
    console.log('logout');
	// req.session.user = req.user;

    // res.redirect('/');
});

//GET - Metodo para listar todas las tareas
router.get('/tareas', function(req, res, next){
	Tareas.find().populate('users').populate('projects').exec(function(err, tareas){
		if(err){return next(err)}

		res.json(tareas)
	})
});

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

// *************************** TAREAS PROPIAS-***********************

//GET - Metodo para listar tareas pertenecientes a un usuario
router.get('/tareas_propias', function(req, res, next){
	Tareas.find({'users' : req.session.user._id})
	.populate('projects')
	.populate('users')
	.exec(function(err, tareas){
		if(err){return next(err)}
		
		res.json(tareas)
	})
});

//GET - Metodo para listar tareas pendientes de un usuario
router.get('/tareas_pend_propias', function(req, res, next){
	console.log('aqui estoy');
	Tareas.find({'users' : req.session.user._id})
		// .where('status').equals('PAUSA')
		.or([{status : 'PAUSA'}, {status : 'PROCESO'}, {status : 'ESPERA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
});

//GET - Metodo para listar tareas finalizadas de un usuario
router.get('/tareas_fin_propias', function(req, res, next){
	console.log('aqui estoy');
	Tareas.find({'users' : req.session.user._id})
		// .where('status').equals('PAUSA')
		.or([{status : 'TERMINADA'}, {status : 'CANCELADA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
});

// *************************** FIN TAREAS PROPIAS ***********************

// *************************** TAREAS Asignadas a un proyecto ***********************

//GET - Metodo para listar tareas pertenecientes a un usuario
router.get('/tareas_project/:id', function(req, res, next){
	Tareas.find({'projects' : req.params.id})
	.populate('projects')
	.populate('users')
	.exec(function(err, tareas){
		if(err){return next(err)}
		
		res.json(tareas)
	})
});

//GET - Metodo para listar tareas pendientes de un usuario
router.get('/tareas_pend_project/:id', function(req, res, next){
	// console.log('aqui estoy');
	Tareas.find({'projects' : req.params.id})
		// .where('status').equals('PAUSA')
		.or([{status : 'PAUSA'}, {status : 'PROCESO'}, {status : 'ESPERA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
});

//GET - Metodo para listar tareas finalizadas de un usuario
router.get('/tareas_fin_project/:id', function(req, res, next){
	// console.log('aqui estoy');
	Tareas.find({'projects' : req.params.id})
		// .where('status').equals('PAUSA')
		.or([{status : 'TERMINADA'}, {status : 'CANCELADA'}])
		.populate('users')
		.populate('projects')
		.exec(function(err, tareas){
			if(err){return next(err)}

			res.json(tareas)
		});
});

// *************************** FIN TAREAS PROPIAS ***********************

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
		tarea.fecha_inicio = req.body.fecha_inicio;
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

// funcion para enviar correos
router.post('/sendMail', function(req, res, next){
	console.log('sendmail express');
	var data = req.body;
	var html_template = "<html><head></head><body>";
	var html_template_end = "</body></html>";
	
	console.log('html_template');

	html_template = html_template + '<h1>'+data.subject+'</h1>';
	// console.log('Antes de for');

	for (var i = 0; i < data.tareas.length; i++) {
		html_template = html_template +  "<h2> <b>Tarea: </b>"+ data.tareas[i].nombre +"</h2>";
		html_template = html_template + "<span><b>Status: </b>"+ data.tareas[i].status +" <b>Tipo: </b> "+ data.tareas[i].tipo +"</span><br>";

		
		if (data.tareas[i].fecha_inicio) {
			html_template = html_template + "<span><b>Fecha Inicio: </b>"+ new Date(data.tareas[i].fecha_inicio) +"</span><br>";
			// console.log('1');
		}

		if (data.tareas[i].fecha_plan) {
			html_template = html_template + "<span><b>Fecha Plan: </b>"+ new Date(data.tareas[i].fecha_plan) +"</span><br>";
			// console.log('2');
		}

		if (data.tareas[i].fecha_termino) {
			html_template = html_template + "<span><b>Fecha Término: </b>"+ new Date(data.tareas[i].fecha_termino) +"</span><br>";
			// console.log('3');
		} 

		if (data.tareas[i].projects) {
			html_template = html_template + "<h4>Proyecto</h4><p>"+ data.tareas[i].projects.titulo +"</p>";
			// console.log('4');
		}

		if (data.tareas[i].users) {
			html_template = html_template + "<h4>Usuarios</h4><p>";
			// console.log('5');
			for (var x = 0; x < data.tareas[i].users.length; x++) {
				html_template = html_template + data.tareas[i].users[x].username +",";
				// console.log('6');
			};
			html_template = html_template +"</p>"
		}

		if (data.tareas[i].descripcion) {
			// console.log('7');
			html_template = html_template + "<h4>Descripción</h4><p>"+data.tareas[i].descripcion+"</p>"
		} 
	};

	// console.log('aca esta la bronca');
	html_template = html_template + html_template_end;
	// console.log('aqui esta el pedo');


	transporter.sendMail({
	    from: 'no-reply@gmail.com',
	    to: 'jorge.alejandro.puente@gmail.com',
	    subject: data.subject,
	    html: html_template
	}, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
	    }
	});

	res.json('success');
});

// Exportación a excel
router.post('/excelExport', function(req, res){
	var now = new Date().valueOf();
	var workbook = excelbuilder.createWorkbook('./', 'Tareas_'+ now +'.xlsx');

    var data = req.body;
	// nombre __
	// descripcion __
	// tipo __
	// fecha_inicio __
	// fecha_plan __
	// fecha_termino __
	// status __
	// users __
	// projects __
	// created
	// createdby
	// prioridad

	// Create a new worksheet with 15 columns and 400 rows 
	var tareasSheet = workbook.createSheet('Tareas', 15, 400);

	var columns = ['NOMBRE DE LA TAREA', 'DESCRIPCIÓN', 'TIPO', 'STATUS', 'FECHA INICIO', 'FECHA PLAN', 'FECHA TÉRMINO', 'USUARIOS', 'PROYECTO'];
	var columnIndex = 3;
	var rowIndew = 3;


	tareasSheet.set(3, rowIndew, 'NOMBRE DE LA TAREA');
		tareasSheet.width(3, 30);
		tareasSheet.align(3, rowIndew, 'center');
		tareasSheet.font(3, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(4, rowIndew, 'DESCRIPCIÓN');
		tareasSheet.width(4, 70);
		tareasSheet.align(4, rowIndew, 'center');
		tareasSheet.font(4, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(5, rowIndew, 'TIPO');
		tareasSheet.width(5, 20);
		tareasSheet.align(5, rowIndew, 'center');
		tareasSheet.font(5, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(6, rowIndew, 'STATUS');
		tareasSheet.width(6, 20);
		tareasSheet.align(6, rowIndew, 'center');
		tareasSheet.font(6, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(7, rowIndew, 'FECHA INICIO');
		tareasSheet.width(7, 20);
		tareasSheet.align(7, rowIndew, 'center');
		tareasSheet.font(7, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(8, rowIndew, 'FECHA PLAN');
		tareasSheet.width(8, 20);
		tareasSheet.align(8, rowIndew, 'center');
		tareasSheet.font(8, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(9, rowIndew, 'FECHA TÉRMINO');
		tareasSheet.width(9, 20);
		tareasSheet.align(9, rowIndew, 'center');
		tareasSheet.font(9, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(10, rowIndew, 'USUARIOS');
		tareasSheet.width(10, 70);
		tareasSheet.align(10, rowIndew, 'center');
		tareasSheet.font(10, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});
	tareasSheet.set(11, rowIndew, 'PROYECTO');
		tareasSheet.width(11, 70);
		tareasSheet.align(11, rowIndew, 'center');
		tareasSheet.font(11, rowIndew, {family:'3',scheme:'-',bold:'true',iter:'true'});

	//cambiamos de fila
	rowIndew++;

	//regresamos a la primer columna
	columnIndex = 3;

	var usuarios = '';

	for (var i = 0; i < data.tareas.length; i++){
		usuarios = '';
		tareasSheet.set(3, rowIndew, data.tareas[i].nombre);
		tareasSheet.set(4, rowIndew, data.tareas[i].descripcion || '-');
		tareasSheet.set(5, rowIndew, data.tareas[i].tipo);
		tareasSheet.set(6, rowIndew, data.tareas[i].status);
		tareasSheet.set(7, rowIndew, data.tareas[i].fecha_inicio);
		tareasSheet.set(8, rowIndew, data.tareas[i].fecha_plan);
		tareasSheet.set(9, rowIndew, data.tareas[i].fecha_termino);

		if (data.tareas[i].users) {
			for (var z = 0; z < data.tareas[i].users.length; z++) {
		      usuarios = usuarios + data.tareas[i].users[z].username + ',';
		    };
			tareasSheet.set(10, rowIndew, usuarios);
		}

		if (data.tareas[i].projects) {
			tareasSheet.set(11, rowIndew, data.tareas[i].projects.titulo);
		}

		rowIndew++;
	}
	// Save it 
	workbook.save(function(ok){
		if (!ok) {
			workbook.cancel();
			res.json(true);
			console.log('true');
		}else{
			console.log('false');
			res.json(false);
		}
	});
});


module.exports = router;