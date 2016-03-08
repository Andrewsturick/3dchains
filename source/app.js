angular.module('helixDemo', [
          'ui.router',
          'ui.bootstrap',
          'firebase',
          'threejs',
          'd3'
          ])
      .config(function($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('index', {
            url: '/',
            templateUrl: 'views/home/home.html',
            controller: 'HomeCtrl'
          })

        $urlRouterProvider.otherwise('/')
      })
