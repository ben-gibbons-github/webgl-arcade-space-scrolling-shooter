var lastEnemyDeathTime = 0;

function Enemy() {

	this.gun = null;
	this.team = 2;

	this.pos = new THREE.Vector3(0, -200, 0);	
	this.size = new THREE.Vector3(200, 200, 200);

	this.speed = new THREE.Vector3(0, 0, 0);
	this.speedAdd = new THREE.Vector3(0, 0, 0);

	this.damageTime = 0;
	this.maxDamageTime = 1000.0;
	this.timeAlive = 0;
	this.maxLifeTime = -1;
	this.collisionDamage = 8 * difficulty * (1 + difficulty);
	this.selfCollisionDamage = 10000;
	this.life = 20;
	this.maxSpeed = 1;

	this.model = null;
	this.accel = 0.0075;
	this.colorAmt = 0;
	this.scaleAmt = 0;
	this.color = new THREE.Color(0.9 + 0.2 * Math.random(), 0.7 + 0.1 * Math.random(), 0.9 + 0.2 * Math.random());

	this.useDeathDrop = false;
	this.lifeBonus = (20 - difficulty * 2) * 0.6;
	this.scoreBonus = 20;
	this.isLeaving = false;

	this.bulletsAlive = 0;
	this.modelMult = 1;

	this.useSquareDeath = false;
}

Enemy.prototype.findTarget = function() {
	this.target = this.parent.findTarget(this.pos.x, this.pos.y, this.pos.z, this.team, this);
}


Enemy.prototype.getBullet = function(bullet) {

	var newPos = this.pos.clone();
	newPos.y += this.size.y / 2;
	bullet.pos = newPos;

	bullet.speed = new THREE.Vector3(0, this.parent.speed * 0.4, 0);

	bullet.size = this.size.x * 2;
	bullet.lifeTime = 16000;

	var material = new THREE.MeshBasicMaterial( {map: loader.load("tex/beam.jpg"), color: new THREE.Color(1.2, 0.5, 0.2), side: THREE.DoubleSide, transparent: true, opacity: 1} );
	material.blending = THREE.AdditiveBlending;
	material.depthWrite = false;

	var size =  this.size.x * 2;
	var geometry = new THREE.CubeGeometry( size , size * 0.2, size );
	var plane = new THREE.Mesh( geometry, material );

	scene.add( plane );

	bullet.model = plane;

	if (this.getBullet2)
		this.getBullet2(bullet);

	bullet.updateCol = function(dTime) {

		if (!this.hitSomething)
		{
			var hit = this.parent.testCollisionBox(this.pos.x, this.pos.y, this.pos.z, this.size, this.size * 0.2, this.size, this.gunParent.parent.team, this.gunParent.parent);
			if (hit)
			{
				hit.hit(this.gunParent.damage);
				this.hitSomething = true;

				options.positionRandomness = 100;
				options.velocityRandomness = 0.002;
				options.velocity.x = 0;
				options.velocity.y = 0;
				options.velocity.z = 0;
				options.colorRandomness = 0.1;
				options.lifetime = 1000;
				options.turbulence = 0;

				options.position.x = hit.pos.x;
				options.position.y = hit.pos.y;
				options.position.z = hit.pos.z;

				options.color = new THREE.Color(4, 0.25, 0.25);
				options.size = 800;
				cloudParticleSystem.spawnParticle( options );

				options.velocityRandomness = 0.2;
				options.lifetime = 1000;
				options.size = 40;
				cloudParticleSystem.spawnParticle( options );

				options.velocityRandomness = 0.4;
				cloudParticleSystem.spawnParticle( options );

				options.velocityRandomness = 0.6;
				cloudParticleSystem.spawnParticle( options );
			}
		}
	}

	bullet.update2 = function(dTime) {
		this.speed.y = 0;
		var mult = this.timeAlive / 500;
		if (mult > 1)
		{
			mult = 1;
			this.speed.y = (1 + difficulty) * 15;
		}

		this.model.scale.x = mult;
		this.model.scale.y = mult;
		this.model.scale.z = mult;

		var cMult = 4 - mult * 3;
		this.model.material.color.r = cMult * 0.2;
		this.model.material.color.g = cMult * (0.1 + this.timeAlive * 0.00025);

		var blueMult = 0.8 + this.timeAlive * 0.0004;
		if (blueMult > 1.1)
			blueMult = 1.1;
		this.model.material.color.b = cMult * blueMult;
	}	
	
}

Enemy.prototype.getSpeedTarget = function(dTime) {
	
	this.speedAdd.y = 1;
}

Enemy.prototype.update2 = function(dTime) {

}

Enemy.prototype.updateRot = function(dTime) {
	this.model.rotation.y = Math.PI / 2 - this.speed.x * 0.2 + Math.cos(this.timeAlive * 0.001) * 0.05;
	this.model.rotation.z = Math.PI / 2 - this.speed.z * 0.2 + Math.sin(this.timeAlive * 0.0008) * 0.05;
}

Enemy.prototype.update = function(dTime) {


	if (this.life <= 0 || this.isLeaving)
	{
		this.maxSpeed = currentLevel.speed * 2;
		this.accel = 0.0175;

	} else if (this.maxLifeTime > 0 && this.timeAlive > this.maxLifeTime)
	{
		this.life = 0;
		this.killMe();
	}

	if (this.scaleAmt == 0 && this.parent.gameObjects.length < 40 && this.parent.phase != 3)
	{
		options.positionRandomness = 0;
		options.velocityRandomness = 0;
		options.velocity.x = 0;
		options.velocity.z = 0;
		options.colorRandomness = 0.1;
		options.lifetime = 3000;
		options.turbulence = 0;

		options.position.x = this.pos.x;
		options.position.y = this.pos.y;
		options.position.z = this.pos.z;

		options.color = new THREE.Color(0.1, 0.4, 1);
		options.size = 40 + 60 * Math.random();
		cloudParticleSystem.spawnParticle( options );
	}

	if (!this.isLeaving)
	{
		if (this.parent.phase == 3)
		{
			this.colorAmt -= 0.00005 * dTime * this.maxSpeed;

			if (this.colorAmt < 0)
				this.colorAmt = 0;
		}
		else
			this.colorAmt += 0.00005 * dTime * this.maxSpeed;

		this.scaleAmt += 0.0002 * dTime * this.maxSpeed;
	}
	else
	{
		this.colorAmt -= 0.001 * dTime;
		this.scaleAmt -= 0.0005 * dTime;
	}	

	if (this.scaleAmt < 0)
	{
		this.kill2 = null;
		this.parent.kill(this);
	}

	if (this.colorAmt > 1)
		this.colorAmt = 1;
	if (this.scaleAmt > 1)
		this.scaleAmt = 1;


	let myShip = this;
	if (this.model)
	{
		this.model.traverse( function ( child ) {
			if ( child.isMesh ) {
				
				child.scale.x = myShip.scaleAmt * myShip.modelMult;
				child.scale.y = myShip.scaleAmt * myShip.modelMult;
				child.scale.z = myShip.scaleAmt * myShip.modelMult;

				child.material.color.r = myShip.colorAmt * myShip.color.r;
				child.material.color.g = myShip.colorAmt * myShip.color.g;
				child.material.color.b = myShip.colorAmt * myShip.color.b;

				if (child.material.emissive)
				{
					if (myShip.life <= 0)
						child.material.emissive.r = 2;
					else if (myShip.damageTime > 0.0)
						child.material.emissive.r = 2 * myShip.damageTime / myShip.maxDamageTime;
					else
						child.material.emissive.r = 0;
				}
			}
		});
	}

	if (this.life > 0 && !this.isLeaving)
		this.update2(dTime);

	this.damageTime -= dTime;
	this.timeAlive += dTime;

	if (this.gun && this.pos.y < -1500 && this.parent.player && this.life > 0) {

		this.gun.update(dTime);
		if (this.bulletsAlive == 0 || difficulty > 0.8)
			this.gun.fire();
	}

	var drag = 0.002 * dTime;

	var speedL = this.speed.length();
	if (speedL > drag)
		speedL -= drag;
	else
		speedL = 0;

	this.speed.setLength(speedL);


	// setup speed add based on keys
	this.speedAdd.x = 0;
	this.speedAdd.y = 0;
	this.speedAdd.z = 0;

	if (this.isLeaving)
		this.speedAdd.y = -1;
	else if (this.life > 0)
		this.getSpeedTarget();
	else
		this.speedAdd.y = 1;

	if (this.speedAdd.length() > 0)
	{
		var speed = this.accel * dTime;
		this.speedAdd.setLength(speed);
		this.speed.add(this.speedAdd);
	}

	if (this.speed.length() > this.maxSpeed)
		this.speed.setLength(this.maxSpeed);

	this.speedAdd.set(this.speed.x, this.speed.y, this.speed.z);
	this.pos.add(this.speedAdd.multiplyScalar(dTime * 0.4));

	if (this.model)
	{
		this.model.position.set(this.pos.x, this.pos.y, this.pos.z);

		this.updateRot();

		if (this.damageTime > 0)
			this.model.rotation.y += this.damageTime / this.maxDamageTime * Math.cos(this.timeAlive) * 0.1;

	}

	this.updateCol();

	if (this.pos.y > 100 + this.size.y)
		this.parent.kill(this);
}

Enemy.prototype.updateCol = function() {

	if ((this.collisionDamage > 0 || this.selfCollisionDamage > 0) && !this.isLeaving)
	{
		var hit = this.parent.testCollision(this.pos.x, this.pos.y, this.pos.z, this.team, this.size.x / 2, this);
		if (hit)
		{
			hit.hit(this.collisionDamage, true);
			this.life -= this.selfCollisionDamage;	

			if (this.life <= 0)
			{
				this.parent.kill(this);
			}

			this.selfCollisionDamage = 0;
			this.collisionDamage = 0;
		}
	}
}

Enemy.prototype.kill = function() {
	scene.remove(this.model);

	if (this.pos.y < 0 && enableParticleEffects && this.kill2)
		this.kill2();
}


Enemy.prototype.hit = function(damage) {

	if (this.life > 0)
	{
		this.damageTime = this.maxDamageTime;
		this.life -= damage;
		if (this.life <= 0)
		{
			if (thePlayer)
			{
				thePlayer.fuel = thePlayer.maxFuel;
				thePlayer.gainTime = thePlayer.maxGainTime;
				thePlayer.life += this.lifeBonus;

				score += this.scoreBonus;

				if (thePlayer.life > thePlayer.maxLife)
					thePlayer.life = thePlayer.maxLife;
			}

			this.killMe();
		}
	}
}

Enemy.prototype.killMe = function() {

	if (!this.useDeathDrop)
	{
		this.parent.kill(this);
	}
	else
		this.kill2();
}

function DeathWave(x, y, z, size, alphaChange, dist, brightness) {
	this.alpha = 0;

	var size = size;
	if (!dist)
		dist = 0;

	if (!brightness)
		brightness = 1;
	this.brightness = brightness;

	this.uniforms = {
		alpha:	{ type: "f", value: 1.0 },
		globalTime:	{ type: "f", value: 0.0 },
		dist:	{ type: "f", value: dist },
	};

	var material = new THREE.ShaderMaterial( {
		uniforms: 		this.uniforms,
		vertexShader:   document.getElementById( 'firevert2' ).textContent,
		fragmentShader: document.getElementById( 'firefrag5' ).textContent,
		wireframe: 		false,
		side: 			THREE.DoubleSide,
	});


	material.transparent = true;
	material.blending = THREE.AdditiveBlending;
	material.depthWrite = false;

	var geometry = new THREE.SphereGeometry( size , 40, 40 );
	var sphere = new THREE.Mesh( geometry, material );

	sphere.scale.x = 0;
	sphere.scale.y = 0;
	sphere.scale.z = 0;
	this.alphaChange = alphaChange;

	sphere.position.set(x, y, z);

	this.model = sphere;
	scene.add(sphere);
}

DeathWave.prototype.update = function(dTime) {

	this.alpha += dTime * this.alphaChange;
	if (this.alpha > 1)
		this.parent.kill(this);

	var o = 1 - this.alpha;
	this.uniforms.alpha.value = o * this.brightness;
	this.uniforms.globalTime.value += dTime * 3.0;

	this.model.scale.set(this.alpha, this.alpha, this.alpha);
}

DeathWave.prototype.kill = function() {
	scene.remove(this.model);
}


function DeathPart() {
	this.timeAlive = 0;

	this.color = new THREE.Color(0.7, 0.1, 1.6);
}

// particle death
Enemy.prototype.kill2 = function() {

	if (this.model)
	{
		this.model.traverse( function ( child ) {
			if ( child.isMesh ) {
				
				child.material.emissive.r = 0;
				child.material.emissive.g = 0;
				child.material.emissive.b = 0;
			}
		});
	}

	var fast = false;
	if (lastTime < lastEnemyDeathTime + 500)
		fast = true;
	else
		lastEnemyDeathTime = lastTime;

	this.parent.addGameObj(new DeathWave(this.pos.x, this.pos.y, this.pos.z, fast ? 500 : 800, fast ? 0.0035 : 0.002, 0.5));


	for (var i = 0; i < 5; i++)
	{
		var part = new DeathPart();
		part.pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);

		if (!this.useSquareDeath)
			part.model = this.model.clone();
		else
		{
			material =  new THREE.MeshPhongMaterial( {
				specular:  		0x111111,
				map: loader.load("tex/asteroid.jpg"),
				bumpScale: 20,
				emissive: 		0x000000,
				color: 			0x000000,
				wireframe: 		false,
			});
			var geometry = new THREE.CubeGeometry( this.size.x , this.size.x, this.size.x );
			var sphere = new THREE.Mesh( geometry, material );
			sphere.scale.x = 0;
			sphere.position.y = -10000;
			part.model = sphere;
		}

		scene.add(part.model);

		var mult = 1.5;
		part.pos.x += (Math.random() - 0.5) * this.size.x * mult;
		part.pos.y += (Math.random() - 0.5) * this.size.y * mult;
		part.pos.z += (Math.random() - 0.5) * this.size.z * mult;

		var speedMult = 2;
		part.speed = new THREE.Vector3((Math.random() - 0.5) * speedMult, (Math.random() - 0.5) * speedMult, (Math.random() - 0.5) * speedMult);

		var sizeMult = 0.5;

		part.model.scale.x *= sizeMult;
		part.model.scale.y *= sizeMult;
		part.model.scale.z *= sizeMult;
		part.lifeTime = fast ? 200 : 800;

		part.size = sizeMult;
		this.parent.addGameObj(part);

		options.positionRandomness = 100;
		options.velocityRandomness = 0.2;
		options.velocity.x = 0;
		options.velocity.y = 0;
		options.velocity.z = 0;
		options.colorRandomness = 0.1;
		options.lifetime = fast ? 200 : 600;
		options.turbulence = 0;

		options.position.x = this.pos.x;
		options.position.y = this.pos.y;
		options.position.z = this.pos.z;

		options.color = new THREE.Color(0.7, 0.2, 1.6);
		options.size = 800;
		cloudParticleSystem.spawnParticle( options );

		options.velocityRandomness = 0.2;
		options.lifetime = fast ? 400 : 1000;
		options.size = 40;
		cloudParticleSystem.spawnParticle( options );

		options.velocityRandomness = 0.4;
		cloudParticleSystem.spawnParticle( options );

		options.velocityRandomness = 0.6;
		cloudParticleSystem.spawnParticle( options );

		options.velocityRandomness = 0.1;
		options.size = 14;
		options.lifetime = 10000;
		options.turbulence = 0.01;
		options.velocity.y = this.parent.speed * 0.02;

		for (var j = 0; j < 2; j++)
			cloudParticleSystem.spawnParticle( options );
	}	
}

DeathPart.prototype.update = function(dTime) {

	this.timeAlive += dTime;
	if (this.timeAlive >= this.lifeTime)
		this.parent.kill(this);

	var mult = 0.4;
	this.pos.x += this.speed.x * dTime * mult;
	this.pos.y += this.speed.y * dTime * mult;
	this.pos.z += this.speed.z * dTime * mult;

	this.model.scale.x = this.size * (1.0 - this.timeAlive / this.lifeTime);
	this.model.scale.y = this.size * (1.0 - this.timeAlive / this.lifeTime);
	this.model.scale.z = this.size * (1.0 - this.timeAlive / this.lifeTime);

	this.model.position.set(this.pos.x, this.pos.y, this.pos.z);

	options.positionRandomness = 30;
	options.velocityRandomness = 0;
	options.velocity.x = 0;
	options.velocity.y = 0;
	options.velocity.z = 0;
	options.colorRandomness = 0.4;
	options.lifetime = 1000;
	options.turbulence = 0;

	options.position.x = this.pos.x;
	options.position.y = this.pos.y;
	options.position.z = this.pos.z;

	options.color = this.color;
	options.size = 50 * (1.0 - this.timeAlive / this.lifeTime) * Math.random();
	cloudParticleSystem.spawnParticle( options );
}

DeathPart.prototype.kill = function(dTime) {
	scene.remove(this.model);
}