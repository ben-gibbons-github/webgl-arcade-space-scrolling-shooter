// Mouse tracking
var mouseDown = 0;
var mouseX = [0, 0, 0, 0];
var mouseY = [0, 0, 0, 0];
var mouseXDown = [0, 0, 0, 0];
var mouseYDown = [0, 0, 0, 0];
var wheelXEvent = 0;
var wheelYEvent = 0;
var wheelXEventPrev = 0;
var wheelYEventPrev = 0;
var wheelX = 0;
var wheelY = 0;

var isPaused = false;

var testMode = false;
var lastTime = new Date().getTime();
var firstTime = lastTime;
var currentlyPressedKeys = { };
var lastPressedKeys = { };
var timePaused = 0;

// Build render
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( new THREE.Color(0, 0, 0), 1 );
document.body.appendChild( renderer.domElement );
mouseElement = renderer.domElement;

// Mouse events
function doTouch(event) {
	mouseDown = event.touches.length;
	for (var i = 0; i < mouseDown && i < mouseX.length; i++)
	{
		mouseX[i] = event.touches[i].clientX;
		mouseY[i] = event.touches[i].clientY;
	}

    event.preventDefault();
}

mouseElement.onmousedown = function(event) { 
	if (document.activeElement == document.body)
	{
		if (mouseDown < 4)
		{
			mouseX[mouseDown] = event.clientX;
			mouseY[mouseDown] = event.clientY;

			mouseXDown[mouseDown] = event.clientX;
			mouseYDown[mouseDown] = event.clientY;
		}
		mouseDown++;
	}
}

mouseElement.onmousemove = function(event) { 
	mouseX[0] = event.clientX;
	mouseY[0] = event.clientY;
}

mouseElement.onmouseup = function(event) {
  mouseDown = 0;
}

mouseElement.ontouchstart = function(event) {
	mouseDown = event.touches.length;
	for (var i = 0; i < mouseDown && i < mouseX.length; i++)
	{
		mouseX[i] = event.touches[i].clientX;
		mouseY[i] = event.touches[i].clientY;

		if (i == mouseDown - 1)
		{
			mouseXDown[i] = event.touches[i].clientX;
			mouseYDown[i] = event.touches[i].clientY;
		}
	}

    event.preventDefault();
}

mouseElement.onwheel = function(event)
{
	wheelXEvent += event.deltaX;
	wheelYEvent += event.deltaY;

    event.preventDefault();
}

mouseElement.ontouchmove = doTouch;
mouseElement.ontouchend = doTouch;
mouseElement.ontouchcancel = doTouch;


// camera and resizing
var fov = 28 * (1 + window.innerHeight / window.innerWidth);
if (fov < 45)
	fov = 45;

var camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 450000 );
camera.position.set( 200, 200, 200 );
camera.lookAt( 0, 100, 0 );
camera.far = 100000;

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
	console.log(camera);

	var fov = 28 * (1 + window.innerHeight / window.innerWidth);
	if (fov < 45)
		fov = 45;

	camera.fov = fov;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// scene stuff
var allUniforms = [];
var particleSystems = [];

var scene = new THREE.Scene();
var loader = new THREE.TextureLoader();
var modelLoader = new THREE.GLTFLoader();
var currentLevel = MakeLevel1();

// particle stuff
cloudParticleSystem = new THREE.GPUParticleSystem( {
	maxParticles: 25000,
	particleSpriteTex: loader.load("tex/part1.png")
} );
scene.add(cloudParticleSystem);
particleSystems.push(cloudParticleSystem);

ringParticleSystem = new THREE.GPUParticleSystem( {
	maxParticles: 2500,
	particleSpriteTex: loader.load("tex/part2.png")
} );
scene.add( ringParticleSystem );
particleSystems.push(ringParticleSystem);

shieldParticleSystem = new THREE.GPUParticleSystem( {
	maxParticles: 2500,
	particleSpriteTex: loader.load("tex/part3.png")
} );
scene.add( shieldParticleSystem );
particleSystems.push(shieldParticleSystem);

options = {
	position: new THREE.Vector3(),
	positionRandomness: 0.5,
	velocity: new THREE.Vector3(),
	velocityRandomness: 0.1,
	color: 0xffffff,
	colorRandomness: 0.02,
	turbulence: .0,
	lifetime: 100,
	size: 20,
	sizeRandomness: 0,
};


// world stuff
{
	var light = new THREE.PointLight( 0x799cfc, 1, 3000000 );
	light.shadow.camera.far = 2000;
	light.position.set( 2000, -7000, 1000 );
	scene.add( light );
}

{
	var light = new THREE.PointLight( 0x799cfc, 1, 3000000 );
	light.shadow.camera.far = 2000;
	light.position.set( -3000, -6000, -1000 );
	scene.add( light );
}

{
	var light = new THREE.PointLight( 0x799cfc, 1, 3000000 );
	light.shadow.camera.far = 2000;
	light.position.set( -2000, -6000, -6000 );
	scene.add( light );
}


scene.add( new THREE.AmbientLight(0x222222) );

var tex = "star1.jpg"
var texy = "star1.jpg"
var texy2 = "star1.jpg"
var urls = [ "tex/" + tex, "tex/" + tex, "tex/" + texy2, "tex/" + texy, "tex/" + tex, "tex/" + tex ];
var textureCube = THREE.ImageUtils.loadTextureCube( urls );
scene.background = textureCube;

currentLevel.beginBasic();
function animate() {

	wheelX = wheelXEvent - wheelXEventPrev;
	wheelXEventPrev = wheelXEvent;
	wheelY = wheelYEvent - wheelYEventPrev;
	wheelYEventPrev = wheelYEvent;

	var mouseDx = mouseXDown[0] - mouseX[0];
	mouseXDown[0] = mouseX[0];
	var mouseDy = mouseYDown[0] - mouseY[0];
	mouseYDown[0] = mouseY[0];

	mouseDx += wheelX * 0.25;
	mouseDy += wheelY * 0.25;

	requestAnimationFrame( animate );

	var timeNow = new Date().getTime();

	var dTime = timeNow - lastTime;
	if (dTime > 60)
		dTime = 60;

	var speedMult = 1;
	if (currentLevel)
		speedMult = currentLevel.speed;
	
	for (var i = 0; i < allUniforms.length; i++)
	{
		if (allUniforms[i].globalTime)
			allUniforms[i].globalTime.value += dTime * 0.003 * speedMult;
		if (allUniforms[i].camPos)
			allUniforms[i].camPos.value.set(camera.position.x, camera.position.y, camera.position.z);
	}

	if (!isPaused)
	{
		currentLevel.update(dTime);

		for (var i = 0; i < particleSystems.length; i++)
			particleSystems[i].update( timeNow - firstTime );

		if (currentlyPressedKeys[27] && difficulty > 0)
		{
			isPaused = true;
			var pause = document.getElementById("pause"); 
			pause.style.display = "block";
		}
	}
	else
	{
		timePaused += dTime;

		if (mouseDown > 0 && timePaused > 400)
		{
			timePaused = 0;
			isPaused = false;
			var pause = document.getElementById("pause"); 
			pause.style.display = "none";
		}
	}

	renderer.render( scene, camera );
	lastTime = timeNow;


	if (window.innerWidth != renderer.getSize().width || window.innerHeight != renderer.getSize().height)
		onWindowResize();
};

animate();


function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

document.addEventListener( 'keydown', handleKeyDown, false );
document.addEventListener( 'keyup', handleKeyUp, false );

var upDownInvert = false;
function doInvert() {
	upDownInvert = !upDownInvert;

	var invert = document.getElementById("invert"); 
	if (invert)
	{
		var s = "Up/Down Movement:<br/>";
		if (!upDownInvert)
			s += "Not ";
		s += "Inverted";

		invert.innerHTML = s;
	}
}
