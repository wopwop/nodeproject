var world;
var size = 100;
var elements = [], bodies = [];
var canvas;
var worldAABB, world, iterations = 1, timeStep = 1 / 20;
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
var wall_thickness = 200;
var delta = [ 0, 0 ];
var fixed = false;
var logo;
var isMouseDown = false;
var createMode = false;
var mouseJoint;
var k=0;
var theme = [ "#000000", "#FFFFFF", "#2D2B2A", "#B81111", "#FFFFFF" ]
init();

/* ########## init box2d and create world #############*/
function init(){
    
    	document.onmousedown = onDocumentMouseDown;
	document.onmouseup = onDocumentMouseUp;
	document.onmousemove = onDocumentMouseMove;
	document.ondblclick = onDocumentDoubleClick;
        
        canvas = document.getElementById("canvas");
    	worldAABB = new b2AABB();
	worldAABB.minVertex.Set( -200, -200 );
	worldAABB.maxVertex.Set( screen.width + 200, screen.height + 200 );
	world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );
        walls();
        tweetBall();
        setInterval(loop,1000/40);
}

/* ########## Create new Ball ########## */

function tweetBall(mouseX, mouseY){
    
    size = Math.floor(Math.random() * (80 - 60 + 1) + 60);
    // generate random values for x,y (position of a ball)
    var x = Math.random() * (window.innerWidth - logo.offsetLeft);
    var y = Math.random() * (window.innerHeight - logo.offsetTop);
    
    
    // create a canvas element
    var element = document.createElement("div");
        element.width = element.height = size;
        element.style.position = "absolute";
        element.style.left = -200 + "px";
        element.style.top = -200  + "px";
        
    //  fill canvas with content
    var small_canvas = document.createElement("canvas");
        small_canvas.width = small_canvas.height = size;
    var ctx = small_canvas.getContext("2d");
	for (var i = size; i > 0; i-= (size/9)) {
		ctx.fillStyle = theme[ (Math.random() * 4 >> 0) + 1];
		ctx.beginPath();
		ctx.arc(size * .5, size * .5, i * .5, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
	}
    
    var content = document.createElement("div");
        content.id = "face_content";
        content.innerHTML = "<img src='http://graph.facebook.com/AnissBouraba/picture?type=square'/>";
        content.style.position = "absolute";
        content.style.width = (50 - 20*2) + 'px';
        content.style.left = (((size - 50) / 2)) +'px';
        content.style.top = ((size - 50) / 2) +'px';
    element.appendChild(content);
        
    element.appendChild(small_canvas);
    canvas.appendChild(element);
    elements.push(element);
    

    
    // create b2dcircle and it body
    var circle = new b2CircleDef();
	circle.radius = size >> 1;
	circle.density = 1;
	circle.friction = 0.3;
	circle.restitution = 0.3;
        
    var b2body = new b2BodyDef();
	b2body.AddShape(circle);
	b2body.userData = {element: element};
	b2body.position.Set( mouseX, mouseY);
	b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
	bodies.push( world.CreateBody(b2body) );
    
}

/* ########## face Ball ####### */


/* ########### Loop for animation ############ */

function loop(){
    
    delta[0] = (window.screenX - stage[0]) * 50;
    delta[1] = (window.screenY - stage[1]) * 50;
    // where the balls want you go ? top,left positions
	delta[0] += (0 - delta[0]) * .5;
	delta[1] += (0 - delta[1]) * .5;

	world.m_gravity.x = 0;
	world.m_gravity.y = 350 + delta[1];
    
    mouseDrag();
    // call world.Step
    world.Step(timeStep, iterations);
    
    for(i = 0; i < bodies.length; i++){
        
        var body = bodies[i];
        var element = elements[i];
        
        element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
        element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';
        
        if (element.tagName == 'DIV') {

	var rotationStyle = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';
	element.style.WebkitTransform = rotationStyle;
	element.style.MozTransform = rotationStyle;
	element.style.OTransform = rotationStyle;
	// text.style.MsTransform = rotationStyle;

	}
        
    }

}

/* ######### Create screen walls (boxs) ######## */

function walls(){
	bottom_wall = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
	top_wall = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
	left_wall = createBox(world,  - wall_thickness, 0, wall_thickness, stage[3] - wall_thickness);
	right_wall = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
    
    logo = document.getElementById("logo-content");
    logo_wall = createBox(world, (stage[2] / 2) - 20, (stage[3] / 2), 300, 90);
}


/* ###### Create Box as walls ####### */
function createBox(world, x, y, width, height, fixed) {

	if (typeof(fixed) == 'undefined') {

		fixed = true;

	}

	var boxSd = new b2BoxDef();

	if (!fixed) {

		boxSd.density = 1.0;

	}
        
        
	boxSd.extents.Set(width, height);

	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);

	return world.CreateBody(boxBd);

}

/* ########### Drag and drop balls ######### */

function onDocumentMouseDown() {

	isMouseDown = true;
	return false;
}

function onDocumentMouseUp() {

	isMouseDown = false;
	return false;
}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX;
	mouseY = event.clientY;
}

function onDocumentDoubleClick() {

	reset();
}

function mouseDrag()
{
	// mouse press
	if (createMode) {

		tweetBall( mouseX, mouseY );

	} else if (isMouseDown && !mouseJoint) {

		var body = getBodyAtMouse();

		if (body) {

			var md = new b2MouseJointDef();
			md.body1 = world.m_groundBody;
			md.body2 = body;
			md.target.Set(mouseX, mouseY);
			md.maxForce = 30000 * body.m_mass;
			md.timeStep = timeStep;
			mouseJoint = world.CreateJoint(md);
			body.WakeUp();

		} else {

			createMode = true;

		}

	}

	// mouse release
	if (!isMouseDown) {

		createMode = false;
		destroyMode = false;

		if (mouseJoint) {

			world.DestroyJoint(mouseJoint);
			mouseJoint = null;

		}

	}

	// mouse move
	if (mouseJoint) {

		var p2 = new b2Vec2(mouseX, mouseY);
		mouseJoint.SetTarget(p2);
	}
}

function getBodyAtMouse() {

	// Make a small box.
	var mousePVec = new b2Vec2();
	mousePVec.Set(mouseX, mouseY);

	var aabb = new b2AABB();
	aabb.minVertex.Set(mouseX - 1, mouseY - 1);
	aabb.maxVertex.Set(mouseX + 1, mouseY + 1);

	// Query the world for overlapping shapes.
	var k_maxCount = 10;
	var shapes = new Array();
	var count = world.Query(aabb, shapes, k_maxCount);
	var body = null;

	for (var i = 0; i < count; ++i) {

		if (shapes[i].m_body.IsStatic() == false) {

			if ( shapes[i].TestPoint(mousePVec) ) {

				body = shapes[i].m_body;
				break;

			}

		}

	}

	return body;

}
