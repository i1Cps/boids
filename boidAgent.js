import './style.css'
import * as THREE from 'three';
import { Vector3 } from 'three';

export const boidAgent = (function() {
    class Agent{
        constructor(size,position,rotation,colour,scene) {
            this.scene = scene;
            this.radius = size.radius;
            this.height = size.height;
            this.radialSegment = size.radialSegment;
            this.colour = colour;
            this.agentObject;
            this.speed =  1.0;
            this.direction = new THREE.Vector3()
            this.rotation = rotation
            this.objectPosition = position
            this.myBoid = false;
             
        }

        create(){
            const geometry = new THREE.ConeGeometry(this.radius, this.height, this.radialSegment);
            const material = new THREE.MeshBasicMaterial( {color: this.colour} );
            this.agentObject = new THREE.Mesh( geometry, material );
            
            this.agentObject.position.set(this.objectPosition.x,this.objectPosition.y,this.objectPosition.z);

            this.agentObject.rotateX(Math.PI/2);            
            this.agentObject.rotateZ(this.rotation);
            if(this.colour == 0xff0000) {
                this.myBoid = true;
            }

            this.scene.add(this.agentObject);
        }
        move(direction){
            if(direction == "f") {
                if(this.myBoid) {
                    console.log(this.agentObject.position)
                }
                // debug we know this moveForward funbction is raising the y value even though it dosnt actually raise the y value
                this.moveForward();
                this.keepBoidInGrid();
                this.keepBoid2D();
                
            }
            else if (direction == "l") {
                this.rotateLeft();
            }
            else if(direction == "r") {
                this.rotateRight();
            }

        }
        // move agent forward
        moveForward(){
            //this.agentObject.translateY(this.speed);
            const dir = this.getDirection()
            if(this.myBoid) {
                //console.log("dir: " )
                //console.log(dir)
            }
            this.agentObject.position.addScaledVector(dir.normalize(), this.speed)
        }
        // Rotate agent left
        rotateLeft() {
            let weight = Math.random() * 200;
            let rotation;
            if(weight > 150) {
                rotation = Math.PI/20
            } else {
                rotation = Math.PI/100
            }
            this.agentObject.rotateOnWorldAxis(new THREE.Vector3(0,1,0), rotation);
        }
        // Rotate agent right
        rotateRight() {
            let weight = Math.random() * 200;
            let rotation;
            if(weight > 150) {
                rotation = Math.PI/20
            } else {
                rotation = Math.PI/100
            }
            this.agentObject.rotateOnWorldAxis(new THREE.Vector3(0,1,0), -rotation)
        }
        // function keeps boid in grid
        keepBoidInGrid() {

            if(this.agentObject.position.y > 20) {
                this.agentObject.position.setY(20)
            }
            if(this.agentObject.position.y < -5) {
                this.agentObject.position.setY(-5)
                if(this.myBoid) {
                    console.log("mad mad")
                }
            }

            if(this.agentObject.position.x > 200) {
                this.agentObject.position.setX(-200);
            }else if(this.agentObject.position.x < -200) {
                this.agentObject.position.setX(200);
            }
            
            if(this.agentObject.position.z > 200) {
                this.agentObject.position.setZ(-200);
            }else if(this.agentObject.position.z < -200) {
                this.agentObject.position.setZ(200);
            }
        }

        // one method to get direction could be to rotate it upright again  ( do the reverse of the original rotation)
        getDirection() {
            // points boid back upright because thats the only way to get worlddirection for some stupid reason
            let vector = new THREE.Vector3()
            this.agentObject.rotateX(-Math.PI/2);
            var dir = this.agentObject.getWorldDirection(vector) 
            this.agentObject.rotateX(Math.PI/2);
            return dir
        }

        // sets new direction on object
        setDirection(newDirection) {
            this.agentObject.rotateX(-Math.PI/2);
            var pos = new THREE.Vector3();
            pos.addVectors(this.agentObject.position, newDirection);
            this.agentObject.lookAt(pos);
            this.agentObject.rotateX(Math.PI/2);
        }

        // function to fix stupid flying issues. not even a fix tbh but gotta do what you gotta do
        keepBoid2D() {
            let boidDir = this.getDirection()
            boidDir.setComponent(1,0)
            this.setDirection(boidDir);
        }

        distanceFromBoid(thisBoid, otherBoid) {
            let thisBoidPos = thisBoid.agentObject.position;
            let otherBoidPos = otherBoid.agentObject.position;
            return thisBoidPos.distanceTo(otherBoidPos);
        }

        // Alignment Principle...
        // alignment: steer towards the average heading of local flockmates
        allign(boids) {
            let boidNearby = false;
            const visableDistance = 20;
            var total = 0;
            let avgDirection = new THREE.Vector3();
            
            // loop through each flockmate and check whether its visable
            for (let boid of boids) {
                let currentBoidPos = this.agentObject.position;
                let otherBoidPos = boid.agentObject.position;
                // if flockmate is visable save its direction 
                if(boid != this && currentBoidPos.distanceTo(otherBoidPos) < visableDistance) {
                    let boidDirection = boid.getDirection();
                    avgDirection.add(boidDirection)
                    boidNearby = true;
                    total++;
                }
            }
            if(boidNearby) {
                // get average direction of all visable flock mates
                avgDirection.divideScalar(total)
                
                let currentDirection = this.getDirection();
                let allignedDirection = new THREE.Vector3();
                // get weighted average between current boid direction and average direction of flock mates
                allignedDirection.addVectors(currentDirection, avgDirection.multiplyScalar(0.05));
                this.setDirection(allignedDirection);
            }
        }

        // Cohesion Principle...
        // cohesion: steer to move towards the average position (center of mass) of local flockmates
        cohesion(boids) {
            let boidNearby = false;
            const visableDistance = 50;
            var total = 0;
            let avgPosition = new THREE.Vector3();
            
            // loop through each flockmate and check whether its visable
            for (let boid of boids) {
                let currentBoidPos = this.agentObject.position;
                let otherBoidPos = boid.agentObject.position;
                // if flockmate is visable save its direction 
                if(boid != this && currentBoidPos.distanceTo(otherBoidPos) < visableDistance) {
                    let boidDirection = boid.getDirection();
                    avgPosition.add(otherBoidPos);
                    boidNearby = true;
                    total++;
                }
            }
            if(boidNearby) {
                // get average position of all visable flock mates
                avgPosition.divideScalar(total)
                // get direction to center of the flock by subtracting position of current boid from average position flock mates.
                // this will give a direction vector which will tell our boid where to go
                let centerDirection = new THREE.Vector3(); 
                centerDirection.subVectors(avgPosition, this.agentObject.position)
                
                // get a average direction from current direction of boid and new direction calculated
                let currentDirection = this.getDirection()
                let newDirection = new THREE.Vector3();
                // get a weighted final direction for boid
                newDirection.addVectors(currentDirection, centerDirection.multiplyScalar(0.0005));
                // get average from adding them
                newDirection.multiplyScalar(0.5);
                
                // get weighted average between current boid direction and new direction 
                //al.addVectors(currentDirection, newDirection);
                this.setDirection(newDirection);
            }
        }

        seperation(boids) {
            let boidNearby = false;
            const visableDistance = 50;
            const scaler = 1;
            var total = 0;
            let avgPosition = new THREE.Vector3();
            
            // loop through each flockmate and check whether its visable
            for (let boid of boids) {
                let currentBoidPos = this.agentObject.position;
                let otherBoidPos = boid.agentObject.position;
                // if flockmate is visable calculate its distance to this.boid and its direction
                if(boid != this && currentBoidPos.distanceTo(otherBoidPos) < visableDistance) {
                    // get distance and direction of boid from this.boid 
                    // further away the smaller the force of seperation
                    // use visable distance to calculate percentages
                    let distanceFromBoid = currentBoidPos.distanceTo(otherBoidPos);
                    let directionFromBoid = otherBoidPos.subVectors(currentBoidPos);

                    let newDirection = directionFromBoid.negate()
                    let force = (visableDistance - directionFromBoid) * scaler

                    
                    
                    boidNearby = true;
                    total++;
                }
            }

        }
    }
    return {
        Agent: Agent
    }
})();