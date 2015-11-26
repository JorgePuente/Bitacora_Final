angular.module('appLogin', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'views/login/login.html',
				controller: 'ctrlLogin'
			});

		$urlRouterProvider.otherwise('login'); // si no declaras un estado inicial, se va a ir a alta por default
	})
	//hay que inyectarle el http para poder consumir los metodos GET, PUT, DELETE, etc
	.factory('comunUsuario', function($http){ // permite mantener informacion vigente a traves de todas las vistas
		var comunUsuario = {};
		comunUsuario.usuarios = [];

		comunUsuario.usuario = {};


		//******************** Seccion de metodos remotos*************
		comunUsuario.getAll = function(){
			return $http.get('/login/usuarios') //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comunUsuario.usuarios);
				
				return comunUsuario.usuarios;
			})
		}

		comunUsuario.session_start = function(){
			console.log('session_start');
			return $http.get('/login/usuario/'+comunUsuario.usuario.id) //http.get parsea el objeto de datos de la base de datos a un arreglo
			.success(function(data){
				angular.copy(data, comunUsuario.usuarios);
				
				return comunUsuario.usuarios;
			})
		}

		return comunUsuario;
	}) 
	.controller('ctrlLogin', function($scope, $state, $location, comunUsuario){
		$scope.usuario = {};
		// $scope.tareas = [];

		comunUsuario.getAll();

		$scope.usuarios = comunUsuario.usuarios;

		$scope.iniciar_sesion = function(){
			if ($scope.form_login.$valid) {

				var length = comunUsuario.usuarios.length;
				var mail = 0;
				var objUsuarios = comunUsuario.usuarios;

				for (var i = 0; i < length; i++) {

					// console.log(objUsuarios[i].correo_electronico, '-----', $scope.usuario.correo_electronico);
					
					if (objUsuarios[i].correo_electronico == $scope.usuario.correo_electronico) {
						mail++;
						// console.log(objUsuarios[i].password, '-----', $scope.usuario.password);
						if (objUsuarios[i].password == $scope.usuario.password) {
							comunUsuario.usuario.id = objUsuarios[i]._id;
							comunUsuario.session_start();
							setTimeout(function(){
								window.location.href = '/'; // cambia de vista y renderea las tareas
							}, 1000);
							//console.log('inicie sesion');
							return;
						}
					}


				};

				if (mail > 0) {
					console.log('contraseña incorrecta');
				}else {
					console.log('usuario incorrecto');
				}

			}

		}; // function iniciar_sesion
	})