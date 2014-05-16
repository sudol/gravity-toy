
//This is an array of all the objects currently being calculated
var objects = [];

var canvas = null;

var context = null;

var mouseClicked = false;

var currentMousePos = null;

var startPos = null;

var endPos = null;

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

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    writeMessage("Objects : " + objects.length, 10, 15);
    
    //Draw all the current particles
    for (i in objects) {

        //Initial drag determines velocity to start
        
        for (j in objects) {
            //loop through each object and adjust x and y velocities of objects[i] for the force that objects[j] applies on it.
            
            //The object does not act on itself... not in this simulation anyway
            if (j==i) continue;
            
            //Detect if any other object has collided with this one
            //If the distance between the two origins is smaller than their combined radii, then they have collided
            
            var xDistance = objects[i].position.x - objects[j].position.x;
            var yDistance = objects[i].position.y - objects[j].position.y;
            
            var distance = Math.sqrt(Math.pow(Math.abs(xDistance),2) + Math.pow(Math.abs(yDistance),2));

                           
            //If the objects have collided
            if (distance < (objects[i].radius + objects[j].radius)) {
                //just remove one for now
                objects[i].mass += objects[j].mass;
                objects[i].radius += objects[j].radius;
                objects[i].velocity.x += objects[j].velocity.x;
                objects[i].velocity.y += objects[j].velocity.y;
                
                objects.splice(j, 1);
                
                break;
            }
            
            var F = (objects[i].mass * objects[j].mass) / Math.pow(distance,2);

            if (xDistance > 0) {
                objects[i].velocity.x = objects[i].velocity.x - F;
            } else {
                objects[i].velocity.x = objects[i].velocity.x + F;
            }
            
            if (yDistance > 0) {
                objects[i].velocity.y = objects[i].velocity.y - F;
            } else {
                objects[i].velocity.y = objects[i].velocity.y + F;
            }
        }
        
        context.beginPath();
	    context.moveTo(objects[i].position.x + objects[i].radius, objects[i].position.y);

	    context.arc(
	        objects[i].position.x,
	        objects[i].position.y,
	        objects[i].radius,
	        0 * Math.PI,
	        2 * Math.PI,
	        false
	    );

	    context.lineWidth = 4;
	    context.strokeStyle = "black";
	    context.fillStyle = "red";
	    
	    context.fill();
	    context.stroke();
	    
	    //Object has been drawn, now adjust position for next draw
	    objects[i].position.x += objects[i].velocity.x;
	    objects[i].position.y += objects[i].velocity.y;
/*
console.log(objects[i].velocity.x);
console.log(objects[i].velocity.y); 
*/
	    //If the object goes off the canvas, remove it
	    if (objects[i].position.x - objects[i].radius > canvas.width
	        || objects[i].position.y - objects[i].radius > canvas.height
	        || objects[i].position.x + objects[i].radius < 0
	        || objects[i].position.y + objects[i].radius < 0
	        
	    ) {
    	   objects.splice(i, 1);
	    }
    }
    
    //Draw the line for a particle currently being placed
 
    if (mouseClicked) {
        drawLine(startPos, currentMousePos);
    }
}

function drawLine(startPos, endPos) {
    context.beginPath();
    context.moveTo(startPos.x, startPos.y);
    context.lineTo(endPos.x, endPos.y);
    context.stroke();
}

function addObject(object) {
    objects.push(object);
    console.log(object);
}

function createObject(details) {
    var object = {};
    object.position = details.position;
    //@todo need a formula for converting mass to a radius
    object.mass = 10;
    object.radius = 10;
    object.draglength = details.dragLength;
    
    return object;
}

function writeMessage(message, x, y) {
    //var context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '12pt Calibri';
    context.fillStyle = 'black';
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

window.onload = function() {
    canvas = document.getElementById('field');
    context = canvas.getContext('2d');
    
    canvas.addEventListener('mousemove', function(e) {
        //get the starting coords, used to place the object
        currentMousePos = getMousePos(canvas, e);
    }, true);

    canvas.addEventListener('mousedown', function(e) {
        //get the starting coords, used to place the object
        mouseClicked = true;
        startPos = getMousePos(canvas, e);
    }, true);

    canvas.addEventListener('mouseup', function(e) {
        //get the ending coords, used to determine velocity
        endPos = getMousePos(canvas, e);
        mouseClicked = false;
        if (startPos != null) {
            xDistance = startPos.x - endPos.x;
            yDistance = startPos.y - endPos.y;
            dragLength = Math.sqrt(Math.pow(xDistance,2) + Math.pow(yDistance,2));
            
            var object = {};
            object.dragLength = dragLength;
            object.position = startPos;
            //These are arbitrary for now
            object.mass = 10;
            object.radius = 1;
            object.stage = 0;
            
            object.velocity = {
                x: xDistance/100,
                y: yDistance/100
            };
            
            addObject(object);
        }
        
        startPos = null;
        endPos = null;
    }, true);
            
    animationLoop();
};