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

angular.module('3dChains')
      .service('threeSetup', function(){
        var dimensions = {
          height: window.innerHeight,
          width: window.innerWidth
        }

        //scene init
        scene = new THREE.Scene();
        //camera init
        camera = new THREE.PerspectiveCamera(45, dimensions.width/dimensions.height, 1, 100000)
        console.log(camera);
        camera.position.z = -5000;
        camera.position.y = 0;
        camera.lookAt
        scene.add(camera)
        //renderer init
        renderer = new THREE.WebGLRenderer()
        renderer.setClearColor(0x111111, 1.0)
        renderer.setSize(dimensions.width,dimensions.height)
        //controls init
        controls = new THREE.OrbitControls(camera);
        controls.addEventListener( 'change', renderer.render );
        //append to DOM
        var container = document.getElementById('threejsd3').appendChild(renderer.domElement)

        spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.castShadow= true;
        spotLight.position.set( 0, 10000,0);
        scene.add( spotLight );

        var mouseVector = new THREE.Vector3();
        var raycaster = new THREE.Raycaster();

        container.addEventListener( 'mousemove', mouseMove, false );


        //creates raycaster, sets var intersects to an array of objects that intersect
        // a vector shot into the scene,...the [0] index of the array will be the closest object
        //that your mouse is "over"
        function mouseMove(e){
          mouseVector.x = 2 * (e.offsetX / dimensions.width) - 1;
          mouseVector.y = 1 - 2 * ( e.offsetY / dimensions.height );
          mouseVector.z = .5
          mouseVector.unproject( camera );
          raycaster.set( camera.position, mouseVector.sub( camera.position ).normalize() )
          var intersects = raycaster.intersectObjects( scene.children );
            if(intersects[0]){
              $rootScope.$emit('newObject', intersects[0]); // $rootScope.$on
            }
        }

        (function animate(){
          requestAnimationFrame(animate)
          renderer.render(scene, camera)
          controls.update();

        })()

      })

//
// angular.module('3dChains')
// .directive('threeVizthree', function( d3Service, THREEService, dataPrepChainService, $rootScope){
//   return {
//     scope: {
//       data:"@",
//     },
//     link: function(scope, el, attr){
// /////////////////////////////////////////
// ///////init scene///////////////
// var camera, scene, renderer, controls, spotLight, scales;
//
//
// //when threejs is loaded, initialize threejs functions
// $rootScope.$on('threejsLoaded', function(event, data){
//   init();
//   animate();
//
// })
// //lets us use Math() in the view
// scope.Math = window.Math
//       function init(){
//         var dimensions = {
//           height: window.innerHeight,
//           width: window.innerWidth
//         }
//
//         //scene init
//         scene = new THREE.Scene();
//         //camera init
//         camera = new THREE.PerspectiveCamera(45, dimensions.width/dimensions.height, 1, 100000)
//         console.log(camera);
//         camera.position.z = -5000;
//         camera.position.y = 0;
//         camera.lookAt
//         scene.add(camera)
//         //renderer init
//         renderer = new THREE.WebGLRenderer()
//         renderer.setClearColor(0x111111, 1.0)
//         renderer.setSize(dimensions.width,dimensions.height)
//         //controls init
//         controls = new THREE.OrbitControls(camera);
//         controls.addEventListener( 'change', renderer.render );
//         //append to DOM
//         var container = document.getElementById('threejsd3').appendChild(renderer.domElement)
//
//         spotLight = new THREE.SpotLight( 0xffffff );
//         spotLight.castShadow= true;
//         spotLight.position.set( 0, 10000,0);
//         scene.add( spotLight );
//
//         var mouseVector = new THREE.Vector3();
//         var raycaster = new THREE.Raycaster();
//
//         container.addEventListener( 'mousemove', mouseMove, false );
//
//
//         //creates raycaster, sets var intersects to an array of objects that intersect
//         // a vector shot into the scene,...the [0] index of the array will be the closest object
//         //that your mouse is "over"
//         function mouseMove(e){
//           mouseVector.x = 2 * (e.offsetX / dimensions.width) - 1;
//           mouseVector.y = 1 - 2 * ( e.offsetY / dimensions.height );
//           mouseVector.z = .5
//           mouseVector.unproject( camera );
//           raycaster.set( camera.position, mouseVector.sub( camera.position ).normalize() )
//           var intersects = raycaster.intersectObjects( scene.children );
//             if(intersects[0]){
//               $rootScope.$emit('newObject', intersects[0]); // $rootScope.$on
//             }
//         }
//       }
//
//       //animation
//       function animate(){
//         requestAnimationFrame(animate)
//         renderer.render(scene, camera)
//         controls.update();
//       }
//
//
//
// //////////////////////////////////////////
// ///////////////END INIT /////////////////////
//
//














// 
//
//
//     }
//   }
// })

angular.module('3dChains')
    .service('dataPrepChainService', function(d3Service){
      this.dataPrep = function(d, datum, type){
        switch(type){
          case "Number":
              return Number(d[datum]);
              break;

          case "Percent":
              return Number(d[datum].replace(/\+/g,"").replace(/\%/g,""));
              break;

    
         }
      }
      this.cardinals = function(data, params){
        var dataPrep = this.dataPrep
        var cardinalsArray = []
         data.map(function(stock){
          var cardinals = {
            yParams : {
              calls: {
                min:  d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.y, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.y, "Number")
                }) ,
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.y, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.y, "Number")
                }) ,
              }
            },

            sizeParams : {
              calls: {
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.size, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.size, "Number")
                })
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.size, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.size, "Number")
                })
              }
            },
            colorParams : {
              calls: {
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.color, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.color, "Number")
                })
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.color, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.color, "Number")
                })
              }
          }
         }
         cardinalsArray.push(cardinals)
       })
        return cardinalsArray
      }
    })

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

angular.module('3dChains')
.directive('threeVizthree', function( d3Service, THREEService, dataPrepChainService, $rootScope){
  return {
    scope: {
      data:"@",
    },
    link: function(scope, el, attr){
      var camera, scene, renderer, controls, spotLight;
      scope.Math = window.Math
      //must be done since firebase arrays have weird properties when passed into scope?
      scope.data = attr.data
      scope.params = {
        size : "open_interest",
        color : "iv",
        y : "delta",
        distanceBetween: 3000
      }

      scope.scales = {}



///////initializes scene///////////////
      function init(){
        console.log('test1');
        var dimensions = {
          height: window.innerHeight,
          width: window.innerWidth
        }

        //scene init
        scene = new THREE.Scene();
        //camera init
        camera = new THREE.PerspectiveCamera(45, dimensions.width/dimensions.height, 1, 100000)
        console.log(camera);
        camera.position.z = -5000;
        camera.position.y = 0;
        camera.lookAt
        scene.add(camera)
        //renderer init
        renderer = new THREE.WebGLRenderer()
        renderer.setClearColor(0x111111, 1.0)
        renderer.setSize(dimensions.width,dimensions.height)
        //controls init
        controls = new THREE.OrbitControls(camera);
        controls.addEventListener( 'change', renderer.render );
        //append to DOM
        var container = document.getElementById('threejsd3').appendChild(renderer.domElement)

        spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.castShadow= true;
        spotLight.position.set( 0, 10000,0);
        scene.add( spotLight );

        var mouseVector = new THREE.Vector3();
        var raycaster = new THREE.Raycaster();

        container.addEventListener( 'mousemove', mouseMove, false );


        //creates raycaster, sets var intersects to an array of objects that intersect
        // a vector shot into the scene,...the [0] index of the array will be the closest object
        //that your mouse is "over"
        function mouseMove(e){
          mouseVector.x = 2 * (e.offsetX / dimensions.width) - 1;
          mouseVector.y = 1 - 2 * ( e.offsetY / dimensions.height );
          mouseVector.z = .5
          mouseVector.unproject( camera );
          raycaster.set( camera.position, mouseVector.sub( camera.position ).normalize() )
          var intersects = raycaster.intersectObjects( scene.children );
            if(intersects[0]){
              $rootScope.$emit('newObject', intersects[0]); // $rootScope.$on
            }
        }
      }


      function addObjectsToScene(data){


        data.map(function(stock, index){
          var calls = 0
          var puts = 0
          scope.scales[stock] = {}



          //creates  the scales for each individual stock using that stock's property
          //in the scope.cardinals object

          scope.scales[stock].radius = d3.scale.linear()
          .domain([0,130000])
          .range([20, 500 ])


          scope.scales[stock].color = d3.scale.linear()
          .domain([0,1])
          .interpolate(d3.interpolateRgb)
          .range(['#aaddff','#ff0000'])


          scope.scales[stock].scaleY = d3.scale.linear()
          .domain([0,.5])
          .range([0,3000])

          scope.scales[stock].scaleZ = d3.scale.linear()
          .domain([d3.min(stock.chain, function(d){
            return d.numberStrike
          }), d3.max(stock.chain, function(d){
            return d.numberStrike
          })])
          .range([-8000,8000])

          //initialize object for each stock
          var spheres = {}
          var boxes = {}
          var chain = stock.chain
          spheres[stock]= {};

          boxes[stock]= {}
          spheres[stock].callSpheres = {}
          boxes[stock].putBoxes = {}
          //iterate through each strike
          for(var strikePrice in stock.chain){
            var obj = {
              call: {},
              put: {}
            }


            ////each stock will both have a call and a put chain, so an object must be made for
            //each call and each put, the scales
            for(var optionType in obj){
              if(optionType ==="call"){
                calls++
                //creates the 3d object using d3 scales, scope.scales is just an object with d3 scales in its keys
                obj[optionType].geometry = new THREE.SphereGeometry(scope.scales[stock].radius(stock.chain[strikePrice][optionType][scope.params.size]), 16, 32)
                obj[optionType].material = new THREE.MeshBasicMaterial({color: scope.scales[stock].color(stock.chain[strikePrice][optionType][scope.params.color])})
                obj[optionType].sphere   = new THREE.Mesh(obj[optionType].geometry, obj[optionType].material )
                obj[optionType].sphere.position.x = -5000 + index*scope.params.distanceBetween + 800
                obj[optionType].sphere.position.y = scope.scales[stock].scaleY(0.5-Math.abs(0.5-Math.abs(stock.chain[strikePrice][optionType][scope.params.y])))
                obj[optionType].sphere.position.z = scope.scales[stock].scaleZ(stock.chain[strikePrice].numberStrike)
                obj[optionType].sphere.params = {}

                // embeds each objects underlying info within the object for later use

                obj[optionType].sphere.params.stock = stock.symbol
                obj[optionType].sphere.params.colorRef = {param: scope.params.color, value:stock.chain[strikePrice][optionType][scope.params.color]}
                obj[optionType].sphere.params.sizeRef = {param: scope.params.size, value: stock.chain[strikePrice][optionType][scope.params.size] }
                obj[optionType].sphere.params.yRef = {param: scope.params.y , value: stock.chain[strikePrice][optionType][scope.params.y]}
                obj[optionType].sphere.params.strike = {strike: stock.chain[strikePrice].numberStrike}
                obj[optionType].sphere.params.optionType = {type: optionType}

                spheres[stock].callSpheres[strikePrice] = obj[optionType]
                scene.add( spheres[stock].callSpheres[strikePrice].sphere)
              }
              else{
                puts++
                //creates the 3d object using d3 scales, scope.scales is just an object with d3 scales in its keys
                obj[optionType].geometry = new THREE.BoxGeometry(scope.scales[stock].radius(stock.chain[strikePrice][optionType][scope.params.size]),scope.scales[stock].radius(stock.chain[strikePrice][optionType][scope.params.size]),scope.scales[stock].radius(stock.chain[strikePrice][optionType][scope.params.size]))
                obj[optionType].material = new THREE.MeshBasicMaterial({color: scope.scales[stock].color(stock.chain[strikePrice][optionType][scope.params.color])})
                obj[optionType].box   = new THREE.Mesh(obj[optionType].geometry, obj[optionType].material )
                obj[optionType].box.position.x = -5000 + index*scope.params.distanceBetween
                obj[optionType].box.position.y = scope.scales[stock].scaleY(0.5-Math.abs(0.5-Math.abs(stock.chain[strikePrice][optionType][scope.params.y])))
                obj[optionType].box.position.z = scope.scales[stock].scaleZ(stock.chain[strikePrice].numberStrike)
                obj[optionType].box.params = {}


                // embeds each objects underlying info within the object for later use
                obj[optionType].box.params.stock = stock.symbol
                obj[optionType].box.params.colorRef = {param: scope.params.color, value:stock.chain[strikePrice][optionType][scope.params.color]}
                obj[optionType].box.params.sizeRef = {param: scope.params.size, value: stock.chain[strikePrice][optionType][scope.params.size] }
                obj[optionType].box.params.yRef = {param: scope.params.y , value: stock.chain[strikePrice][optionType][scope.params.y]}
                obj[optionType].box.params.strike = {strike: stock.chain[strikePrice].numberStrike}
                obj[optionType].box.params.optionType = {type: optionType}
                boxes[stock].putBoxes[strikePrice] = obj[optionType]
                scene.add(boxes[stock].putBoxes[strikePrice].box)
              }
            }
          }
          console.log('CALLS', calls, 'PUTS: ', puts);
        })
      }




      var counter = 0

      //json stringify firebase objects as they change
      scope.$watch(function(){
        return scope.data
      }, function(n,o){
          var data = angular.fromJson(n)
          data.map(function(stock, i){
            var array = [];
            for(var strike in stock.chain){
              array.push(stock.chain[strike])
            }
            data[i].chain = array;
          })
          addObjectsToScene(data)
      })

      //when threejs is loaded, initialize threejs functions
      $rootScope.$on('threejsLoaded', function(event, data){
        init();
        animate();

      })

      //animation
      function animate(){
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        controls.update();

      }
    }
  }
})
