
enableParticleEffects = true;
lives = 0;
difficulty = 0;
passed = 1;
score = 0;

function selectDiff(diff) {
	difficulty = diff * 0.5;

	var ui = document.getElementById("diff"); 
	ui.style.display = "none";

	var livesHtml = document.getElementById("lives"); 
	livesHtml.style.display = "block";
	var scoreHtml = document.getElementById("score"); 
	scoreHtml.style.display = "block";
	var health = document.getElementById("health"); 
	health.style.display = "block";
	var health = document.getElementById("fuel"); 
	health.style.display = "block";

	currentLevel.restart();
}

function Level() {

	this.fx = new FXSpawner(this);

	this.sparks = null;
	this.sparks2 = null;
	this.setBasicVars();

	this.enemyShell = { };
	this.enemyShell.parent = this;
	this.enemyShell.team = 2;
	this.enemyShell.bulletsAlive = 0;
	this.shellGun = new Gun(this.enemyShell);

	this.shellGun.damage = 20 * difficulty;
}

Level.prototype.beginBasic = function() {

	this.makeClouds();

	this.addShipObj(this.player = new Player());
	this.player.inv = 0;
}

Level.prototype.setBasicVars = function() {

	this.gameObjects = [];
	this.shipObjects = [];

	this.nextEvent = null;
	this.lastAdded = null;

	this.speedTrack = 1;
	this.speed = 1;
	this.targetSpeed = 1;
	this.speedChange = 0.5;
	this.timeAlive = 0;
	this.playerDeathTime = 0;
	this.viewMode = 0; // 0 = front, 1 = top, 2 = side

	score = 0;
	passed = 1;
}

Level.prototype.restart = function() {
	enableParticleEffects = false;

	for (var i = 0; i < this.gameObjects.length; i++)
	{
		this.gameObjects[i].isDead = true;
		this.gameObjects[i].kill();
	}

	enableParticleEffects = true;

	this.setBasicVars();

	this.begin();
}

Level.prototype.addEventObject = function(e) {

	if (!this.nextEvent)
		this.nextEvent = e;

	if (this.lastAdded)
		this.lastAdded.next = e;

	this.lastAdded = e;
}

Level.prototype.addEvent = function(func, time) {

	var e = { };
	e.func = func;
	e.time = time;
	this.addEventObject(e)
}

Level.prototype.update2 = function(dTime) {

}

Level.prototype.update = function(dTime) {

	this.fx.update(dTime);

	if (this.player)
	{
		this.timeAlive += dTime;
		
		if (this.nextEvent && this.timeAlive > this.nextEvent.time)
		{
			this.nextEvent.func();
			this.nextEvent = this.nextEvent.next;
		}
	}
	else if (difficulty > 0)
	{
		if (lives > 0)
		{
			this.playerDeathTime += dTime;
			if (this.playerDeathTime > 5000)
			{
				{
					this.addShipObj(this.player = new Player());
					this.playerDeathTime = 0;
				}
			}
		}
		else
		{

			var red = document.getElementById("red"); 
			red.style.display = "block";
			var sub = document.getElementById("sub"); 
			sub.style.display = "block";

			var livesHtml = document.getElementById("lives"); 
			livesHtml.style.display = "none";
			var scoreHtml = document.getElementById("score"); 
			scoreHtml.style.display = "score";
			var health = document.getElementById("health"); 
			health.style.display = "none";
			var health = document.getElementById("fuel"); 
			health.style.display = "none";

			this.playerDeathTime += dTime;
			if ((this.playerDeathTime > 1000 && (currentlyPressedKeys[32] || currentlyPressedKeys[13]))
				|| (this.playerDeathTime > 2000 && mouseDown > 0))
			{
				var red = document.getElementById("red"); 
				red.style.display = "none";
				var sub = document.getElementById("sub"); 
				sub.style.display = "none";

				difficulty = 0;
				var diff = document.getElementById("diff"); 
				diff.style.display = "block";

			}
		}
	}

	var targetSpeed = this.targetSpeed;
	var speedChange = this.speedChange * dTime * 0.001;
	if (!this.player)
	{
		targetSpeed = 0;
	}

	if (Math.abs(this.speedTrack - targetSpeed) < speedChange)
		this.speedTrack = targetSpeed;
	else
	{
		if (this.speedTrack > targetSpeed)
			speedChange = -speedChange;
		this.speedTrack += speedChange;
	}
	this.speed = this.speedTrack;
	if (this.player && this.player.speeding)
		this.speed *= 3;

	for (var i = 0; i < this.gameObjects.length; i++)
	{
		var obj = this.gameObjects[i];
		obj.update(dTime);
	}

	this.update2(dTime);

	var speed = this.speed * 1.4 * dTime;
	this.sparks.position.y += speed;
	if (this.sparks.position.y > 5000)
		this.sparks.position.y -= 10000;
	this.sparks2.position.y += speed;

	if (this.sparks2.position.y > 5000)
		this.sparks2.position.y -= 10000;
}

Level.prototype.addShipObj = function(newObj) {

	this.shipObjects.push(newObj);
	this.addGameObj(newObj);
}

Level.prototype.addGameObj = function(newObj) {

	newObj.parent = this;
	this.gameObjects.push(newObj);
}

Level.prototype.kill = function(obj) {
	obj.isDead = true;
	obj.kill();
	removeFromArray(obj, this.gameObjects);
	removeFromArray(obj, this.shipObjects);
}

Level.prototype.distance = function(x, y, z, x2, y2, z2) {

	var dx = (x - x2) * (x - x2);
	var dy = (y - y2) * (y - y2);
	var dz = (z - z2) * (z - z2);
	return Math.sqrt(dx + dy + dz);
}

Level.prototype.testCollisionBox = function(x, y, z, xSize, ySize, zSize, team, size, obj, objs) {

	// iterate through all of the game objects
	for (var i = 0; i < this.shipObjects.length; i++)
	{
		var obj2 = this.shipObjects[i];

		// -1 = no team
		if (obj2 != obj && obj2.team != team)
		{	
			{
				var dx = Math.abs(x - obj2.pos.x);
				var dy = Math.abs(y - obj2.pos.y);
				var dz = Math.abs(z - obj2.pos.z);

				if (dx < (xSize + obj2.size.x) / 2 && dy < (ySize + obj2.size.y) / 2 && dz < (zSize + obj2.size.z) / 2)
				{
					if (!objs || !objs.includes(obj2))
						return obj2;
				}
			}
		}
	}
}



Level.prototype.leaveAllEnemies = function() {

	for (var i = 0; i < this.shipObjects.length; i++) 
	{
		if (this.shipObjects[i].life > 0)
			this.shipObjects[i].isLeaving = true;


	}

}


Level.prototype.testCollision = function(x, y, z, team, size, obj, objs) {

	// iterate through all of the game objects
	for (var i = 0; i < this.shipObjects.length; i++)
	{
		var obj2 = this.shipObjects[i];

		// -1 = no team
		if (obj2 != obj && obj2.team != team)
		{
			if (obj2.customCol)
			{
				if (obj2.customCol(x, y, z, size))
					return obj2;
			}
			else
			{
				var dx = (x - obj2.pos.x) * (x - obj2.pos.x);
				var dy = (y - obj2.pos.y) * (y - obj2.pos.y);
				var dz = (z - obj2.pos.z) * (z - obj2.pos.z);
				var dist = Math.sqrt(dx + dy + dz);

				if (dist < size + obj2.size.x / 2)
				{
					if (!objs || !objs.includes(obj2))
						return this.shipObjects[i];
				}
			}
		}
	}
}


Level.prototype.testCollisionY = function(x, z, x2, z2, team) {

	// iterate through all of the game objects
	for (var i = 0; i < this.shipObjects.length; i++)
	{
		var obj2 = this.shipObjects[i];

		// -1 = no team
		if (obj2.team != team)
		{
			if (x < obj2.pos.x + obj2.size.x / 2 && x2 > obj2.pos.x - obj2.size.x / 2 &&
				z < obj2.pos.z + obj2.size.z / 2 && z2 > obj2.pos.z - obj2.size.z / 2)
				return obj2;
		}

	}
}

Level.prototype.findTarget = function(x, y, z, team, obj) {

	var bestDist = 10000;
	var bestTarget = null;

	// iterate through all of the game objects
	for (var i = 0; i < this.shipObjects.length; i++)
	{
		var obj2 = this.shipObjects[i];

		// -1 = no team
		if (obj2 != obj && obj2.team != team)
		{
			var dx = (x - obj2.pos.x) * (x - obj2.pos.x);
			var dy = (y - obj2.pos.y) * (y - obj2.pos.y);
			var dz = (z - obj2.pos.z) * (z - obj2.pos.z);
			var dist = Math.sqrt(dx + dy + dz);

			if (dist < bestDist)
			{
				bestDist = dist;
				bestTarget = obj2;
			}
		}
	}

	return bestTarget;
}

function removeFromArray(obj, ary) 
{
	var index = ary.indexOf(obj);
	if (index > -1)
	 	ary.splice(index, 1);
}


Level.prototype.makeClouds = function()
{
	if (this.sparks)
		return;

	var w = 20;
	var h = 20;
	var planeGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
	var mesh = new THREE.Mesh(planeGeometry);
	mesh.rotation.x = -Math.PI / 2;
	var geometry = new THREE.Geometry();
	
	var start = -2000;
	var end = 2000;
	var step = 250;

	for (var x = start; x < end; x += step)
	{
		for (var z = start; z < end; z += step)
		{
			var y = -Math.random() * 5000
			mesh.position.set(x, y, z);
			
			mesh.position.x += Math.random() * step - step / 2;
			mesh.position.z += Math.random() * step - step / 2;
			
			THREE.GeometryUtils.merge(geometry, mesh);
		}
	}


	tex.wrapS = THREE.RepeatWrapping;
	var maxAnisotropy = renderer.getMaxAnisotropy();
	tex.anisotropy = maxAnisotropy;

	var material = new THREE.MeshBasicMaterial({
		map: loader.load("tex/part1.png"), wireframe: false, side: THREE.DoubleSide});
	material.blending = THREE.AdditiveBlending;
	material.transparent = true;
	material.depthWrite = false;
	this.starMat = material;

	this.sparks = new THREE.Mesh(geometry, material);
	scene.add( this.sparks );
	this.sparks2 = new THREE.Mesh(geometry, material);
	this.sparks2.position.y -= 5000;
	scene.add( this.sparks2 );

	{
		var material = new THREE.MeshBasicMaterial({
			map: loader.load("tex/part1.png"), wireframe: false, side: THREE.DoubleSide});
		material.color = new THREE.Color(0.1, 0.2, 1);
		material.blending = THREE.AdditiveBlending;
		material.transparent = true;
		material.depthWrite = false;
		this.starMat2 = material;

		var w = 6000;
		var h = 50;
		var planeGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
		var mesh = new THREE.Mesh(planeGeometry, material);
		mesh.rotation.x = -Math.PI / 2;
		mesh.position.y = -9.5 * 1000

		scene.add( mesh );	

		var w = 6000;
		var h = 5000;

		var material = new THREE.MeshBasicMaterial({
			map: loader.load("tex/part1.png"), wireframe: false, side: THREE.DoubleSide});
		material.color = new THREE.Color(0.1, 0.2, 0.3);
		material.blending = THREE.AdditiveBlending;
		material.transparent = true;
		material.depthWrite = false;
		this.starMat3 = material;

		var planeGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
		var mesh = new THREE.Mesh(planeGeometry, material);
		mesh.rotation.x = -Math.PI / 2;
		mesh.position.y = -9.5 * 1000

		scene.add( mesh );	
	}

	var noise = loader.load( "tex/noise.jpg" );

	noise.wrapS = THREE.RepeatWrapping;
	noise.wrapT = THREE.RepeatWrapping;

	uniforms = {
		globalTime:	{ type: "f", value: 0.0 },
		col: 		{ type: "v3", value: new THREE.Vector3(0.1, 0.2, 1.0) },
		texture:    { type: "t", value: noise },
	};
	this.uniforms = uniforms;

	allUniforms.push(uniforms);

	var fireMat = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		vertexShader:   document.getElementById( 'firevert3' ).textContent,
		fragmentShader: document.getElementById( 'firefrag' ).textContent,
		wireframe: 		false,
		side: 			THREE.DoubleSide,
	});

	var geometry = new THREE.CylinderGeometry( 4000, 4000, 10000, 40, 40, true );
	fireMat.side = THREE.DoubleSide;
	fireMat.blending = THREE.AdditiveBlending;
	fireMat.transparent = true;
	fireMat.depthWrite = false;
	var cylinder = new THREE.Mesh( geometry, fireMat );
	cylinder.position.y = -3000;
	this.cloud = cylinder;
	scene.add( cylinder );
}
