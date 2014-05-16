
//This is an array of all the objects currently being calculated
var objects = [];

var canvas = null;

var context = null;

var mouseClicked = false;

var currentMousePos = null;

var startPos = null;

var endPos = null;

var selectedMass = 1;

var frameCount = 0;

var currentSecond = 0;

var fps = 0;

var scale = 1/5000;

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

function animationLoop() {
    requestAnimFrame(animationLoop);
    render();
}

//Draw everything    
function render() {
    if (Math.floor((+new Date) / 1000) > currentSecond) {
        fps = frameCount;
        frameCount = 0;
        currentSecond = Math.floor((+new Date) / 1000);
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    writeMessage("Particles : " + objects.length, 10, 15);
    writeMessage("FPS : " + fps, 10, 30);
    
    //Draw all the current particles
    for (i in objects) {

        if (objects[i] == null) {
            continue;
        }

        //loop through each object and adjust x and y velocities of objects[i] for the force that objects[j] applies on it.
        for (j in objects) {
            
            //The object does not act on itself... not in this simulation anyway
            if (j==i || objects[j] == null) continue;
            
            //Detect if any other object has collided with this one
            //If the distance between the two origins is smaller than their combined radii, then they have collided
            
            var xDistance = objects[i].position.x - objects[j].position.x;
            var yDistance = objects[i].position.y - objects[j].position.y;
            
            var distance = Math.sqrt(Math.pow(Math.abs(xDistance),2) + Math.pow(Math.abs(yDistance),2));

                           
            //If two particles have collided, merge one particle into the other and remove the unmerged one
            if (distance < (objects[i].getRadius()/1.5 + objects[j].getRadius()/1.5)) {
            
                var totalMass = objects[i].mass + objects[j].mass;

                objects[i].velocity.x = (objects[i].velocity.x * objects[i].mass + objects[j].velocity.x * objects[j].mass) / totalMass;
                objects[i].velocity.y = (objects[i].velocity.y * objects[i].mass + objects[j].velocity.y * objects[j].mass) / totalMass;
                objects[i].position.x = (objects[i].position.x * objects[i].mass + objects[j].position.x * objects[j].mass) / totalMass;
                objects[i].position.y = (objects[i].position.y * objects[i].mass + objects[j].position.y * objects[j].mass) / totalMass;
                objects[i].mass = totalMass;
                
        /*
				var acceleration:Number = other_particle.mass/(displacement_magnitude*displacement_magnitude);
					acceleration_x_sum += acceleration*(x_diff/displacement_magnitude);
					acceleration_y_sum += acceleration*(y_diff/displacement_magnitude);
        
*/        
                
                //Remove one of the particles
                objects.splice(j, 1);
                
                break;
            }
            
            //Find the force between the objects
            var F = (objects[i].getMass() * objects[j].getMass()) / Math.pow(distance,2);
            
            var acceleration = (F/objects[i].getMass());
            //acceleration = metersToPixels(acceleration);
            acceleration *= scale;
            
            if (xDistance > 0) {
                objects[i].velocity.x = objects[i].velocity.x - acceleration;
            } else {
                objects[i].velocity.x = objects[i].velocity.x + acceleration;
            }
            
            if (yDistance > 0) {
                objects[i].velocity.y = objects[i].velocity.y - acceleration;
            } else {
                objects[i].velocity.y = objects[i].velocity.y + acceleration;
            }
        }
        
        //This object could have been removed due to merging
        if (objects[i] == null) {
            continue;
        }
        context.beginPath();
	    context.moveTo(objects[i].position.x + objects[i].getRadius(), objects[i].position.y);

	    context.arc(
	        objects[i].position.x,
	        objects[i].position.y,
	        objects[i].getRadius(),
	        0 * Math.PI,
	        2 * Math.PI,
	        false
	    );

	    context.fillStyle = objects[i].getColor();
	    
	    var gradient = context.createRadialGradient(
	       objects[i].position.x, 
	       objects[i].position.y, 
	       objects[i].getRadius(),
	       objects[i].position.x, 
	       objects[i].position.y,
	       objects[i].getRadius()/2
        );
        
        gradient.addColorStop(1, objects[i].getColor());
        gradient.addColorStop(0, objects[i].getColor(0));

	    context.fillStyle = gradient;	    
	    context.fill();
	    
	    //Object has been drawn, now adjust position for next draw
	    objects[i].position.x += objects[i].velocity.x;
	    objects[i].position.y += objects[i].velocity.y;

	    //If the object goes off the canvas, remove it
	    if (objects[i].position.x - objects[i].getRadius() > canvas.width
	        || objects[i].position.y - objects[i].getRadius() > canvas.height
	        || objects[i].position.x + objects[i].getRadius() < 0
	        || objects[i].position.y + objects[i].getRadius() < 0
	        
	    ) {
    	   //objects.splice(i, 1);
	    }
    }

    //Draw the line for a particle currently being placed
    if (mouseClicked) {
        drawLine(startPos, currentMousePos);
    }
    frameCount++;
}


function drawLine(startPos, endPos) {
    context.beginPath();
    context.strokeStyle= "white";
    context.moveTo(startPos.x, startPos.y);
    context.lineTo(endPos.x, endPos.y);
    context.stroke();
}

function addObject(object) {
    objects.push(object);
}


function writeMessage(message, x, y) {
    context.font = '12pt Calibri';
    context.fillStyle = 'white';
    context.fillText(message, x, y);
}

function getMousePos(canvas, evt) {
    var obj = canvas;
    var top = 0;
    var left = 0;

    while (obj && obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }

    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
        x: mouseX,
        y: mouseY
    };
}

function select(x) {
    stage = x;
}

function clearCanvas() {
    objects = [];
}

function generateCloud() {
    //Generate a cloud of particles in the center of the canvas
    var radius = 120;
    var particles = 400;
    var centerX = (canvas.width/2);
    var centerY = (canvas.height/2);
    
    var cloudObjects = [];
    
    //Create a bunch of points for the cloud
    for (var i=0; i<particles; i++) {
            
        var rand = Math.random() * 2 * Math.PI;
		var rand2 = Math.random();
		var randomX = (radius * rand2) * Math.cos(rand);
		var randomY = (radius * rand2) * Math.sin(rand);

        
        var point = createParticle();
        var distanceFromCenter = Math.sqrt(randomX * randomX + randomY * randomY);
        var velocity = {};
        
        point.mass = 1000;
        point.position = {x: randomX + centerX, y: randomY + centerY };
        
        velocity.x = (randomY * (distanceFromCenter/70)/200);
        velocity.y = (-randomX * (distanceFromCenter/70)/200);
        
        point.velocity = velocity;
        
        cloudObjects.push(point);
    }
    
    objects = objects.concat(cloudObjects);
}

function createParticle() {
    var object = {};
    var position = {x: 0, y: 0};

    object.red = 0;    
    object.green = 0;
    object.blue = 0;
    
    object.position = position;
    object.mass = selectedMass;
    object.getMass = function() {
        return this.mass
    }
    object.getRadius = function() {
        return (Math.log(Math.E + this.getMass() / 1000));
        return (Math.pow(this.mass, 1/4));
    }
    object.getColor = function(alpha) {
        if (this.getRadius() > 6) {
            this.red = 255;
            this.green = 0;
            this.blue = 0;
        } else if (this.getRadius() > 3) {
            this.red = 255;
            this.green = 255;
            this.blue = 0;
        } else {
            this.red = 255;
            this.green = 255;
            this.blue = 255;
        }
        
        if (alpha == null)
            alpha = 1;
        
        return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + alpha + ")";
    }
    object.velocity = {
        x: 0,
        y: 0
    };

    return object;
}

window.onload = function() {
    canvas = document.getElementById('field');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
      
    canvas.addEventListener('mousemove', function(e) {
        //get the starting coords, used to place the object
        currentMousePos = getMousePos(canvas, e);
    }, true);

    canvas.addEventListener('mousedown', function(e) {
        //get the starting coords, used to place the object
        mouseClicked = true;
        startPos = getMousePos(canvas, e);
        document.body.style.cursor = 'cursor';
    }, true);

    canvas.addEventListener('mouseup', function(e) {
        //get the ending coords, used to determine velocity
        endPos = getMousePos(canvas, e);
        mouseClicked = false;
        if (startPos != null) {
            xDistance = startPos.x - endPos.x;
            yDistance = startPos.y - endPos.y;
            dragLength = Math.sqrt(Math.pow(xDistance,2) + Math.pow(yDistance,2));
            
            var object = createParticle();
            object.dragLength = dragLength;
            object.position = startPos;
            //These are arbitrary for now
            object.velocity = {
                x: xDistance / 200,
                y: yDistance / 200
            };
            
            addObject(object);
        }
        
        startPos = null;
        endPos = null;
    }, true);
            
    animationLoop();
};