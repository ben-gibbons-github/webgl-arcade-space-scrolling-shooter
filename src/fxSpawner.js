
function FXSpawner(parent) {
	this.update1 = 0;
	this.update2 = 1000 * 10;
	this.update3 = 0;
	this.parent = parent;
}

FXSpawner.prototype.update = function(dTime) {

	if (this.parent.phase == 3)
	{
		this.parent.uniforms.col.value.x = 0.8;
		this.parent.uniforms.col.value.y = 0.1;
		this.parent.uniforms.col.value.z = 1.0;
		return;
	}

	this.update1 += dTime * this.parent.speed * 0.2;
	this.update2 += dTime * this.parent.speed * 0.2;
	this.update3 += dTime * this.parent.speed * 0.2;

	if (this.update1 > 2000)
	{
		console.log(this.parent.uniforms);
		if (this.parent.phase == 0)
		{
			this.parent.uniforms.col.value.x = 0.1;
			this.parent.uniforms.col.value.y = 0.2;
			this.parent.uniforms.col.value.z = 1.0;
			spawnGridWave();
		}
		else
		{
			spawnOrangeWaveLeft();

			this.parent.uniforms.col.value.x = 1.0;
			this.parent.uniforms.col.value.y = 0.4;
			this.parent.uniforms.col.value.z = 0.1;

			spawnOrangeWave();
		}

		this.update1 = 0;
	}

	if (this.update3 > 1245)
	{
		this.update3 = 0;
		spawnPartWave();
	}

	if (this.update2 > 53470)
	{
		spawnWideRing();
		this.update2 = 0;
	}
}

function FX() {

	this.pos = new THREE.Vector3(0, -10000, 0);	
	this.model = null;
	this.timeAlive = 0;
	this.alpha = 0;
}

FX.prototype.update = function(dTime) {

	this.timeAlive += dTime;

	this.alpha += 0.001 * dTime;
	if (this.alpha > 1)
		this.alpha = 1;

	if (this.update2)
		this.update2(dTime);

	this.pos.y += this.parent.speed * 0.4 * dTime;
	if (this.pos.y > 3000)
		this.parent.kill(this);

	if (this.model)
		this.model.position.y = this.pos.y;

	if (this.uniforms)
	{
		var speedMult = 1;
		if (currentLevel)
			speedMult = currentLevel.speed;
		
		console.log(this.uniforms)
		if (this.uniforms.globalTime)
			this.uniforms.globalTime.value += dTime * 0.003 * speedMult;
		if (this.uniforms.alpha)
			this.uniforms.alpha.value = this.alpha;
	}
}

FX.prototype.kill = function() {
	if (this.model)
		scene.remove(this.model);
}


function spawnOrangeWaveLeft() {

	let fx = new FX();

	var noise = loader.load( "tex/noise.jpg" );
	fx.uniforms = {
		alpha:	{ type: "f", value: 0.0 },
		texture:    { type: "t", value: noise },
		globalTime:	{ type: "f", value: 0.0 },
	};

	var fireMat = new THREE.ShaderMaterial( {
		uniforms: 		fx.uniforms,
		vertexShader:   document.getElementById( 'firevert' ).textContent,
		fragmentShader: document.getElementById( 'firefrag4' ).textContent,
		wireframe: 		false,
		side: 			THREE.DoubleSide,
	});

	var geometry = new THREE.CubeGeometry( 200, 500, 20000 );
	fireMat.side = THREE.DoubleSide;
	fireMat.blending = THREE.AdditiveBlending;
	fireMat.transparent = true;
	fireMat.depthWrite = false;

	var cylinder = new THREE.Mesh( geometry, fireMat );
	cylinder.position.y = -10 * 1000;
	cylinder.position.x = -1 * 1000;
	fx.model = cylinder;
	scene.add( cylinder );

	currentLevel.addGameObj(fx);
	return fx;
}

function spawnOrangeWave() {

	let fx = new FX();

	var noise = loader.load( "tex/noise.jpg" );
	fx.uniforms = {
		alpha:	{ type: "f", value: 0.0 },
		texture:    { type: "t", value: noise },
		globalTime:	{ type: "f", value: 0.0 },
	};

	var fireMat = new THREE.ShaderMaterial( {
		uniforms: 		fx.uniforms,
		vertexShader:   document.getElementById( 'firevert' ).textContent,
		fragmentShader: document.getElementById( 'firefrag3' ).textContent,
		wireframe: 		false,
		side: 			THREE.DoubleSide,
	});

	var geometry = new THREE.CylinderGeometry( 2000 + 20 * Math.random(), 2000 + 20 * Math.random(), 1000, Math.random() > 0.75 ? 3 : 60, 31, true );
	fireMat.side = THREE.DoubleSide;
	fireMat.blending = THREE.AdditiveBlending;
	fireMat.transparent = true;
	fireMat.depthWrite = false;

	var cylinder = new THREE.Mesh( geometry, fireMat );
	cylinder.position.y = -10 * 1000;
	fx.model = cylinder;
	scene.add( cylinder );

	currentLevel.addGameObj(fx);
	return fx;
}

function spawnGridWave() {

	let fx = new FX();

	var noise = loader.load( "tex/noise.jpg" );
	fx.uniforms = {
		alpha:	{ type: "f", value: 0.0 },
		texture:    { type: "t", value: noise },
		globalTime:	{ type: "f", value: 0.0 },
	};

	var fireMat = new THREE.ShaderMaterial( {
		uniforms: 		fx.uniforms,
		vertexShader:   document.getElementById( 'firevert' ).textContent,
		fragmentShader: document.getElementById( 'firefrag2' ).textContent,
		wireframe: 		false,
		side: 			THREE.DoubleSide,
	});

	var geometry = new THREE.CylinderGeometry( 2000 + 20 * Math.random(), 2000 + 20 * Math.random(), 1000, Math.random() > 0.75 ? 3 : 60, 31, true );
	fireMat.side = THREE.DoubleSide;
	fireMat.blending = THREE.AdditiveBlending;
	fireMat.transparent = true;
	fireMat.depthWrite = false;

	var cylinder = new THREE.Mesh( geometry, fireMat );
	cylinder.position.y = -10 * 1000;
	fx.model = cylinder;
	scene.add( cylinder );

	currentLevel.addGameObj(fx);
	return fx;
}


function spawnWideRing() {

	let fx = new FX();

	var size = 800;

	material =  new THREE.MeshPhongMaterial( {
		specular:  		0x111111,
		map: loader.load("tex/asteroid.jpg"),
		bumpScale: 20,
		emissive: 		0x000000,
		color: 			0x000000,
		wireframe: 		false,
	});

	var geometry = new THREE.TorusGeometry( 2400, 40, 8, 64 );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = -Math.PI / 2;

	fx.model = cylinder;
	scene.add( cylinder );

	currentLevel.addGameObj(fx);
	return fx;
}

function spawnPartWave() {

	let fx = new FX();

	var rot = Math.PI * Math.random() * 2;
	fx.pos.x = Math.cos(rot) * 1500;
	fx.pos.z = Math.sin(rot) * 1500;

	fx.update2 = function(dTime) {

		options.positionRandomness = 0;
		options.velocityRandomness = 0;
		options.velocity.x = 0;
		options.velocity.z = 0;
		options.colorRandomness = 0.1;
		options.lifetime = 1500;
		options.turbulence = 0;

		options.position.x = this.pos.x + Math.cos(this.timeAlive * 0.001) * 100;
		options.position.y = this.pos.y;
		options.position.z = this.pos.z + Math.sin(this.timeAlive * 0.001) * 100;

		options.color = new THREE.Color(this.parent.uniforms.col.value.x, this.parent.uniforms.col.value.y, this.parent.uniforms.col.value.z);
		options.size = (100 + 100 * Math.random()) * this.timeAlive * 0.00001;
		cloudParticleSystem.spawnParticle( options );
	}

	currentLevel.addGameObj(fx);
	return fx;
}