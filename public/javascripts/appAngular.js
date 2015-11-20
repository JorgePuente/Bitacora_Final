angular.module('appTareas', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('alta', {// le indicamos el estado con el que trabajara state provider
				url: '/alta',
				templateUrl: 'views/alta.html',
				controller: 'ctrlAlta'
			})
			.state('editar', {// le indicamos el estado con el que trabajara state provider
				url: '/editar/{id}',
				templateUrl: 'views/editar.html',
				controller: 'ctrlEditar'
			});

		$urlRouterProvider.otherwise('alta'); // si no declaras un estado inicial, se va a ir a alta por default
	})
	//hay que inyectarle el http para poder consumir los metodos GET, PUT, DELETE, etc
	.factory('comun', function($http){ // permite mantener informacion vigente a traves de todas las vistas
		var comun = {};
		comun.tareas = [];

		comun.tarea = {};

		// comun.eliminar = function(tarea) {
		// 	var indice = comun.tareas.indexOf(tarea);
		// 	comun.tareas.splice(indice, 1); // Se elimina 1 tarea
		// }


		//******************** Seccion de metodos remotos*************
		comun.getAll = function(){
			return $http.get('/tareas') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comun.tareas);
				
				return comun.tareas;
			})
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

		return comun;
	}) 
	.controller('ctrlAlta', function($scope, $state, comun){
		$scope.tarea = {};
		// $scope.tareas = [];

		comun.getAll();

		$scope.tareas = comun.tareas
		$scope.prioridades = ['Baja', 'Normal', 'Alta'];

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
	.controller('ctrlEditar', function($scope, $state, comun){

		$scope.tarea = comun.tarea;

		$scope.actualizar = function(){
			comun.update($scope.tarea);
			$state.go('alta');
		}

		$scope.eliminar = function(){
			comun.delete($scope.tarea);
			$state.go('alta');
		}
	})