import './style.css'
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { boidAgent} from './boidAgent';
import {KeyboardInputs} from "./keyboardInputs.js";
import { QuadTree, AABB } from './quadTree';

// Standard global constants
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};
// Standard global variables
var scene, camera, renderer, controls;
var keyboard = new KeyboardInputs()

// Custom global constants
const numberOfBoids = 1000;
const AREA = 250;
const quadTreeCap = 4;

// Custom global variables
var boidArray = []; // Array to keep tabs on all boids
const QTBoundry = new AABB({x:0, z:0}, {w: AREA, h:AREA});
let QT = new QuadTree(QTBoundry, quadTreeCap);
var allign = true; // <--------------------------------- Turns on allignment principle
var cohesion = true; // < ----------------------------- Turns on cohesian principle
var seperation = true; // <---------------------------- Turns on seperation principle
var firstBoid = true; // <------------------------------ Special red boid
var boidsCanMove = true;

init();
animate();

// Function that initialises the scene and its various starting functionality
function init() {
  scene = new THREE.Scene();

  // CAMERA
  // Camera variables
  var VIEW_ANGLE = 75, ASPECT  = sizes.width / sizes.height,  NEAR = 0.1, FAR = 20000;
  // First camera
  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR
  );
  camera.position.setY(350);

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
  var imagePrefix = "skybox/Daylight_Box_Pieces/Daylight_Box_";
  var directions = ["Right","Left","Top","Bottom","Front","Back"];
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
  //scene.add(gridHelper, axisHelper);

  // spawn Boids
  for(let i = 0;i < numberOfBoids; i++) {
    createboid(scene);
  }
}

function animate() {
  // Create new quad tree
  QT = new QuadTree(QTBoundry, quadTreeCap);
  // Insert every boid in boid array into new quad tree
  insertAll(boidArray, QT)
  // For each boid call function to move it
  boidArray.forEach(moveBoid);
  window.requestAnimationFrame(animate)
  render();
  update();
}

// Update function to check for key presses
function update() {
  keyboard.update();
  if(keyboard.down('M')){boidsCanMove =! boidsCanMove}
  if(keyboard.down('A')){allign =!allign}
  if(keyboard.down('S')){seperation =!seperation}
  if(keyboard.down('C')){cohesion =!cohesion}
  controls.update();
}

function render() {
  renderer.render(scene,camera);
}

// function that craetes boids 
function createboid(scene) {
    // Choose random spawn loaction for boid
    let posX = AREA - Math.random() * (AREA*2);
    let posZ = AREA - Math.random() * (AREA*2);
    const position = new THREE.Vector3(posX,0,posZ);
    
    // Choose random rotation value for boid
    const rotation = Math.random() * (2*Math.PI)

    // Boid size
    const size = {
      radius: 1,
      height: 4,
      radialSegment: 32
    }

    const boidArea = {
      x: AREA,
      z: AREA
    }
    
    if(firstBoid) {
      const boid = new boidAgent.Agent(size,position,rotation, 0xff0000, scene, boidArea, boidArray.length);
      boidArray.push(boid);  
      firstBoid = false;
    }else {
      const boid = new boidAgent.Agent(size,position,rotation, 0xB2BEB5, scene, boidArea, boidArray.length);
      boidArray.push(boid);
    }
}

function moveBoid(value) {  
  // Look up foreach function
  if(boidsCanMove) {
    let boid = value;
    boid.step();
    // Apply principles every time step if turned on
    if(allign == true) {boid.allign(QT)}
    if(cohesion == true) {boid.cohesion(QT)}
    if(seperation == true){boid.seperation(QT)}
  }
}

// Inserts all boids into quad tree
function insertAll(boidArray, _QT){
  for(let boid of boidArray){
    let position = boid.agentObject.position;
    _QT.insert({object: boid, position: position})
  }
}
