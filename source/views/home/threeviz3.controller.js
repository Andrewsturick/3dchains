angular.module('3dChains')
      .controller('3dChains', function($rootScope, $scope, d3Service, $firebaseArray, $timeout,  THREEService){
        var symbolTrackerRef    = new Firebase('https://rooftoptrading.firebaseio.com/portfolio/')
        var usersRef            = new Firebase('https://rooftoptrading.firebaseio.com/users')

       //  //converts to useable object
        $timeout(function() {
          $scope.symbolTrackerBuffer     = $firebaseArray(symbolTrackerRef).$loaded()
                                                .then(function(list){
                                                  $scope.symbolTracker = list
                                                })
        })

        $rootScope.$on('newObject', function (event, data) {
          $scope.infoShowing = data;
          $scope.$apply()
        });

        $scope.Math = window.Math
        $scope.checked = false; // This will be binded using the ps-open attribute
        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }


      })
