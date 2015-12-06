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

		$urlRouterProvider.otherwise('proyectos'); // si no declaras un estado inicial, se va a ir a alta por default

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
	.factory('comun', function($http){ // permite mantener informacion vigente a traves de todas las vistas
		var comun = {};
		comun.tareas = [];
		comun.tareas_pend = [];
		comun.tareas_fin = [];
		comun.tarea = {};
		comun.proyectos = [];
		comun.proyecto = {};
		comun.usuarios = [];
		comun.users = []; // variable que se utilizara para los chips de usuarios en tareas
		comun.usuario = {};
		comun.tipos = ['PLANIFICADA', 'MEJORA', 'CORRECCION'];
		comun.status = ['PAUSA', 'PROCESO', 'ESPERA', 'TERMINADA', 'CANCELADA'];
		comun.usuariosAsignados = [];
		comun.propias = false;

		comun.projects = 0;

		// objeto que contendrá la información para la ventana de dialogo de confirmacion de eliminacion de elemento
		comun.confirm = {};

		//******************** Seccion de metodos para tareas*************
		comun.getAll = function(){
			return $http.get('/tareas') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				
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

				comun.getAllFin();
				comun.getAllPend();
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
				// console.log('Aqui me trabo');
				// console.log('comun usuarios', comun.usuarios);
				
				//********************* llenar objeto para chips de usuarios
				comun.users = comun.transformUsuarios(comun.usuarios)
				//********************* termino de llenar objeto para chips de usuarios

				return comun.usuarios;
			})
		}

		comun.selectedUsers = [];

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

		comun.findProjectAssignments = function(item){
			return $http.get('/tarea/proyect') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.usuarios);
				// console.log('comun usuarios', comun.usuarios);
				
				//********************* llenar objeto para chips de usuarios
				comun.users = comun.transformUsuarios(comun.usuarios)
				//********************* termino de llenar objeto para chips de usuarios

				return comun.usuarios;
			})
		}

		return comun;
	})
	.controller('ctrlMenu', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		
		$scope.openProjects = function() {
			$state.go('proyectos');
		}

		$scope.openAssignments = function() {
			comun.propias = false;
			$state.go('tareas');
		}

		$scope.openMyAssignments = function() {
			comun.propias = true;
			comun.getTareasPropias();
			$state.go('tareas');
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
			// console.log(item._id);
			comun.findProjectAssignments(item);
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

		comun.getAll();
		comun.getAllPend();
		comun.getAllFin();
		comun.getAllUsuarios();

		$scope.tareas = comun.tareas;
		$scope.tarea = {};
		$scope.tareas_pend = comun.tareas_pend;
		$scope.tareas_fin = comun.tareas_fin;
		$scope.prioridades = ['Baja', 'Normal', 'Alta'];
		$scope.tipos = comun.tipos;

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


		
	})
	.controller('proyectoModal', function($scope, $mdDialog, comun){
		$scope.proyecto = comun.proyecto;
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
				  	}; // poner else if para tareas, y asi utilizar el mismo modal
		  		}else{
		  			console.log('else', comun.proyecto);
		  			comun.updateProject($scope.proyecto);
		  			$scope.hide();
		  		}
			  	
		  	}
		  };	
	})
	.controller('tareaModal', function($scope, $mdDialog, comun){
		$scope.tarea = comun.tarea;
		console.log('comuntarea', comun.tarea);
		$scope.tipos = comun.tipos;
		$scope.status = comun.status;
		$scope.users = comun.users;

		
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
			// console.log('new selectedUsers',$scope.selectedUsers);return;

			if ($scope.selectedUsers.length > 0) {
				for (var i = 0; i < $scope.selectedUsers.length; i++) {
					comun.usuariosAsignados.push($scope.selectedUsers[i].id);
				};
				$scope.tarea.users = comun.usuariosAsignados;
			}
// 
			console.log($scope.proyectoSelected);

			if (typeof $scope.proyectoSelected != 'undefined') {
				$scope.tarea.projects = $scope.proyectoSelected;
			}
			// console.log($scope.tarea);
			// return;

	  		if (typeof $scope.tarea._id == 'undefined') {
	  			// console.log('etro');
	  			if ($scope.tareasForm.$valid) {
					comun.add($scope.tarea);
			  		$mdDialog.hide();
			  	}; // poner else if para tareas, y asi utilizar el mismo modal
	  		}else{

	  			// console.log('scope tarea',$scope.tarea);
	  			// console.log('comun',comun.tarea);
	  			comun.update(comun.tarea);
	  			$scope.hide();
	  		}
		  };	
	})

	.controller('ctrlConfirm', function($scope, comun, $mdBottomSheet, $mdSidenav, $mdDialog) {
		$scope.confirm = comun.confirm;

		$scope.button = function() {
			if (comun.confirm.model == 'Proyecto') {
				comun.deleteProject(comun.confirm.item);
			}else if(comun.confirm.model == 'Tarea'){
				comun.delete(comun.confirm.item);
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