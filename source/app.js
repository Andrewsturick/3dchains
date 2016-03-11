angular.module('3dChains', [
          'ui.router',
          'ui.bootstrap',
          'firebase',
          'threejs',
          'd3',
          'mc.resizer',
          'angucomplete-alt'

          ])
      .config(function($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('index', {
            url: '/',
            templateUrl: 'views/home/home.html',
            controller: '3dChains'
          })

        $urlRouterProvider.otherwise('/')
      })
