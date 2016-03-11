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
