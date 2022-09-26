import './style.css'
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { boidAgent} from './boidAgent';
import { Color, Vector3 } from 'three';
import {KeyboardInputs} from "./keyboardInputs.js";
//import * as keyboard from './KeyboardInputs.js';


// Standar global constants
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};
// Standard global variables
var scene, camera, renderer, controls;

var keyboard = new KeyboardInputs()

// Custom global variables
var boidArray = [];
var firstBoid = true;
var boidsCanMove = true;

init();
animate();

// Function and that
function init() {
  scene = new THREE.Scene();

  // CAMERA
  // camera variables
  var VIEW_ANGLE = 75, ASPECT  = sizes.width / sizes.height,  NEAR = 0.1, FAR = 20000;
  // first camera
  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR
  );
  camera.position.setY(200);

  // RENDERER
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);

  // EVENTS
  window.addEventListener("resize", () => {
    // update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // update RENDERER
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);

  // Skybox
  var imagePrefix = "skybox/Daylight_box_pieces/Daylight_Box_";
  var directions = ["Right","left","Top","Bottom","Front","Back"];
  var imageSuffix = ".bmp";
  var skyGeometry = new THREE.BoxGeometry(1000,1000,1000);

  var materialArray = [];
  for (var i = 0; i< 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
      side: THREE.BackSide
    }));
  }
  var skybox = new THREE.Mesh(skyGeometry, materialArray);
  scene.add(skybox);
  
  // Helpers
  const gridHelper = new THREE.GridHelper(400, 50);
  const axisHelper = new THREE.AxesHelper(20);
  scene.add(gridHelper, axisHelper);

  // test cuboid
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(4, 20, 32),
    new THREE.MeshBasicMaterial(
      {color: 0xFF5733}
    )
  )
  scene.add(cone)
  cone.rotateX(Math.PI/2);            

  var coneDirection = new THREE.Vector3(10,2,5);
  coneDirection.normalize();
  console.log(coneDirection)
  
  //cone.position.setY(7)
  //cone.position.addScaledVector(coneDirection,20)


  //setDirection(newDirection,cone)
  cone.rotateZ(Math.PI/4)
  
  // spawn Boids
  for(let i = 0;i < 50; i++) {
    createboid(scene);
  }

  // spawn special boid
  createboid(scene)
}

function animate() {
  // For each boid call function to move it
  boidArray.forEach(moveBoid);
  
  window.requestAnimationFrame(animate)
  render();
  update();
}

function update() {
  keyboard.update();
  if(keyboard.down('G')) {
    if(boidsCanMove) {
      boidsCanMove = false
      for(let b of boidArray) {
        console.log("position of boid number: ")
        let g = new THREE.Vector3()
        g = b.agentObject.position
        console.log(g)
      }
      console.log("G")
    } else {
      boidsCanMove = true;
    } 
  }
  controls.update();
}
function render() {
  renderer.render(scene,camera);
}
// function that craetes boids 
function createboid(scene) {
    // Choose random spawn loaction for boid
    let posX = 200 - Math.random() * 400;
    let posZ = 200 - Math.random() * 400;
    const position = new THREE.Vector3(posX,0,posZ);
    
    // Choose random rotation value for boid
    const rotation = Math.random() * Math.PI

    // Boid size
    const size = {
      radius: 1,
      height: 4,
      radialSegment: 32
    }
    if(firstBoid) {
      const boid = new boidAgent.Agent(size,position,rotation, 0xff0000, scene);
      boid.create()
      boidArray.push(boid);  
      firstBoid = false;
    }else {
      const boid = new boidAgent.Agent(size,position,rotation, 0xffff00, scene);
      boid.create();
      // Keep tabs on all boids
      boidArray.push(boid);
    }
}

function moveBoid(value) {
  if(boidsCanMove) {
    const boid = value;
    boid.allign(boidArray)
    boid.cohesion(boidArray)
    
    boid.move("f");
    const direction = Math.floor(Math.random() * 2)
    if(direction == 0) {
      boid.move("l");
    } else if(direction == 1) {
      boid.move("r")
    }
}
}
// debug gotta normalize suttin in this function man
function getDirection(object) {
  // points boid back upright because thats the only way to get worlddirection for some stupid reason
  let vector = new THREE.Vector3()
  object.rotateX(-Math.PI/2);
  var dir = object.getWorldDirection(vector) 
  object.rotateX(Math.PI/2);
  return dir
}

// sets new direction on object
function setDirection(newDirection, object) {
  
// newDirection = (1,0,1)
// object.position = (0,0,20)
//rotate to allign with world position  
object.rotateX(-Math.PI/2);

// make transformation on object
  var pos = new THREE.Vector3();
  pos.addVectors(object.position, newDirection);
  object.lookAt(pos);
  object.rotateX(Math.PI/2);
}