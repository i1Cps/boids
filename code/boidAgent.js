import './style.css'
import * as THREE from 'three';
import { Vector3 } from 'three';
import { QuadTree, AABB } from './quadTree';

export const boidAgent = (function() {
    class Agent{
        constructor(size,position,rotation,colour,scene, boidArea, id_) {
            this.id = id_
            this.cachedDirection = new THREE.Vector3();
            this.zeroZeroZeroDirection = new THREE.Vector3();
            this.scene = scene;
            this.boidArea = boidArea;

            this.radius = size.radius;
            this.height = size.height;
            this.radialSegment = size.radialSegment;
            this.colour = colour;

            this.agentObject; // THREE.js MESH object of boid
            
            this.nearMyBoid;

            this.linearVelocity = 0.7;
            this.angularVelocity = 0.0;
            this.avChangeWeight = 0.1;
            this.angularVelocityDecayRate = 0.990; // Rate at which boids angular velocity tends to 0
            
            this.rotation = rotation
            this.position = position
            this.myBoid = false;  
            this.xx=true;
            this.create();
            this.direction = this.getDirection();
            this.position = this.agentObject.position;

            this.allignWeight = 0.105;      // 1000 boids 0.105   25
            this.cohesionWeight = 0.0055;   // 1000 boids 0.0055  15
            this.seperationWeight = 0.01;  // 1000 boids 0.001   5
            this.allignRange = 25;
            this.cohesionRange = 15;
            this.seperationRange = 5;
            this.allignSearchArea = new AABB({x:this.agentObject.position.x, z:this.agentObject.position.z}, {w: this.allignRange, h: this.allignRange});
            this.cohesionSearchArea = new AABB({x:this.agentObject.position.x, z:this.agentObject.position.z}, {w: this.cohesionRange, h: this.cohesionRange});
            this.seperationSearchArea = new AABB({x:this.agentObject.position.x, z:this.agentObject.position.z}, {w:this.seperationRange, h: this.seperationRange});
        }
        // Create Boid and add to scene
        create(){
            const geometry = new THREE.ConeGeometry(this.radius, this.height, this.radialSegment);
            const material = new THREE.MeshBasicMaterial( {color: this.colour} );
            this.agentObject = new THREE.Mesh( geometry, material );
            
            this.agentObject.position.set(this.position.x,this.position.y,this.position.z);
            this.agentObject.rotateX(Math.PI/2);            
            this.agentObject.rotateZ(this.rotation);

            if(this.colour == 0xff0000) {
                this.myBoid = true;
            }
            this.scene.add(this.agentObject);
        }

        // Every time step, this function will be called on the boids (Everything in this function needs to be fast)
        step() {
            this.applyLinearVelocity();
            this.applyAngularVelocity();
            this.keepBoidInGrid();
            //this.keepBoid2D();
        }

        applyLinearVelocity(){
            const dir = this.direction;
            this.agentObject.position.addScaledVector(dir.normalize(), this.linearVelocity);
            this.agentObject.position.setComponent(1,0);
            this.position = this.agentObject.position
        }

        applyAngularVelocity() {
            this.changeBoidAngle();
            this.adjustAngularVelocity();
            this.angularVelocityDecay();
        }
        
        // Rotate boid based on angular velocity
        changeBoidAngle(){
            // This returns direction vector e.g. (x=0.48, y=0.0, z=0.48)
            let currentDirection = this.direction;

            // Angle increment
            let angleIncrement = this.angularVelocity;
            // Calculate sin and cos theta
            let sinTheta = Math.sin(angleIncrement);
            let cosTheta = Math.cos(angleIncrement);
            // New direction vector
            let newXDirection = currentDirection.x * cosTheta - currentDirection.z * sinTheta;
            let newZDirection = currentDirection.x * sinTheta + currentDirection.z * cosTheta;
            let newDirection = new THREE.Vector3(newXDirection,0,newZDirection);
            newDirection.setY(0);
            newDirection.normalize()
            this.direction = newDirection;
            this.setDirection(newDirection);
        }
        
        // Use normal distrubution to adjust angular velocity
        adjustAngularVelocity(){
            // Randomly samples a normal dsitrubuted number to add to angular velocity
            let adjustAV = this.randn_normal_dist(-0.1,0.1);
            this.angularVelocity +=  (adjustAV * this.avChangeWeight);
        }
        
        // Decay the angular velocity back to 0.0 (make boid face straight) over time
        angularVelocityDecay(){
            let av = this.angularVelocity;
            let sign = Math.sign(av);
            av = sign * Math.abs(av) * this.angularVelocityDecayRate;
            this.angularVelocity = av;
        }

        keepBoidInGrid() {
            /* if(this.agentObject.position.y > 20) {
                this.agentObject.position.setY(20)
                this.position.setY(20);
            }
            if(this.agentObject.position.y < -5) {
                this.agentObject.position.setY(-5)
                this.position.setY(-5)
                if(this.myBoid) {
                    console.log("mad mad")
                }
            } */

            if(this.agentObject.position.x > this.boidArea.x) {
                this.agentObject.position.setX(-this.boidArea.x);
                this.position.setX(-this.boidArea.x);
            }else if(this.agentObject.position.x < -this.boidArea.x) {
                this.agentObject.position.setX(this.boidArea.x);
                this.position.setX(this.boidArea.x);
            }
            
            if(this.agentObject.position.z > this.boidArea.z) {
                this.agentObject.position.setZ(-this.boidArea.z);
                this.position.setZ(-this.boidArea.z);
            }else if(this.agentObject.position.z < -this.boidArea.z) {
                this.agentObject.position.setZ(this.boidArea.z);
                this.position.setZ(this.boidArea.z);
            }
        }

        /* // function to fix stupid flying issues. not even a fix tbh but gotta do what you gotta do
        keepBoid2D() {
            //let boidDir = this.getDirection()
            let boidDir = this.direction;
            
            boidDir.setComponent(1,0)
            this.setDirection(boidDir);
            this.direction = boidDir
        } */

        // One method to get direction could be to rotate it upright again  ( do the reverse of the original rotation)
        getDirection() {
            // points boid back upright because thats the only way to get worlddirection for some stupid reason
            this.agentObject.rotateX(-Math.PI/2);
            var dir = this.agentObject.getWorldDirection(this.cachedDirection) 
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

        distanceFromBoid(thisBoid, otherBoid) {
            let thisBoidPos = thisBoid.agentObject.position;
            let otherBoidPos = otherBoid.agentObject.position;
            return thisBoidPos.distanceTo(otherBoidPos);
        }

        // Alignment Principle...
        // Alignment: steer towards the average heading of local boids
        allign(quadTree) {
            // Update search boundry instead of creating a new one, search nearby boids
            this.allignSearchArea.center = {x:this.agentObject.position.x, z:this.agentObject.position.z}
            let nearbyBoids = quadTree.find(this.allignSearchArea);
            // Skip if boid in list is 'this'
            if(nearbyBoids.length < 2){
                return;
            }
            let checker = false;            
            // Use cached null direction vec to avoid new Three.Vector3() calls (its very slow)
            let avgDirection = this.zeroZeroZeroDirection
            // Loop through nearby boids and store and get average direction
            for(let boidProperties of nearbyBoids){
                // Highlights boids around "myboid"
                 if(boidProperties.myBoid && !(this.myBoid)){
                    checker = true;
                    this.nearMyBoid = true;
                    this.agentObject.material.color = new THREE.Color(0x00ffff)
                }
                // Skip if the in the nearby boids is the boid itself
                if(boidProperties.id == this.id){
                    continue;
                }
                avgDirection.add(boidProperties.direction);
            }            
            avgDirection.normalize()
            // Get weighted average between current boid direction and average direction of local boid
            let allignedDirection = this.zeroZeroZeroDirection.clone()
            allignedDirection.addVectors(this.direction, avgDirection.multiplyScalar(this.allignWeight));
            allignedDirection.normalize()

            this.setDirection(allignedDirection);
            this.direction = allignedDirection;
            
            if(!checker && !this.myBoid && this.nearMyBoid){
                this.agentObject.material.color = new THREE.Color(0xB2BEB5)
                this.nearMyBoid = false
            }
        }

        // Cohesion Principle...
        // Cohesion: steer to move towards the average position (center of mass) of local flockmates
        cohesion(quadTree) {
            // Update search boundry instead of creating a new one, search nearby boids
            this.cohesionSearchArea.center = {x:this.agentObject.position.x, z:this.agentObject.position.z}
            let nearbyBoids = quadTree.find(this.cohesionSearchArea);
            // Skip if boid in list is 'this'
            if(nearbyBoids.length < 2){
                return;
            }
            // Use cached null direction vec to avoid new Three.Vector3() calls (its very slow)
            let avgPosition = this.zeroZeroZeroDirection.clone();            
            // Loop through nearby boids get average position of each nearby boids
            for(let boidProperties of nearbyBoids){
                // Skip if the in the nearby boids is the boid itself
                if(boidProperties.id == this.id){
                    continue;
                }
                avgPosition.add(boidProperties.position)
            }
            // Dont normalize position vectors
            avgPosition.divideScalar(nearbyBoids.length-1);
            
            // Get weighted average between current boid direction and direction to average position of nearby boids
            let centerDirection = this.zeroZeroZeroDirection.clone()
            centerDirection.subVectors(avgPosition, this.position).normalize();
            let cohesianDirection = this.zeroZeroZeroDirection.normalize();
            cohesianDirection.addVectors(this.direction, centerDirection.multiplyScalar(this.cohesionWeight));
            cohesianDirection.normalize()
            
            this.setDirection(cohesianDirection);
            this.direction = cohesianDirection;
        }

        // Seperation Principle...
        // Seperation: steer to avoid crowding local boids
        seperation(quadTree) {
            // Update search boundry instead of creating a new one, search nearby boids
            this.seperationSearchArea.center = {x:this.agentObject.position.x, z:this.agentObject.position.z}
            let nearbyBoids = quadTree.find(this.seperationSearchArea);
            // Return if no unique boids nearby... 1 will always be the 'this' boid
            if(nearbyBoids.length < 2){
                return;
            }
            // Use cached null direction vec to avoid new Three.Vector3() calls (its very slow)
            let avgSeperationDirection = this.zeroZeroZeroDirection.clone();            
            // Loop through nearby boids get average direction so this boid can steer away and not crash
            for(let boid of nearbyBoids){
                // Skip if boid in list is 'this'
                if(boid.id == this.id){
                    continue;
                }
                let directionAway = this.zeroZeroZeroDirection.clone();
                directionAway.subVectors(this.position, boid.position).normalize()
                
                let distance = this.position.distanceTo(boid.position);
                avgSeperationDirection.add(directionAway.divideScalar(distance).normalize())
            }
            avgSeperationDirection.normalize()
            
            // Get weighted average between current boid direction and seperation direction
            let seperationDirection = this.zeroZeroZeroDirection.clone();
            seperationDirection.addVectors(this.direction, avgSeperationDirection.multiplyScalar(this.seperationWeight));            
            seperationDirection.normalize()

            this.setDirection(seperationDirection);
            this.direction = seperationDirection;
        }

        // Function to get random normal distribution,  too slow /apparently/
        randn_normal_dist(min, max) {
            let u = 0, v = 0;
            while(u === 0) {u = Math.random()} //Converting [0,1) to (0,1)
            while(v === 0) {v = Math.random()}
            let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
            
            // Translate to 0 -> 1
            num = num / 10.0 + 0.5
            // resample between 0 and 1 if out of range
            if (num > 1 || num < 0){num = this.randn_normal_dist(min, max)}
            else{
                num *= max - min // Stretch to fill range
                num += min // offset to min
            }
            return num
        }
    }
    return {
        Agent: Agent
    }
})();