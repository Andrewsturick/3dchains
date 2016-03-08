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

angular.module('helixDemo')
       .service('vizfourData', function(){
         this.dataPrep = function(param, d){
           switch(param){
             case "Volume":
             try{
               return +d[param]
             }catch(e){return 0}
             break;
             case "ChangeinPercent":
             try{
               return +d[param].replace('%','').replace("+", "")
             }catch(e){
               return 0}
             break;
             case "ShortRatio":
             try{return  +d[param]} catch(e){
                 return 0}
             break;
             case "MarketCapitalization":
             try{
               return +(d[param].replace("B", ""))
             } catch(e){return 0}
             break;
             case "DividendYield":
             try{
               return +d[param]
             } catch(e){return 0}
             break;
             case "bid/ask Spread":
             try{
               return +d.Bid - +d.Ask
             }catch(e){return 0}
             break;
             case "OneyrTargetGrowth%":
             try{
               return +d.OneyrTargetPrice - +d.LastTradePriceOnly
             } catch(e){return 0}
             break;
           }
         }

         this.dataPrepText = function(param, d){
           switch(param){
             case "Volume":
             try{
               return +d[param]
             }catch(e){return 0}
             break;
             case "ChangeinPercent":
             try{
               return +d[param].replace('%','').replace("+", "")
             }catch(e){
               return 0}
             break;
             case "ShortRatio":
             try{return  +d[param]} catch(e){
                 return 0}
             break;
             case "MarketCapitalization":
             try{
               return (d[param])
             } catch(e){return 0}
             break;
             case "DividendYield":
             try{
               return +d[param]
             } catch(e){return 0}
             break;
             case "bid/ask Spread":
             try{
               return +d.Bid - +d.Ask
             }catch(e){return 0}
             break;
             case "OneyrTargetGrowth%":
             try{
               return +d.OneyrTargetPrice - +d.LastTradePriceOnly
             } catch(e){return 0}
             break;
           }
         }


         this.marketArray = function(){
           return [
             {
               Symbol: "MMM",
               Name: "3M Co",
               Sector: "Industrials"
             },
             {
               Symbol: "ADBE",
               Name: "Adobe Systems",
               Sector: "Information Technology"
             },
             {
               Symbol: "AET",
               Name: "Aetna",
               Sector: "Health Care"
             },
             {
               Symbol: "AFL",
               Name: "AFLAC",
               Sector: "Financials"
             },
             {
             Symbol: "GAS",
             Name: "AGL Resources",
             Sector: "Utilities"
             },
             {
           Symbol: "ARG",
           Name: "Airgas",
           Sector: "Materials"
           },
           {
           Symbol: "ALL",
           Name: "Allstate Corp",
           Sector: "Financials"
           },
           {
           Symbol: "AGN",
           Name: "Allergan plc",
           Sector: "Health Care"
           },
           {
           Symbol: "AMZN",
           Name: "Amazon.com",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "AAL",
           Name: "American Airlines Group",
           Sector: "Airlines"
           },
           {
           Symbol: "AEP",
           Name: "American Electric Power",
           Sector: "Utilities"
           },
           {
           Symbol: "AXP",
           Name: "American Express",
           Sector: "Financials"
           },
           {
           Symbol: "AIG",
           Name: "American International Group",
           Sector: "Financials"
           },
           {
           Symbol: "ANTM",
           Name: "Anthem",
           Sector: "Health Care"
           },
           {
           Symbol: "APA",
           Name: "Apache Corp",
           Sector: "Energy"
           },
           {
           Symbol: "AIV",
           Name: "Apartment Investment & Mgmt",
           Sector: "Financials"
           },
           {
           Symbol: "T",
           Name: "AT&T",
           Sector: "Telecommunication Services"
           },
           {
           Symbol: "AAPL",
           Name: "Apple",
           Sector: "Information Technology"
           },
           {
           Symbol: "ADSK",
           Name: "Autodesk",
           Sector: "Information Technology"
           },
           {
           Symbol: "ADP",
           Name: "Automatic Data Processing",
           Sector: "Information Technology"
           },
           {
           Symbol: "AMZN",
           Name: "Amazon inc",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "AN",
           Name: "AutoNation",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "AZO",
           Name: "AutoZone",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "WTI",
           Name: "West Texas Offshore",
           Sector: "Energy"
           },
           {
           Symbol: "AVGO",
           Name: "Avago Technologies",
           Sector: "Information Technology"
           },
           {
           Symbol: "BAC",
           Name: "Bank of America",
           Sector: "Financials"
           },
           {
           Symbol: "BABA",
           Name: "Ali Baba",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "BIDU",
           Name: "Wynn Resorts",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "BBT",
           Name: "BB&T Corp",
           Sector: "Financials"
           },
           {
           Symbol: "BBBY",
           Name: "Bed Bath & Beyond",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "BRK-B",
           Name: "Berkshire Hathaway",
           Sector: "Financials"
           },
           {
           Symbol: "BBY",
           Name: "Best Buy",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "BIIB",
           Name: "Biogen",
           Sector: "Health Care"
           },
           {
           Symbol: "BLK",
           Name: "BlackRock",
           Sector: "Financials"
           },
           {
           Symbol: "BA",
           Name: "Boeing Co",
           Sector: "Industrials"
           },
           {
           Symbol: "BMY",
           Name: "Bristol-Myers Squibb",
           Sector: "Health Care"
           },
           {
           Symbol: "COG",
           Name: "Cabot Oil & Gas",
           Sector: "Energy"
           },
           {
           Symbol: "CAM",
           Name: "Cameron International",
           Sector: "Energy"
           },
           {
           Symbol: "CPB",
           Name: "Campbell Soup",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "COF",
           Name: "Capital One Financial",
           Sector: "Financials"
           },
           {
           Symbol: "CAT",
           Name: "Caterpillar",
           Sector: "Industrials"
           },
           {
           Symbol: "CBS",
           Name: "CBS Corp",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "CTL",
           Name: "CenturyLink",
           Sector: "Telecommunication Services"
           },
           {
           Symbol: "CHK",
           Name: "Chesapeake Energy",
           Sector: "Energy"
           },
           {
           Symbol: "CVX",
           Name: "Chevron Corp",
           Sector: "Energy"
           },
           {
           Symbol: "CMG",
           Name: "Chipotle Mexican Grill",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "CSCO",
           Name: "Cisco Systems",
           Sector: "Information Technology"
           },
           {
           Symbol: "C",
           Name: "Citigroup",
           Sector: "Financials"
           },
           {
           Symbol: "CTXS",
           Name: "Citrix Systems",
           Sector: "Information Technology"
           },
           {
           Symbol: "CLX",
           Name: "Clorox Co",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "CME",
           Name: "CME Group",
           Sector: "Financials"
           },
           {
           Symbol: "CMS",
           Name: "CMS Energy",
           Sector: "Utilities"
           },
           {
           Symbol: "KO",
           Name: "Coca-Cola Co",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "CL",
           Name: "Colgate-Palmolive",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "CMCSA",
           Name: "Comcast Corp",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "CAG",
           Name: "ConAgra Foods",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "COP",
           Name: "ConocoPhillips",
           Sector: "Energy"
           },
           {
           Symbol: "CSX",
           Name: "CSX Corp",
           Sector: "Industrials"
           },
           {
           Symbol: "COST",
           Name: "Costco Wholesale",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "CVS",
           Name: "CVS Health Corp",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "DAL",
           Name: "Delta Air Lines",
           Sector: "Industrials"
           },
           {
           Symbol: "DTV",
           Name: "DIRECTV",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "DG",
           Name: "Dollar General",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "DLTR",
           Name: "Dollar Tree",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "DPS",
           Name: "Dr. Pepper Snapple Group",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "DTE",
           Name: "DTE Energy",
           Sector: "Utilities"
           },
           {
           Symbol: "DD",
           Name: "Du Pont (E.I.)",
           Sector: "Materials"
           },
           {
           Symbol: "DUK",
           Name: "Duke Energy",
           Sector: "Utilities"
           },
           {
           Symbol: "ETFC",
           Name: "E Trade Financial",
           Sector: "Financials"
           },
           {
           Symbol: "EBAY",
           Name: "eBay",
           Sector: "Information Technology"
           },
           {
           Symbol: "FB",
           Name: "Facebook Cl",
           Sector: "Information Technology"
           },
           {
           Symbol: "EXPE",
           Name: "Expedia",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "FDX",
           Name: "FedEx Corp",
           Sector: "Industrials"
           },
           {
           Symbol: "F",
           Name: "Ford Motor",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "FOSL",
           Name: "Fossil Group",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "GM",
           Name: "General Motors",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "GIS",
           Name: "Genl Mills",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "GS",
           Name: "Goldman Sachs Group",
           Sector: "Financials"
           },
           {
           Symbol: "GT",
           Name: "Goodyear Tire & Rub",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "GOOGL",
           Name: "Google",
           Sector: "Information Technology"
           },
           {
           Symbol: "HRB",
           Name: "H & R Block",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "HAL",
           Name: "Halliburton Co",
           Sector: "Energy"
           },
           {
           Symbol: "HBI",
           Name: "Hanesbrands",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "HOG",
           Name: "Harley-Davidson",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "HSY",
           Name: "Hershey Co",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "HES",
           Name: "Hess Corp",
           Sector: "Energy"
           },
           {
           Symbol: "HPQ",
           Name: "Hewlett-Packard",
           Sector: "Information Technology"
           },
           {
           Symbol: "HD",
           Name: "Home Depot",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "HON",
           Name: "Honeywell International",
           Sector: "Industrials"
           },
           {
           Symbol: "HUM",
           Name: "Humana",
           Sector: "Health Care"
           },
           {
           Symbol: "IBM",
           Name: "International Bus. Machines",
           Sector: "Information Technology"
           },
           {
           Symbol: "IVZ",
           Name: "INVESCO Ltd",
           Sector: "Financials"
           },
           {
           Symbol: "JOY",
           Name: "Joy Global",
           Sector: "Industrials"
           },
           {
           Symbol: "JPM",
           Name: "JPMorgan Chase & Co",
           Sector: "Financials"
           },
           {
           Symbol: "K",
           Name: "Kellogg Co",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "GMCR",
           Name: "Keurig Green Mountain",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "KEY",
           Name: "KeyCorp",
           Sector: "Financials"
           },
           {
           Symbol: "KMB",
           Name: "Kimberly-Clark",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "KMI",
           Name: "Kinder Morgan",
           Sector: "Energy"
           },
           {
           Symbol: "KRFT",
           Name: "Kraft Foods Group",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "KR",
           Name: "Kroger Co",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "LOW",
           Name: "Lowe'sCompanies",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "LMT",
           Name: "Lockheed Martin",
           Sector: "Industrials"
           },
           {
           Symbol: "M",
           Name: "Macy's",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "MA",
           Name: "MasterCard",
           Sector: "Information Technology"
           },
           {
           Symbol: "MSFT",
           Name: "Microsoft Corp",
           Sector: "Information Technology"
           },
           {
           Symbol: "MRK",
           Name: "Merck & Co",
           Sector: "Health Care"
           },
           {
           Symbol: "MET",
           Name: "MetLife",
           Sector: "Financials"
           },
           {
           Symbol: "KORS",
           Name: "Michael Kors Holdings",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "MCHP",
           Name: "Microchip Technology",
           Sector: "Information Technology"
           },
           {
           Symbol: "MON",
           Name: "Monsanto Co",
           Sector: "Materials"
           },
           {
           Symbol: "TAP",
           Name: "Molson Coors Brewing",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "NFLX",
           Name: "NetFlix",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "NKE",
           Name: "NIKE",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "NE",
           Name: "Noble Corp",
           Sector: "Energy"
           },
           {
           Symbol: "ORCL",
           Name: "Oracle Corp",
           Sector: "Information Technology"
           },
           {
           Symbol: "PEP",
           Name: "PepsiCo",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "PFE",
           Name: "Pfizer",
           Sector: "Health Care"
           },
           {
           Symbol: "PM",
           Name: "Philip Morris International",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "PSX",
           Name: "Phillips 66",
           Sector: "Energy"
           },
           {
           Symbol: "PCLN",
           Name: "Priceline Group (The)",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "PRU",
           Name: "Prudential Financial",
           Sector: "Financials"
           },
           {
           Symbol: "PSA",
           Name: "Public Storage",
           Sector: "Financials"
           },
           {
           Symbol: "DGX",
           Name: "Quest Diagnostics",
           Sector: "Health Care"
           },
           {
           Symbol: "RL",
           Name: "Ralph Lauren Corp",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "QCOM",
           Name: "QUALCOMM",
           Sector: "Information Technology"
           },
           {
           Symbol: "RHI",
           Name: "Robert Half International",
           Sector: "Industrials"
           },
           {
           Symbol: "SNDK",
           Name: "SanDisk Corp",
           Sector: "Information Technology"
           },
           {
           Symbol: "RCL",
           Name: "Royal Caribbean Cruises",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "SCHW",
           Name: "Schwab(Charles)Corp",
           Sector: "Financials"
           },
           {
           Symbol: "LUV",
           Name: "Southwest Airlines",
           Sector: "Airlines"
           },
           {
           Symbol: "SPLS",
           Name: "Staples",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "SBUX",
           Name: "Starbucks Corp",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "STI",
           Name: "SunTrust Banks",
           Sector: "Financials"
           },
           {
           Symbol: "TGT",
           Name: "Target Corp",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "TXN",
           Name: "Texas Instruments",
           Sector: "Information Technology"
           },
           {
           Symbol: "TWC",
           Name: "Time Warner Cable",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "UA",
           Name: "Under Armour",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "UNH",
           Name: "UnitedHealth Group",
           Sector: "Health Care"
           },
           {
           Symbol: "VLO",
           Name: "Valero Energy",
           Sector: "Energy"
           },
           {
           Symbol: "VRSN",
           Name: "VeriSign",
           Sector: "Information Technology"
           },
           {
           Symbol: "VZ",
           Name: "Verizon Communications",
           Sector: "Telecommunication Services"
           },
           {
           Symbol: "VRTX",
           Name: "Vertex Pharmaceuticals",
           Sector: "Health Care"
           },
           {
           Symbol: "WMT",
           Name: "Wal-Mart Stores",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "WBA",
           Name: "Walgreens Boots Alliance",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "V",
           Name: "Visa",
           Sector: "Information Technology"
           },
           {
           Symbol: "VIAB",
           Name: "Viacom",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "DIS",
           Name: "Walt Disney Co",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "WM",
           Name: "Waste Management",
           Sector: "Industrials"
           },
           {
           Symbol: "WFM",
           Name: "Whole Foods Market",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "WFC",
           Name: "Wells Fargo",
           Sector: "Financials"
           },
           {
           Symbol: "WYNN",
           Name: "Wynn Resorts",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "LNKD",
           Name: "Linked in",
           Sector: "Information Technology"
           },
           {
           Symbol: "TSLA",
           Name: "Tesla co",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "TWTR",
           Name: "Twitter Inc Co",
           Sector: "Information Technology"
           },
           {
           Symbol: "GOOG",
           Name: "Alphabet Co",
           Sector: "Information Technology"
           },
           {
           Symbol: "P",
           Name: "Pandora",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "LULU",
           Name: "Lulu Lemon",
           Sector: "Consumer Discretionary"
           },
           {
           Symbol: "XEL",
           Name: "Xcel Energy",
           Sector: "Utilities"
           },
           {
           Symbol: "XRX",
           Name: "Xerox Corp",
           Sector: "Information Technology"
           },
           {
           Symbol: "YHOO",
           Name: "Yahoo",
           Sector: "Information Technology"
           },
           {
           Symbol: "SYY",
           Name: "Sysco Corp",
           Sector: "Consumer Staples"
           },
           {
           Symbol: "YUM",
           Name: "Yum Brands",
           Sector: "Consumer Discretionary"
           },




           {
           Symbol: "TLT",
           Name: "20+ YR Treasury Bond ETF",
           Sector: "ETF"
           },
           {
           Symbol: "TBT",
           Name: "ProShares Trust UltraShort 20+ YR Treasury Bond ETF",
           Sector: "ETF"
           },
           {
           Symbol: "GLD",
           Name: "SPDR Gold ETF",
           Sector: "ETF"
           },
           {
           Symbol: "SLV",
           Name: "iShares Silver Trust ETF",
           Sector: "ETF"
           },
           {
           Symbol: "VIX",
           Name: "CBOE Market Volatility Index",
           Sector: "ETF"
           },
           {
           Symbol: "SPY",
           Name: "SPDR Trust S&P 500 ETF",
           Sector: "ETF"
           },
           {
           Symbol: "QQQ",
           Name: "PowerShares QQQ",
           Sector: "ETF"
           },
           {
           Symbol: "IWM",
           Name: "iShares Russell 2000 ETF",
           Sector: "ETF"
           },
           {
           Symbol: "DIA",
           Name: "SPDR Dow Jones Industrial Average ETF",
           Sector: "ETF"
           },
           {
           Symbol: "USO",
           Name: "United States Oil Fund ETF",
           Sector: "ETF"
           },
           {
           Symbol: "FXI",
           Name: "China Large Cap ETF",
           Sector: "Currency ETF"
           },
           {
           Symbol: "FXE",
           Name: "CurencyShares Euro Trust ETF",
           Sector: "Currency ETF"
           },
           {
           Symbol: "FXB",
           Name: "British Pound Sterling ETF",
           Sector: "Currency ETF"
           },
           {
           Symbol: "UUP",
           Name: "American Dollar ETF",
           Sector: "Currency ETF"
           }
           ]
         }
       })
