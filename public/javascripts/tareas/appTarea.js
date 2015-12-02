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
				templateUrl: 'views/tareas/proyectos.html',
				controller: 'ctrlProyectos'
			})

		$urlRouterProvider.otherwise('proyectos'); // si no declaras un estado inicial, se va a ir a alta por default

		 var customBlueMap = 		$mdThemingProvider.extendPalette('light-blue', {
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

		comun.proyecto_id = 0;

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

		comun.add = function(tarea){
			return $http.post('/tarea', tarea)
			.success(function(tarea){
				comun.tareas.push(tarea);
			})
		}

		comun.update = function(tarea){
			return $http.put('/tarea/' + tarea._id, tarea)
			.success(function(data){
				var indice = comun.tareas.indexOf(tarea);

				comun.tareas[indice] = data
			})
		}

		comun.delete = function(tarea){
			return $http.delete('/tarea/' + tarea._id)
			.success(function(){
				var indice = comun.tareas.indexOf(tarea);
				comun.tareas.splice(indice, 1); // Se elimina 1 tarea
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
				// console.log('comun usuarios', comun.usuarios);
				
				//********************* llenar objeto para chips de usuarios
				var users = [];
				for (var i = 0; i < comun.usuarios.length; i++) {
			  		users.push({'name': comun.usuarios[i].username, 'mail': comun.usuarios[i].correo_electronico});
			  	};

			  	comun.users = users.map(function (user) {
				  		// console.log(user);
					    user._lowername = user.name.toLowerCase();
					    user._lowertype = user.mail.toLowerCase();
					    return user;
					});

				//******************** termino de llenar objeto para chips de usuarios

				return comun.usuarios;
			})
		}

		return comun;
	}) 
	.controller('ctrlProyectos', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		$scope.proyecto = {};

		comun.getAllProjects();

		$scope.proyectos = comun.proyectos;

		$scope.showAddProject = function(ev) {
		    $mdDialog.show({
		      controller: 'proyectoModal',
		      template: '<md-dialog aria-label="Mango (Fruit)"> <md-content class="md-padding"> <form name="projectForm"> <div layout layout-lg="column">  <md-input-container flex> <label>Nombre del proyecto</label> <input ng-model="proyecto.titulo" ng-required="true"> </md-input-container> </div> <md-input-container flex> <label>Descripcion</label> <textarea ng-model="proyecto.descripcion" columns="1" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> <div class="md-actions" layout="row"> <span flex></span> <md-button ng-click="cancel()"> Cancelar </md-button> <md-button ng-click="answer(\'proyecto\')" class="md-primary"> Guardar </md-button> </div></md-dialog>',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.proyecto = {};
		    }, function() {
		    	comun.proyecto = {};
		    	console.log('not then');
		      $scope.alert = 'You cancelled the dialog.';
		    });
		};

		$scope.editProject = function(project, ev){
			comun.proyecto = project;
			$scope.showAddProject(ev);
			// comun.updateProject(project);
		}

		$scope.deleteProject = function(project){
			comun.deleteProject(project);
		}
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
		    $mdDialog.show({
		      controller: 'tareaModal',
		      template: '<md-dialog aria-label="Form"> <md-content class="md-padding"> <form name="tareasForm"> <div layout layout-sm="column"> <md-input-container flex> <label>Nombre de la tarea</label> <input ng-model="tarea.nombre"> </md-input-container> </div> <div layout layout-sm="column"> <md-input-container flex><label>Tipo</label><md-select ng-model="tarea.tipo" flex> <md-option class="icon_tipo" ng-repeat="tipo in tipos" value="{{tipo}}" flex> <ng-md-icon class="type_icon" icon="desktop_mac" ng-show="tipo == \'PLANIFICADA\'"></ng-md-icon> <ng-md-icon class="type_icon" icon="publish" ng-show="tipo == \'MEJORA\'"></ng-md-icon> <ng-md-icon class="type_icon" icon="healing" ng-show="tipo == \'CORRECCION\'"></ng-md-icon> <span> {{tipo}} </span> </img src=""> </md-option> </md-select> </md-input-container> </div> <div layout layout-sm="column"> <md-input-container flex><label>Status</label><md-select ng-model="tarea.status" flex> <md-option class="img_status" ng-repeat="stat in status" value="{{stat}}" flex> <pause-thumb ng-show="stat == \'PAUSA\'"></pause-thumb> <proccess-thumb ng-show="stat == \'PROCESO\'"></proccess-thumb> <wait-thumb ng-show="stat == \'ESPERA\'"></wait-thumb> <finished-thumb ng-show="stat == \'TERMINADA\'"></finished-thumb> <cancel-thumb ng-show="stat == \'CANCELADA\'"></cancel-thumb> <span> {{stat}} </span> </img src=""> </md-option> </md-select> </md-input-container> </div> <div layout layout-sm="column"> <md-input-container flex> <md-datepicker ng-model="tarea.fecha_plan" md-placeholder="Plan término" aria-label="Fecha plan" md-min-date="today"></md-datepicker> </md-input-container> <md-input-container flex> <md-datepicker ng-model="tarea.fecha_termino" md-placeholder="Fecha término" aria-label="Fecha plan" md-min-date="tarea.fecha_plan"></md-datepicker> </md-input-container> </div> <div layout layout-sm="column"> <div-input-container flex> <label>Usuarios Asignados</label> <md-chips ng-model="selectedUsers" md-autocomplete-snap md-transform-chip="transformChip($chip)" md-require-match="autocompleteDemoRequireMatch"> <md-autocomplete md-selected-item="selectedItem" md-search-text="searchText" md-items="item in querySearch(searchText)" md-item-text="item.name" placeholder="Nombre/correo"> <span md-highlight-text="searchText">{{item.name}} :: {{item.mail}}</span> </md-autocomplete> <md-chip-template> <span> <strong>{{$chip.name}}</strong> <em>({{$chip.mail}})</em> </span> </md-chip-template> </md-chips> </md-input-container> </div> <md-input-container flex> <label>Descripcion</label> <textarea ng-model="tarea.descripcion" columns="1" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> <div class="md-actions" layout="row"> <span flex></span> <md-button ng-click="hide()"> Cancel </md-button> <md-button ng-click="answer(\'useful\')" class="md-primary"> Save </md-button> </div></md-dialog>',
		      targetEvent: ev
		    })
		    .then(function(tipo, answer) {
		    	comun.proyecto = {};
		    }, function() {
		    	comun.proyecto = {};
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

		$scope.agregar = function(){
			console.log('agregar');
			comun.add({
				nombre : $scope.tarea.nombre,
				prioridad : parseInt($scope.tarea.prioridad)
			})

			$scope.tarea.nombre = "";
			$scope.tarea.prioridad = "";
		}

		$scope.masPrioridad = function(tarea) {
			tarea.prioridad += 1;
		}

		$scope.menosPrioridad = function(tarea) {
			tarea.prioridad -= 1;
		}

		$scope.eliminar = function(tarea) {
			comun.delete(tarea);
		}

		$scope.procesaObjeto = function(tarea){
			comun.tarea = tarea;
			$state.go('editar'); // vista a la que se va, parametros hacia la vista
		}


		
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
		  			comun.updateProject(comun.proyecto);
		  			$scope.hide();
		  		}
			  	
		  	}
		  };	
	})
	.controller('tareaModal', function($scope, $mdDialog, comun){
		$scope.tipos = comun.tipos;
		$scope.status = comun.status;
		$scope.users = comun.users;

		// parte de chips de usuarios*****************************

		$scope.printVeg = function(){
			console.log('veggies', comun.users);
		}

		// problema con el orden de las funciones, aparentemente lee todo en cascada(o demasiado rapido)
		$scope.querySearch = $scope.querySearch;
		$scope.selectedUsers = [];
		$scope.autocompleteDemoRequireMatch = true;
		$scope.transformChip = $scope.transformChip;
		// $scope.vegetables = comun.users;
		// $scope.printV = $scope.printVeg();



		$scope.transformChip = function(chip) {
		  console.log('transformChip');
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
			console.log(query);
		  var lowercaseQuery = angular.lowercase(query);
		  return $scope.filterFn = function(vegetable) {
		  	console.log(vegetable);
		    return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
		        (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
		  };
		}
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
		  			comun.updateProject(comun.proyecto);
		  			$scope.hide();
		  		}
			  	
		  	}
		  };	
	})
	// .controller('ctrlEditar', function($scope, $state, comun){

	// 	$scope.tarea = comun.tarea;

	// 	$scope.actualizar = function(){
	// 		comun.update($scope.tarea);
	// 		$state.go('alta');
	// 	}

	// 	$scope.eliminar = function(){
	// 		comun.delete($scope.tarea);
	// 		$state.go('alta');
	// 	}
	// })
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