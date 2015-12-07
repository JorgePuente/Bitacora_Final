angular.module('appTareas', ['ui.router', 'ngMaterial', 'ngMdIcons'])
	.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
		$stateProvider
			.state('tareas', {// le indicamos el estado con el que trabajara state provider
				url: '/tareas',
				templateUrl: 'views/tareas/tareas.html',
				controller: 'ctrlTareas'
			})
			.state('proyectos', {// le indicamos el estado con el que trabajara state provider
				url: '/proyectos',
				templateUrl: 'views/proyectos/proyectos.html',
				controller: 'ctrlProyectos'
			})
			.state('usuarios', {// le indicamos el estado con el que trabajara state provider
				url: '/usuarios',
				templateUrl: 'views/usuarios/usuarios.html',
				controller: 'ctrlUsuarios'
			})

		$urlRouterProvider.otherwise('proyectos'); // si no declaras un estado inicial, se va a ir a proyectos por default

		 var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
		    'contrastDefaultColor': 'light'
		  });
		  $mdThemingProvider.definePalette('customBlue', customBlueMap);
		  $mdThemingProvider.theme('default')
		    .primaryPalette('customBlue', {
		      'default': '400',
		      'hue-1': '50'
		    })
		    .accentPalette('deep-orange');
		  $mdThemingProvider.theme('input', 'default')
		        .primaryPalette('grey')

	})
	//hay que inyectarle el http para poder consumir los metodos GET, PUT, DELETE, etc
	.factory('comun', function($http, $location){ // permite mantener informacion vigente a traves de todas las vistas
		var comun = {};
		comun.tareas = [];
		comun.tareas_pend = [];
		comun.tareas_fin = [];
		comun.tarea = {};
		comun.tareasTitulo = '';
		comun.proyectos = [];
		comun.proyecto = {};
		comun.usuarios = [];
		comun.listUsuarios = []; //variable del control de usuarios
		comun.singleUser = {}; // variable del control de usuarios
		comun.users = []; // variable que se utilizara para los chips de usuarios en tareas
		comun.usuario = {}; 
		comun.tipos = ['PLANIFICADA', 'MEJORA', 'CORRECCION'];
		comun.status = ['PAUSA', 'PROCESO', 'ESPERA', 'TERMINADA', 'CANCELADA'];
		comun.usuariosAsignados = [];
		comun.propias = false;
		comun.us_as = false;
		comun.saveStatus = {};
		comun.successExcel = false;

		comun.projects = false;

		comun.toastClass = "valid";

		// objeto que contendrá la información para la ventana de dialogo de confirmacion de eliminacion de elemento
		comun.confirm = {};

		//******************** Seccion de metodos para tareas*************
		comun.getAll = function(){
			return $http.get('/tareas') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				
				comun.tareasTitulo = 'Todas las tareas';
				comun.getAllPend();
				comun.getAllFin();

				return comun.tareas;
			});
		}

		comun.getAllPend = function(){
			return $http.get('/tareas_pend') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas_pend);
				
				return comun.tareas_pend;
			});
		}

		comun.getAllFin = function(){
			return $http.get('/tareas_fin') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas_fin);
				
				return comun.tareas_fin;
			});
		}

		// ************* propias *****************
		comun.getTareasPropias = function() {
			return $http.get('/tareas_propias') // http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				
				comun.tareasTitulo = 'Tareas asignadas a mi';
				comun.getAllPendPropias();
				comun.getAllFinPropias();
				return comun.tareas;
			});
		}

		comun.getAllPendPropias = function(){
			return $http.get('/tareas_pend_propias') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas_pend);
				
				return comun.tareas_pend;
			});
		}

		comun.getAllFinPropias = function(){
			return $http.get('/tareas_fin_propias') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas_fin);
				
				return comun.tareas_fin;
			});
		}

		// **************** fin propias ***************


		comun.add = function(tarea){
			return $http.post('/tarea', tarea)
			.success(function(tarea){
				comun.tareas.push(tarea);

				if (tarea.status == 'ESPERA' || tarea.status == 'PROCESO' || tarea.status == 'PAUSA') {
					comun.tareas_pend.push(tarea);
				}else if (tarea.status == 'TERMINADA' || tarea.status == 'CANCELADA') {
					comun.tareas_fin.push(tarea);
				}
			})
		}

		comun.update = function(tarea){
			console.log('tarea', tarea)
			return $http.put('/tarea/' + tarea._id, tarea)
			.success(function(data){
				console.log('data',data);
				var indice = comun.tareas.indexOf(tarea);
				comun.tareas[indice] = data;

				if (comun.propias) {
					comun.getAllPendPropias();
					comun.getAllFinPropias();
				}else if(comun.projects){
					comun.getAllFinProject();
					comun.getAllPendProject();
				}else if(comun.us_as){
					comun.getAllFinUs();
					comun.getAllPendUs();
				}else{
					comun.getAllFin();
					comun.getAllPend();
				}
			})
		}

		comun.delete = function(tarea){
			return $http.delete('/tarea/' + tarea._id)
			.success(function(){
				var indice = comun.tareas.indexOf(tarea);
				comun.tareas.splice(indice, 1); // Se elimina 1 tarea

				if (comun.propias) {
					comun.getAllPendPropias();
					comun.getAllFinPropias();
				}else if(comun.projects){
					comun.getAllFinProject();
					comun.getAllPendProject();
				}else if(comun.us_as){
					comun.getAllFinUs();
					comun.getAllPendUs();
				}else{
					comun.getAllFin();
					comun.getAllPend();
				}

			})
		}

		//****************** Sección de métodos para proyectos*******************
		comun.getAllProjects = function(){
			return $http.get('/proyectos/proyectos') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.proyectos);
				return comun.proyectos;
			})
		}

		comun.addProject = function(project){
			return $http.post('/proyectos/proyecto', project)
			.success(function(project){
				comun.proyectos.push(project);
			})
		}

		comun.updateProject = function(project){
			return $http.put('/proyectos/proyecto/' + project._id, project)
			.success(function(data){
				var indice = comun.proyectos.indexOf(project);
				// console.log(indice, 'indice');

				comun.proyectos[indice] = data;
			})
		}

		comun.deleteProject = function(project){
			return $http.delete('/proyectos/proyecto/'+ project._id)
			.success(function(project){
				var indice = comun.proyectos.indexOf(project);
				comun.proyectos.splice(indice, 1);
			})
		}

		//********************** SECCION PARA SACAR LOS USUARIOS **************************//
		comun.getAllUsuarios = function(){
			return $http.get('/login/usuarios') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.usuarios);
				// angular.copy(data, comun.listUsuarios);

				// console.log('Aqui me trabo');
				// console.log('comun usuarios', comun.usuarios);
				
				//********************* llenar objeto para chips de usuarios
				comun.users = comun.transformUsuarios(comun.usuarios)
				//********************* termino de llenar objeto para chips de usuarios

				return comun.usuarios;
			})
		}

		comun.selectedUsers = [];


		//funciones para chips en formulario de tareas
		comun.selectedUsersFill = function(){
			// console.log('Aqui me trabo selectedUsersFill', comun.tarea);
			comun.selectedUsers = comun.transformUsuarios(comun.tarea.users);
		}


		comun.transformUsuarios = function(usuarios) {
			//********************* llenar objeto para chips de usuarios
				var users = [];
				// console.log('transformUsuarios');
				for (var i = 0; i < usuarios.length; i++) {
			  		users.push({'name': usuarios[i].username, 'mail': usuarios[i].correo_electronico, 'id' : usuarios[i]._id});
			  	};

			  	return users.map(function (user) {
				  		// console.log(user);
					    user._lowername = user.name.toLowerCase();
					    user._lowertype = user.mail.toLowerCase();
					    return user;
					});
		}

		//funciones para control de usuarios///////////////////////////////
		
		comun.addUser = function(usuario){
			return $http.post('/login/register', user)
			.success(function(user){
				if (user.name != 'BadRequestError') {
					console.log('user',user);
					comun.usuarios.push(user);

				}else{
					comun.saveStatus = user;
				}
			})
		}

		comun.updateUser = function(usuario){
			comun.deleteUser(usuario);

			return $http.post('/login/register', usuario)
			.success(function(usuario){
				if (usuario.name != 'BadRequestError') {
					console.log('user',usuario);
					comun.usuarios.push(usuario);

				}else{
					comun.saveStatus = user;
				}
			})
		}

		comun.deleteUser = function(user) {
			return $http.delete('/login/usuario/' + user._id)
			.success(function(){
				var indice = comun.usuarios.indexOf(user);
				comun.usuarios.splice(indice, 1);

			})
		}
		// **************** tareas por usuario *******************
		comun.findUserAssignments = function(item){
			return $http.get('/tareas_user/'+item._id) //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				// console.log(item);
				comun.tareasTitulo = 'Tareas del usuario "' + item.username +'"';
				comun.getAllPendUser(item._id);
				comun.getAllFinUser(item._id);

				return comun.tareas;
			});
		}

		comun.getAllPendUser = function(project_id){
			return $http.get('/tareas_pend_user/'+project_id) 
			.success(function(data){
				angular.copy(data, comun.tareas_pend);
				
				return comun.tareas_pend;
			});
		}

		comun.getAllFinUser = function(project_id){
			return $http.get('/tareas_fin_user/'+project_id) 
			.success(function(data){
				angular.copy(data, comun.tareas_fin);
				
				return comun.tareas_fin;
			});
		}
		// **************** fin tareas por usuario *******************

		

		//********************** TAREAS PROPIAS DE UN PROYECTO ********************//

		comun.findProjectAssignments = function(item){
			return $http.get('/tareas_project/'+item._id) //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				// console.log(item);
				comun.tareasTitulo = 'Tareas del proyecto "' + item.titulo +'"';
				comun.getAllPendProject(item._id);
				comun.getAllFinProject(item._id);

				return comun.tareas;
			});
		}

		comun.getAllPendProject = function(project_id){
			return $http.get('/tareas_pend_project/'+project_id) 
			.success(function(data){
				angular.copy(data, comun.tareas_pend);
				
				return comun.tareas_pend;
			});
		}

		comun.getAllFinProject = function(project_id){
			return $http.get('/tareas_fin_project/'+project_id) 
			.success(function(data){
				angular.copy(data, comun.tareas_fin);
				
				return comun.tareas_fin;
			});
		}

		//************************* FIN TATEAS PROPIAS DE UN PROYECTO**************************//

		comun.logout = function(){
			console.log('entro');
			$http.get('/logout')
			.success(function(){
				console.log('logout');
				location.reload();
			});

		}

		comun.sendMail = function() {
			var data = {};
			data.tareas = comun.tareas;
			data.subject = comun.tareasTitulo;

			console.log('sendMail comun');
			$http.post('/sendMail', data)
			.success(function(){
				console.log('success');
			});
		}

		comun.excelExport = function() {
			var data = {};
			data.tareas = comun.tareas;
			data.subject = comun.tareasTitulo;

			console.log('excelExport comun');
			$http.post('/excelExport', data)
			.success(function(success){
				console.log('succes', success);
				comun.successExcel = success;
			});
		}

		return comun;
	})
	.controller('ctrlMenu', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		
		$scope.openProjects = function() {
			$state.go('proyectos');
		}

		$scope.openAssignments = function() {
			comun.propias = false;
			comun.projects = false;
			comun.us_as = false;
			comun.getAll();
			comun.tareasTitulo = "Todas las tareas";

			$state.go('tareas', {}, {reload: true});
			// $state.go('tareas');
		}

		$scope.openMyAssignments = function() {
			comun.propias = true;
			comun.us_as = false;
			comun.projects = false;
			comun.getTareasPropias();
			comun.tareasTitulo = "Tareas asignadas a mi";
			$state.go('tareas', {}, {reload: true}); // esta linea recarga el scope de tareas, no hacia bien el cambio de titulo entre tareas y tareas propias
			// $state.go('tareas');
		}

		$scope.openUsers = function() {
			$state.go('usuarios');
			// $state.go('tareas');
		}

		$scope.logout = function(){
			comun.logout();
		}
	})
	.controller('ctrlProyectos', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		$scope.proyecto = {};

		comun.getAllProjects();

		$scope.proyectos = comun.proyectos;

		$scope.showAddProject = function(ev) {
		    $mdDialog.show({
		      controller: 'proyectoModal',
		      templateUrl: 'views/proyectos/formulario.html',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.proyecto = {};
		    	$scope.proyecto = {};
		    }, function() {
		    	comun.proyecto = {};
		    	$scope.proyecto = {};
		    	console.log('not then');
		      $scope.alert = 'You cancelled the dialog.';
		    });
		};

		$scope.editProject = function(project, ev){
			comun.proyecto = project;
			$scope.showAddProject(ev);
			// comun.updateProject(project);
		}

		$scope.projectAssignments = function(item){
			comun.propias = false;
			comun.us_as = false;
			comun.projects = true;
			comun.findProjectAssignments(item);
			comun.tareasTitulo = 'Tareas del proyecto "'+ item.titulo +'"';
			$state.go('tareas');
		}

		$scope.showConfirmProyecto = function(ev, item) {
		    comun.confirm = {
		    	model : 'Proyecto',
		    	delete : false,
		    	item : item,
		    	msg : '¿Realmente desea eliminar el proyecto "'+ item.titulo +'"'
		    };
		    $mdDialog.show({
		      controller: 'ctrlConfirm',
		      templateUrl: 'views/general/confirm.html',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.confirm = {};
		    }, function() {
		    	comun.confirm = {};
		    	console.log('not then');
		    });
		};
	})
	.controller('ctrlTareas', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		
		$scope.alert = '';
		$scope.today = new Date();
		$scope.tareasTitulo = comun.tareasTitulo;

		// comun.getAll();
		comun.getAllUsuarios();

		console.log(comun.tareasTitulo);

		$scope.tareas = comun.tareas;
		$scope.tarea = {};
		$scope.tareas_pend = comun.tareas_pend;
		$scope.tareas_fin = comun.tareas_fin;
		$scope.prioridades = ['Baja', 'Normal', 'Alta'];
		$scope.tipos = comun.tipos;

		$scope.sacaDiferencia = function(fecha_plan){
			var fecha_p = new Date(fecha_plan);
			// console.log(fecha_p);
			// console.log($scope.today);
			// console.log(fecha_p - $scope.today);
			var dif = fecha_p - $scope.today
			if (dif > 0) {
				var timeDiff = Math.abs(fecha_p.getTime() - $scope.today.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				return "Faltan aún "+ diffDays+"día(s)";
			}else {
				var timeDiff = Math.abs($scope.today.getTime() - fecha_p.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				return "Vas "+ diffDays+"día(s) atrasado";
			}
			// return diffDays;
		}

		$scope.showAddTarea = function(ev) {
			console.log(comun.tarea._id);
			if (typeof comun.tarea._id != 'undefined') {
				comun.selectedUsersFill();
			}

		    $mdDialog.show({
		      controller: 'tareaModal',
		      templateUrl: 'views/tareas/formulario.html',
		      targetEvent: ev
		    })

		    .then(function(answer) {
		    	// console.log($scope.tarea);
		    	comun.tarea = {};
		    	$scope.tarea = {};
		    	comun.selectedUsers = [];
		    }, function() {
		    	comun.tarea = {};
		    	$scope.tarea = {};
		    	comun.selectedUsers = [];
		    	console.log('not then');
		      $scope.alert = 'You cancelled the dialog.';
		    });
		};

		
		$scope.toggleSearch = function(element) {
		    $scope.showSearch = !$scope.showSearch;
		};

		$scope.toggleSidenav = function(menuId) {
		    $mdSidenav(menuId).toggle();
		};

		$scope.editTarea = function(tarea, ev){
			console.log('tarea', tarea);
			comun.tarea = tarea;
			$scope.showAddTarea(ev);
			
		}

		$scope.showConfirmTarea = function(ev, item) {
		    comun.confirm = {
		    	model : 'Tarea',
		    	delete : false,
		    	item : item,
		    	msg : '¿Realmente desea eliminar la tarea "'+ item.nombre +'"'
		    };
		    console.log('aqui llego');
		    $mdDialog.show({
		      controller: 'ctrlConfirm',
		      templateUrl: 'views/general/confirm.html',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.confirm = {};
		    }, function() {
		    	comun.confirm = {};
		    	console.log('not then');
		    });
		};


		$scope.showListBottomSheet = function($event) {
		    $scope.alert = '';
		    $mdBottomSheet.show({
		      templateUrl: 'views/general/listBottom.html',
		      controller: 'ctrlListBottom',
		      targetEvent: $event
		    }).then(function(clickedItem) {
		      // $scope.alert = clickedItem.name + ' clicked!';
		    });
		};
		
	})
	.controller('proyectoModal', function($scope, $mdDialog, comun, $mdToast, $document){
		$scope.proyecto = comun.proyecto;
		
		// ******************** TOAST *************************
		var last = {
		    bottom: false,
		    top: true,
		    left: false,
		    right: true
		};

		$scope.toastPosition = angular.extend({},last);

		$scope.getToastPosition = function() {
		  $scope.sanitizePosition();

		  return Object.keys($scope.toastPosition)
		    .filter(function(pos) { return $scope.toastPosition[pos]; })
		    .join(' ');
		};

		$scope.sanitizePosition = function() {
		  var current = $scope.toastPosition;

		  if ( current.bottom && last.top ) current.top = false;
		  if ( current.top && last.bottom ) current.bottom = false;
		  if ( current.right && last.left ) current.left = false;
		  if ( current.left && last.right ) current.right = false;

		  last = angular.extend({},current);
		}

		$scope.showInvalidToast = function() {
			comun.toastClass = "error";
		  	$mdToast.show({
		  		controller: 'ctrlToast',
		  		templateUrl: 'views/general/invalidToast.html',
		  		parent : $document[0].querySelector('#projForm'),
		  		hideDelay: 5000,
		  		position: $scope.getToastPosition()
		  	});
		};
		// ******************** FIN TOAST *************************

		$scope.hide = function() {
		    $mdDialog.hide();
		    comun.proyecto = {};
		    console.log('hide');
		};

		$scope.cancel = function() {
		    $mdDialog.cancel();
		    comun.proyecto = {};
		    console.log('cancel');
		};
		
		$scope.answer = function(tipo) {
		  	
		  	if (tipo == 'proyecto') {
		  		if (typeof $scope.proyecto._id == 'undefined') {
		  			// console.log('etro');
		  			if ($scope.projectForm.$valid) {
				  		comun.addProject($scope.proyecto);
				  		$mdDialog.hide();
				  	}else{
				  		$scope.showInvalidToast();
				  	}
		  		}else{
		  			if ($scope.projectForm.$valid) {
			  			comun.updateProject($scope.proyecto);
			  			$scope.hide();
		  			}else {
		  				$scope.showInvalidToast();
		  			}
		  		}
			  	
		  	}
		};

	})
	.controller('tareaModal', function($scope, $mdDialog, comun, $mdToast, $document){
		$scope.tarea = comun.tarea;
		
		if (!comun.tarea.fecha_termino) {
			comun.tarea.fecha_termino = new Date();
		}

		console.log('comuntarea', comun.tarea);
		$scope.tipos = comun.tipos;
		$scope.status = comun.status;
		$scope.users = comun.users;

		// ******************** TOAST *************************
		var last = {
		    bottom: false,
		    top: true,
		    left: false,
		    right: true
		};

		$scope.toastPosition = angular.extend({},last);

		$scope.getToastPosition = function() {
		  $scope.sanitizePosition();

		  return Object.keys($scope.toastPosition)
		    .filter(function(pos) { return $scope.toastPosition[pos]; })
		    .join(' ');
		};

		$scope.sanitizePosition = function() {
		  var current = $scope.toastPosition;

		  if ( current.bottom && last.top ) current.top = false;
		  if ( current.top && last.bottom ) current.bottom = false;
		  if ( current.right && last.left ) current.left = false;
		  if ( current.left && last.right ) current.right = false;

		  last = angular.extend({},current);
		}

		$scope.showInvalidToast = function() {
			comun.toastClass = "error";
		  	$mdToast.show({
		  		controller: 'ctrlToast',
		  		templateUrl: 'views/general/invalidToast.html',
		  		parent : $document[0].querySelector('#tarForm'),
		  		hideDelay: 10000,
		  		position: $scope.getToastPosition()
		  	});
		};
		// ******************** FIN TOAST *************************

		
		// console.log('aqui llego');
		comun.getAllProjects();
		// console.log('aqui NO');
		$scope.proyectos = comun.proyectos;

		// parte de chips de usuarios*************************************************************************

		$scope.printVeg = function(){
			console.log('veggies', comun.users);
		}

		// if para cuando es editar, llenamos el $scope
		if (typeof comun.tarea._id != 'undefined') {
			console.log('length', comun.tarea);

			if($scope.tarea.fecha_inicio) { // si viene una fecha la convertimos
				$scope.tarea.fecha_inicio = new Date($scope.tarea.fecha_inicio);
			}

			if($scope.tarea.fecha_plan) { // si viene una fecha la convertimos
				$scope.tarea.fecha_plan = new Date($scope.tarea.fecha_plan);
			}

			if($scope.tarea.fecha_termino) { // si viene una fecha la convertimos
				$scope.tarea.fecha_termino = new Date($scope.tarea.fecha_termino);
			}

			// validar si no tiene proyecto , de lo contrario marca error
			if (typeof $scope.tarea.projects != 'undefined') {
				// console.log(typeof $scope.tarea.projects);
				$scope.proyectoSelected = $scope.tarea.projects._id;
				// console.log('despues');
			}

			console.log($scope.tarea);
		}

		// problema con el orden de las funciones, aparentemente lee todo en cascada(o demasiado rapido)
		$scope.querySearch = $scope.querySearch;
		$scope.selectedUsers = comun.selectedUsers;
		// console.log('selectedUsers', $scope.selectedUsers);
		$scope.autocompleteDemoRequireMatch = true;
		$scope.transformChip = $scope.transformChip;
		// $scope.vegetables = comun.users;
		// $scope.printV = $scope.printVeg();



		$scope.transformChip = function(chip) {
		  // console.log('transformChip');
		  // If it is an object, it's already a known chip
		  if (angular.isObject(chip)) {
		    return chip;
		  }
		  // Otherwise, create a new one
		  return { name: chip, type: 'new' }
		}
		/**
		 * Search for vegetables.
		 */
		$scope.querySearch = function (query) {
			// console.log(comun.users);
		  var results = query ? comun.users.filter($scope.createFilterFor(query)) : [];
		  return results;
		}
		/**
		 * Create filter function for a query string
		 */
		$scope.createFilterFor = function(query) {
			// console.log(query);
		  var lowercaseQuery = angular.lowercase(query);
		  return $scope.filterFn = function(vegetable) {
		  	// console.log(vegetable);
		    return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
		        (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
		  };
		}

		$scope.hide = function() {
		    comun.tarea = {};
		    comun.selectedUsers = [];
		    // console.log($scope.proyectoSelected);
		    console.log('hide');
		    $mdDialog.hide();
		};
		
		$scope.cancel = function() {
		    $mdDialog.cancel();
		    comun.tarea = {};
		    comun.selectedUsers = [];
		    console.log('cancel');
		};
		
		$scope.answer = function(tipo) {

			comun.usuariosAsignados = [];
			// console.log('is valid?', $scope.tareasForm.$valid);return;
			// console.log('new selectedUsers',$scope.selectedUsers);return;

			if ($scope.selectedUsers.length > 0) {
				for (var i = 0; i < $scope.selectedUsers.length; i++) {
					comun.usuariosAsignados.push($scope.selectedUsers[i].id);
				};
				$scope.tarea.users = comun.usuariosAsignados;
			}
// 
			// console.log($scope.proyectoSelected);

			if (typeof $scope.proyectoSelected != 'undefined') {
				$scope.tarea.projects = $scope.proyectoSelected;
			}
			// console.log($scope.tarea);
			// return;

	  		if (typeof $scope.tarea._id == 'undefined') {
	  			// console.log('etro');
	  			if ($scope.tareasForm.$valid) {
	  				
		  			// Vaciamos fecha termino, en caso de no este terminada la tarea
	  				if ($scope.tarea.status != 'TERMINADA') {
						delete $scope.tarea.fecha_termino;
					}

					comun.add($scope.tarea);
			  		$scope.hide();
			  	}else{		
					$scope.showInvalidToast();
			  	}
	  		}else{

	  			if ($scope.tareasForm.$valid) {

	  				// console.log($scope.tarea);
		  			
		  			// Vaciamos fecha termino, en caso de no este terminada la tarea
					if ($scope.tarea.status != 'TERMINADA') {
						delete $scope.tarea.fecha_termino;
					}
					

		  			comun.update($scope.tarea);
		  			$scope.hide();
			  	}else {
					$scope.showInvalidToast();
			  	}
	  		}
		};	
	})

	.controller('ctrlUsuarios', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog) {

		$scope.user = {};
		comun.getAllUsuarios();
		$scope.usuarios = comun.usuarios;

		$scope.showAddUser = function(ev) {
		    $mdDialog.show({
		      	controller: 'usuarioModal',
		      	templateUrl: 'views/usuarios/formulario.html',
		      	targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.usuario = {};
		    	// $scope.proyecto = {};
		    }, function() {
		    	comun.usuario = {};
		    	// $scope.proyecto = {};
		    	console.log('not then');
		    });
		};

		$scope.editUser = function(user, ev){
			console.log('edit iser', user);
			comun.usuario = user;
			$scope.showAddUser(ev);
			// comun.updateProject(project);
		}

		$scope.userAssignments = function(item){
			comun.propias = false;
			comun.projects = false;
			comun.us_as = true;
			comun.findUserAssignments(item);
			comun.tareasTitulo = 'Tareas del usuario "'+ item.username +'"';
			$state.go('tareas');
		}

		$scope.showConfirmUser = function(ev, item) {
		    comun.confirm = {
		    	model : 'Usuario',
		    	delete : false,
		    	item : item,
		    	msg : '¿Realmente desea eliminar al usuario "'+ item.username +'"'
		    };
		    $mdDialog.show({
		      controller: 'ctrlConfirm',
		      templateUrl: 'views/general/confirm.html',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.confirm = {};
		    }, function() {
		    	comun.confirm = {};
		    	console.log('not then');
		    });
		};

	})

	.controller('usuarioModal', function($scope, $mdDialog, comun, $mdToast, $document){
		$scope.usuario = comun.usuario;
		
		// ******************** TOAST *************************
		var last = {
		    bottom: false,
		    top: true,
		    left: false,
		    right: true
		};

		$scope.toastPosition = angular.extend({},last);

		$scope.getToastPosition = function() {
		  $scope.sanitizePosition();

		  return Object.keys($scope.toastPosition)
		    .filter(function(pos) { return $scope.toastPosition[pos]; })
		    .join(' ');
		};

		$scope.sanitizePosition = function() {
		  var current = $scope.toastPosition;

		  if ( current.bottom && last.top ) current.top = false;
		  if ( current.top && last.bottom ) current.bottom = false;
		  if ( current.right && last.left ) current.left = false;
		  if ( current.left && last.right ) current.right = false;

		  last = angular.extend({},current);
		}

		$scope.showInvalidToast = function() {
			comun.toastClass = "error";
		  	$mdToast.show({
		  		controller: 'ctrlToast',
		  		templateUrl: 'views/general/invalidToast.html',
		  		parent : $document[0].querySelector('#usForm'),
		  		hideDelay: 6000,
		  		position: $scope.getToastPosition()
		  	});
		};

		//******************** FIN TOAST *********************

		$scope.hide = function() {
		    $mdDialog.hide();
		    comun.usuario = {};
		    console.log('hide');
		};
		
		$scope.cancel = function() {
		    $mdDialog.cancel();
		    comun.usuario = {};
		    console.log('cancel');
		};
		
		$scope.answer = function(tipo) {
			console.log('answer');
		  	
		  	if (typeof $scope.usuario._id == 'undefined') {
	  			if ($scope.userForm.$valid) {
			  		
			  		comun.addUser($scope.usuario);
					setTimeout(function(){
				  		if (comun.saveStatus.name == "BadRequestError") {
							console.log('BadRequestError');

				  			$scope.showInvalidToast();
				  			return;
				  		}else{
				  			comun.saveStatus = {};
				  		}

						console.log('antes de hide');return;
				  		$mdDialog.hide();
						
					},1000);

			  	}else{		
					$scope.showInvalidToast();
			  	}
	  		}else{
	  			if ($scope.userForm.$valid) {

	  				comun.updateUser($scope.usuario);
	  				$scope.hide();
	  			}else {
	  				$scope.showInvalidToast();
	  			}
	  		}
		};
	})

	.controller('ctrlToast', function($scope, comun, $mdToast) {

		$scope.toastClass = comun.toastClass;
		$scope.saveStatus = comun.saveStatus;

		// console.log(comun.saveStatus);
		$scope.closeToast = function() {
		    $mdToast.hide();
		  };
	})

	.controller('ctrlListBottom', function($scope, comun, $mdBottomSheet, $mdToast, $document) {
		
		$scope.sendMail = function(){
			console.log('send mail');
			comun.sendMail();
			$mdBottomSheet.hide();
		}

		$scope.excelExport = function(){
			console.log('send mail');
			comun.excelExport();
			$mdBottomSheet.hide();


		}
		
	})

	.controller('ctrlConfirm', function($scope, comun, $mdBottomSheet, $mdSidenav, $mdDialog) {
		$scope.confirm = comun.confirm;

		$scope.button = function() {
			if (comun.confirm.model == 'Proyecto') {
				comun.deleteProject(comun.confirm.item);
			}else if(comun.confirm.model == 'Tarea'){
				comun.delete(comun.confirm.item);
			}else if(comun.confirm.model == 'Usuario'){
				comun.deleteUser(comun.confirm.item);
			}

			comun.confirm = {};
	    	$mdDialog.hide();
		}

		$scope.cancel = function() {
		    $mdDialog.cancel();
		    comun.confirm = {};
		};

	})

	.directive('projectThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:85px; height:85px; margin-top:25px;" src="images/tareas/eon.jpg"></img>'
	  };
	})
	.directive('principalThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:80px; height:80px; margin-bottom:7px;" src="images/tareas/eon.jpg"></img>'
	  };
	})
	.directive('pauseThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:25px;" src="images/tareas/pausa.png"></img>'
	  };
	})
	.directive('proccessThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:25px;" src="images/tareas/proceso.png"></img>'
	  };
	})
	.directive('waitThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:25px;" src="images/tareas/espera.png"></img>'
	  };
	})
	.directive('finishedThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:25px;" src="images/tareas/terminada.png"></img>'
	  };
	})
	.directive('cancelThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:25px;" src="images/tareas/cancelada.png"></img>'
	  };
	})
	.directive('userThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px; margin-top:20px;margin-right:15px;" src="images/users/user.png"></img>'
	  };
	})