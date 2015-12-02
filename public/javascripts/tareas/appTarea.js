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

		var customBlueMap = $mdThemingProvider.extendPalette('light-blue');
		$mdThemingProvider.definePalette('customBlue', customBlueMap);
		$mdThemingProvider.theme('default')
		    .primaryPalette('customBlue', {
		      'default': '500',
		      'hue-1': '50'
		    })
		    .accentPalette('deep-orange');
		$mdThemingProvider.theme('input', 'default');
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

		return comun;
	}) 
	.controller('ctrlProyectos', function($scope, $state, comun, $mdBottomSheet, $mdSidenav, $mdDialog){
		$scope.proyecto = {};

		comun.getAllProjects();

		$scope.proyectos = comun.proyectos;

		$scope.showAddProject = function(ev) {
		    $mdDialog.show({
		      controller: 'altaModal',
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
		$scope.myDate = new Date();
  $scope.minDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() - 2,
      $scope.myDate.getDate());
  $scope.maxDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() + 2,
      $scope.myDate.getDate());
  $scope.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  }

		comun.getAll();
		comun.getAllPend();
		comun.getAllFin();

		$scope.tareas = comun.tareas;
		$scope.tarea = {};
		$scope.tareas_pend = comun.tareas_pend;
		$scope.tareas_fin = comun.tareas_fin;
		$scope.prioridades = ['Baja', 'Normal', 'Alta'];
		$scope.tipos = ['PLANIFICADA', 'MEJORA', 'CORRECCION'];


		$scope.showAddTarea = function(ev) {
		    $mdDialog.show({
		      controller: 'altaModal',
		      template: '<md-dialog aria-label="Mango (Fruit)"> <md-content class="md-padding"> <form name="userForm"> <div layout layout-sm="column"> <md-input-container flex> <label>Nombre de la Tarea</label> <input ng-model="tarea.titulo" placeholder="Nombre de la tarea"> </md-input-container></div> <div class="select" flex> <label>Tipo</label> <md-select ng-model="tarea.tipo"> <md-option value="PLANIFICADA">PLANIFICADA</md-option> <md-option value="MEJORA">MEJORA</md-option> <md-option value="CORRECCION">CORRECCION</md-option> </md-select></div> <div layout layout-sm="column"> <md-input-container flex> <label>City</label> <input ng-model="user.city"> </md-input-container> <md-input-container flex> <label>State</label> <input ng-model="user.state"> </md-input-container> <md-input-container flex> <label>Postal Code</label> <input ng-model="user.postalCode"> </md-input-container> </div> <md-input-container flex> <label>Biography</label> <textarea ng-model="user.biography" columns="1" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> <div class="md-actions" layout="row"> <span flex></span> <md-button ng-click="cancel()"> Cancel </md-button> <md-button ng-click="answer(\'tarea\')" class="md-primary"> Save </md-button> </div></md-dialog>',
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
	.controller('altaModal', function($scope, $mdDialog, comun){
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
	    template: '<img style="width:70px; height:70px;" src="images/tareas/eon.jpg"></img>'
	  };
	})
	.directive('pauseThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px;" src="images/tareas/pausa.png"></img>'
	  };
	})
	.directive('proccessThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px;" src="images/tareas/proceso.png"></img>'
	  };
	})
	.directive('waitThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px;" src="images/tareas/espera.png"></img>'
	  };
	})
	.directive('finishedThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px;" src="images/tareas/terminada.png"></img>'
	  };
	})
	.directive('cancelThumb', function() {
	  return {
	    replace: true,
	    template: '<img style="width:70px; height:70px;" src="images/tareas/cancelada.png"></img>'
	  };
	})