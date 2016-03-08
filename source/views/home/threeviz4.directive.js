'use strict'

angular.module('helixDemo')
.directive('threeVizfour', function(d3Service, THREEService, vizfourData, $rootScope){
  return {
    restrict: "EA",
    scope: {
      data:"@",
      sortOptions: "@"
    },
    link: function(scope, el, attr){

      var camera, scene, renderer, controls, spotLight;
      var counter = 0
      scope.isShowing = "Volume"
      scope.data = attr.data
      // scope.sortOptions = attr.sortOptions





      function drawScene(data){
        var array = [];
        Object.keys(data).map(function(stock, i){
          array.push(data[stock])
        })
        data = array
        scope.sortBy = function(){
          scope.sortedBy = {}
          scope.rankedBy = {}
          angular.fromJson(scope.sortOptions).params.map(function(param){
            scope.sortedBy[param] =  data.sort(function(a,b){
              return vizfourData.dataPrep(param, a) - vizfourData.dataPrep(param, b)
            }).map(function(d){return d.Symbol})
            scope.rankedBy[param] = data.sort(function(a,b){
              return vizfourData.dataPrep(param, a) - vizfourData.dataPrep(param, b)
            }).map(function(e, i, arr){
              return vizfourData.dataPrep(param, e)
            })
            var seen = {};
            scope.rankedBy[param] =  scope.rankedBy[param].filter(function(item) {
              return seen.hasOwnProperty(item) ? false : (seen[item] = true);
            }).reverse();
          })

        }

        scope.sortBy()

        var elements = d3.selectAll('.element')
        .data(data).enter()
        .append('div')
        .attr('class', 'element')
        .style('height', '300px')
        .style('width', '200px')
        .style('background-color',function(d){
          if(d.ChangeinPercent){
            return d.ChangeinPercent.replace('%', "") < 0? "rgba(255,0,0,0.8)" : "rgba(0,255,0,.8)"
          } else{return "steelblue"}
        })
        .style('border-radius', '15%')
        .style('border','5px solid black')
        .on('mouseenter', function(d){this.style.borderColor = "yellow"})
        .on('mouseleave', function(d){this.style.borderColor = "black"})
        //  .style('opacity', '.6')

        elements.append('h1')
        .attr('class', 'companySymbol')
        .style('text-align', 'center')
        .style('color', 'black')
        .html(function (d) {
          return d.Symbol;
        })

        elements.append('h4')
        .attr('class', 'companyName')
        .style('text-align', 'center')
        .style('color', 'black')
        .html(function(d){
          console.log(d.Name);
          return d.Name
        })

        var svgs = elements.append('svg')
        .attr('height', '200px')
        .attr('width', '190px')
        .attr("transform", "translate(0)")
        .style('border-top', '1px solid black')

        var circle = svgs.append('circle')
        .attr('r', 80)
        .attr('cx', 95)
        .attr('cy', 95)
        .style('fill', 'transparent')
        .style('stroke', 'black')
        .style('stroke-width', '3')

        var mainData = svgs.append('text')
        .attr('y', '95')
        .attr('x', function(d){
          try{
            return 130
          }catch(e){
            return 130
          }
        })
        .style('font-size', '1em')
        .style('text-align', 'right')
        .text(function(d){
          return vizfourData.dataPrep(scope.isShowing, d)
        })
        var mainDataLabel = svgs.append('text')
        .attr('y', '95')
        .attr('x', function(d){
          try{
            return 65-(scope.isShowing.length*4)
          }catch(e){
            return 65
          }
        })
        .style('font-size', '1em')
        .style('text-align', 'left')
        .text(function(d){
          return scope.isShowing + ":"
        })
  var rankingLabel  = svgs.append('text')
        .attr('y', '115')
        .attr('x', function(d){
            return 50
        })
        .style('font-size', '1em')
        .style('text-align', 'left')
        .text(function(d){
          return "ranking :"
        })
    var ranking    = svgs.append('text')
        .attr('y', '115')
        .attr('x', function(d){
            return 115
        })
        .style('font-size', '1em')
        .style('text-align', 'left')
        .text(function(d){
          return       + scope.rankedBy[scope.isShowing].indexOf(+vizfourData.dataPrep(scope.isShowing, d));

        })

        elements.each(setData)
        elements.each(createObject)



        function createObject(d, i){
          var object = new THREE.CSS3DObject(this)
          object.position.x = d.positions.Volume.position.x
          object.position.y = d.positions.Volume.position.y
          object.position.z = d.positions.Volume.position.z
          object.rotation.y = d.positions.Volume.rotation.y
          object.Symbol = d.Symbol
          scene.add(object)
        }

        function setData(d,i){
          d.positions = {}
          angular.fromJson(scope.sortOptions).params.map(function(option){
            var index = scope.sortedBy[option].indexOf(d.Symbol)
            var angle = (Math.PI * 2)*((12*index)/360);
            var radius = (30*250)/(2*Math.PI)
            var pos = new THREE.Object3D();
            pos.position.x = Math.sin(angle) * radius
            pos.position.z = Math.cos(angle) * radius
            pos.position.y = (350/30)* index


            pos.rotation.y = (Math.PI*2)*(12*index/360)

            d.positions[option] = pos
          })
        }


        d3.select("#menu").selectAll('button')
        .data(angular.fromJson(scope.sortOptions).params).enter()
        .append('button')
        .html(function (d) { return d; })
        .on('click', function (d) { transformShape(d); })
      }




      ///changes text and transforms shape AFTER object position data has been set
      function transformShape(d){
        var duration = 1000;
        scope.isShowing = d
        TWEEN.removeAll();

        scene.children.forEach(function (object, i){
          if(i!=0){

            object.element.childNodes[2].childNodes[2].textContent = scope.isShowing;
            object.element.childNodes[2].childNodes[4].textContent = + scope.rankedBy[scope.isShowing].indexOf(+vizfourData.dataPrep( d, object.element.__data__));

            object.element.childNodes[2].childNodes[1].textContent = vizfourData.dataPrepText(d, object.element.__data__)  ;
            if(scope.isShowing=="MarketCapitalization"){
              object.element.childNodes[2].childNodes[2].textContent = "Mrkt Cap: "
            }
            if(scope.isShowing=="ChangeinPercent"){
              object.element.childNodes[2].childNodes[2].textContent = "Change %: "
            }


            var coords = new TWEEN.Tween(object.position)
            .to({x: object.element.__data__.positions[d].position.x, y: object.element.__data__.positions[d].position.y, z: object.element.__data__.positions[d].position.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
            var newRot = object.element.__data__.positions[d].rotation;
            var rotate = new TWEEN.Tween(object.rotation)
            .to({y: newRot.y}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
          }
        });

        var update = new TWEEN.Tween(this)
        .to({}, duration)
        .onUpdate(renderer.render(scene, camera))
        .start();
      }

      //when threejs is loaded, initialize threejs functions
      $rootScope.$on('threejsLoaded', function(event, data){
        var counter = 0
        scene = new THREE.Scene

        while(scene && counter<2){
          counter++
          if (counter < 2){
            init();
            animate();
          }
        }
      })

      function createScene(){
        scene = new THREE.Scene()
      }

      function updateScene(data){
        var array = [];
        Object.keys(data).map(function(stock, i){
          array.push(data[stock])
        })
        data = array

        scope.sortedBy = {}
        angular.fromJson(scope.sortOptions).params.map(function(param){
          scope.sortedBy[param] =  data.sort(function(a,b){
            return vizfourData.dataPrep(param, a) - vizfourData.dataPrep(param, b)
          }).map(function(d){return d.Symbol})
        })
        scene.children.forEach(function(object, i){

          if(i!=0){
            angular.fromJson(scope.sortOptions).params.map(function(option){
              var index = scope.sortedBy[option].indexOf(object.element.__data__.Symbol)

              var angle = (Math.PI * 2)*((12*index)/360);
              var radius = (30*250)/(2*Math.PI)
              var pos = new THREE.Object3D();
              pos.position.x = Math.sin(angle) * radius
              pos.position.z = Math.cos(angle) * radius
              pos.position.y = (350/30)* index
              pos.rotation.y = (Math.PI*2)*(12*index/360)

              var correctObj = data.filter(function(obj){
                return obj.Symbol == object.element.__data__.Symbol
              })
              object.element.__data__[option] = correctObj[0][option]
              object.element.__data__.positions[option] = pos
            })
          }
        })
        transformShape(scope.isShowing)

      }

      function init(){
        var dimensions = {
          height: window.innerHeight*.7,
          width: window.innerWidth*.9
        }

        //scene init


        //camera init
        camera = new THREE.PerspectiveCamera(45, dimensions.width/dimensions.height, 1, 100000)
        camera.position.z = 5000;
        camera.position.y = 0;
        camera.lookAt
        scene.add(camera)

        renderer = new THREE.CSS3DRenderer()
        renderer.setSize(dimensions.width,dimensions.height)

        var container = document.getElementById('threejsd3four').appendChild(renderer.domElement)

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 100000;
        controls.addEventListener('change', renderer.render);

      }

      function animate(){
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        controls.update();
        TWEEN.update();

      }

      scope.isBigEnough = function(stock, index, array) {
        if(scope.data[stock].Symbol){
          return true
        }
      }
      var lastTime = 0


      //because of the nature of firebase objects, they come in pieces, so this algorithm
      //makes sure not to update until it is all there, plus stops the refire that occurse when I
      //parse the data into an object
      scope.$watch(function(){
        return scope.data
      }, function(n,o){
        scope.data = angular.fromJson(n);
        var keyArray = Object.keys(angular.fromJson(n))
        if(THREE && keyArray.every(scope.isBigEnough)){
          counter++
          if(Date.now()-lastTime >=40000){
            updateScene(scope.data)
          }
          lastTime = Date.now()
          return counter == 2 ? drawScene(scope.data) : ''
        }
      })
    }
  }
})
