'use strict'
angular.module('helixDemo')
       .controller('HomeCtrl', function($scope, d3Service,  vizfourData, $firebaseObject, $location, $timeout,  THREEService){
                 var symbolTrackerRef    = new Firebase('https://rooftoptrading.firebaseio.com/market/')
                 var marketArr = vizfourData.marketArray()
                 $scope.equityRefs = {}
                 $scope.equityFBArrays = {}
                 $scope.optionsRefs = {}
                 $scope.optionsFBArrays = {}
                 marketArr.map(function(stock){
                   $scope.equityRefs[stock.Symbol] = new Firebase('https://rooftoptrading.firebaseio.com/market/' + stock.Symbol + '/currentEquityInfo')
                   $scope.equityFBArrays[stock.Symbol] = $firebaseObject($scope.equityRefs[stock.Symbol])
                 })

                $scope.market = $scope.equityFBArrays
                $scope.sortParams = {
                  params: [
                    "Volume",
                    "ChangeinPercent",
                    "ShortRatio",
                    "MarketCapitalization",
                    "DividendYield",
                    "bid/ask Spread",
                    "OneyrTargetGrowth%"
                  ]
                }
       })
