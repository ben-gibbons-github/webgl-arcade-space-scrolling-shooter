camLookX = 0;
camLookY = 0;
camLookZ = 0;

function Player() {

	thePlayer = this;

	this.baseGun = new Gun(this);

	this.powerGuns = [];
	this.lastPowerGun = 0;
	this.makePowerGuns();

	this.gun = this.baseGun;

	this.team = 1;

	this.pos = new THREE.Vector3(0, -600, 0);	
	this.size = new THREE.Vector3(30, 30, 30);

	this.speed = new THREE.Vector3(0, 0, 0);
	this.speedAdd = new THREE.Vector3(0, 0, 0);

	this.lossRate = 0.0025;

	this.maxInv = 1500;
	this.inv = this.maxInv;
	this.damageTime = 0;
	this.maxDamageTime = 1000.0;
	this.timeAlive = 0;
	this.maxLife = 100;

	this.maxFuel = 100;
	this.gainTime = 0;
	this.maxGainTime = 500;
	this.fuel = this.maxFuel;

	this.life = this.maxLife;

	this.model = null;
	let player = this;

	this.upKey = [87, 38];
	this.downKey = [83, 40];
	this.leftKey = [65, 37];
	this.rightKey = [68, 39];
	this.dashKey = [32, 13];
	this.speedKey = [16];
	this.shootDist = 600;

	this.moveBorder = 600;
	var planeGeometry = new THREE.PlaneGeometry(200, 20, 1, 1);
	var mesh = new THREE.Mesh(planeGeometry);
	var geometry = new THREE.Geometry();

	mesh.position.set(-this.moveBorder - 100, this.pos.y, 0);
	mesh.rotation.y = Math.PI / 2;
	THREE.GeometryUtils.merge(geometry, mesh);

	mesh.position.set(this.moveBorder + 100, this.pos.y, 0);
	THREE.GeometryUtils.merge(geometry, mesh);

	var material = new THREE.MeshBasicMaterial({
		map: loader.load("tex/part1.png"), wireframe: false, side: THREE.DoubleSide});
	material.blending = THREE.AdditiveBlending;
	material.transparent = true;
	material.depthWrite = false;

	this.xBorders = new THREE.Mesh(geometry, material);
	scene.add(this.xBorders);

	this.zBorders = new THREE.Mesh(geometry, material);
	this.zBorders.rotation.y = Math.PI / 2;
	scene.add(this.zBorders);

	this.bulletsAlive = 0;
	this.spinTime = 0;
	this.maxSpinTime = 500;
	this.spinChargeTime = 0;
	this.maxSpinChargeTime = 800;
	weaponHtmlTimer = 0;
	this.cameraLocked = true;
	this.cameraLockedAmout = 0;

	modelLoader.load(

		'models/star_viper_free/scene.gltf',

		function ( gltf ) {

			shipReflective = 0.5;
			gltf.scene.traverse( function ( child ) {
				if ( child.isMesh ) {

					child.material =  new THREE.MeshPhongMaterial( {

						envMap: 		textureCube,
						emissive: 		0xff0000,
						// emissiveMap: 	child.material.emissiveMap,
						reflectivity:   shipReflective,
						specular:  		0xffffff,

						normalMap: 		child.material.normalMap,
						aoMap: 			child.material.aoMap,
						color: 			0xffffff,
						wireframe: 		false,
					});
					child.rotation.y = Math.PI / 2;

					child.scale.x *= 0.9;
					child.scale.y *= 0.9;
					child.scale.z *= 0.9;

				}
			});

			if (!player.isDead)
			{
				player.model = gltf.scene;
				scene.add( player.model );
			}
			else
				scene.remove( player.model );
		},
		// called while loading is progressing
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' , error);

		}
	);

	var w = 60;
	var h = 60;
	var planeGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
	var mesh = new THREE.Mesh(planeGeometry);
	mesh.rotation.x = -Math.PI / 2;
	var geometry = new THREE.Geometry();
	
	for (var i = 1; i < 11; i++)
	{
		if (i > 5)
			mesh.scale.set(0.3, 0.3, 0.3);
		mesh.position.set(0, -250 * i, 0);
		
		THREE.GeometryUtils.merge(geometry, mesh);
	}

	tex.wrapS = THREE.RepeatWrapping;
	var maxAnisotropy = renderer.getMaxAnisotropy();
	tex.anisotropy = maxAnisotropy;

	var material = new THREE.MeshBasicMaterial({
		map: loader.load("tex/target.jpg"), wireframe: false, side: THREE.DoubleSide});
	material.blending = THREE.AdditiveBlending;
	material.transparent = true;
	material.depthWrite = false;

	var aimer = new THREE.Mesh(geometry, material);
	this.aimer = aimer;
	scene.add( aimer );
}

Player.prototype.makePowerGuns = function() {

	var ringBeam = new Gun(this);
	ringBeam.maxClipSize = 6;
	ringBeam.maxClipTime = 200;
	ringBeam.maxRof = 50;
	ringBeam.damage = 10 + difficulty * 2;
	this.powerGuns.push(ringBeam);

	var rocket = new Gun(this);
	rocket.maxClipSize = 2;
	rocket.maxClipTime = 800;
	rocket.damage = 100 + difficulty * 20;
	rocket.maxRof = 300;
	this.powerGuns.push(rocket);
}


Player.prototype.getPowerup = function(type) {

	if (type >= 0)
	{
		this.lossRate = 0.0025;
		this.life += 20;
		if (this.life > this.maxLife)
			this.life = this.maxLife;

		this.fuel = this.maxFuel;
		this.gainTime = this.maxGainTime;
		this.inv = 1000;
		this.lastPowerGun = type;
		this.gun = this.powerGuns[type];

		var weaponHtml = document.getElementById("weapon"); 
		if (weaponHtml)
		{
			weaponHtml.style.display = "block";
			if (type == 0)
				weaponHtml.innerHTML = "Plasma Beam";
			else
				weaponHtml.innerHTML = "Rocket Launcher";
			weaponHtmlTimer = 5 * 1000;
		}
	}
	else
	{
		this.fuel += 15;
		// if (this.fuel > this.maxFuel)
			this.fuel = this.maxFuel;

		this.life += 15;
		if (this.life > this.maxLife)
			this.life = this.maxLife;
	}
}

Player.prototype.getBullet = function(bullet) {

	var newPos = this.pos.clone();
	newPos.y -= 20;
	bullet.pos = newPos;

	var l = Math.sin(this.shootY);
	var v = new THREE.Vector3(l * Math.cos(-this.shootX), -(1.0 - l), l * Math.sin(-this.shootX));
	v.setLength(100);

	bullet.size = 20;
	bullet.lifeTime = 1000;

	if (this.gun == this.baseGun)
	{
		var tex = loader.load( "tex/part1.png" );
		tex.magFilter = THREE.NearestFilter;
		var material = new THREE.MeshBasicMaterial( {map: tex, side: THREE.DoubleSide, transparent: true, opacity: 1} );
		material.color = new THREE.Color(1, 2, 6);
		material.blending = THREE.AdditiveBlending;
		material.depthWrite = false;

		var geometry = new THREE.PlaneGeometry( 1, 1 );
		var plane = new THREE.Mesh( geometry, material );

		if (this.parent.viewMode == 0)
			plane.rotation.x += Math.PI / 2;

		plane.scale.set(40, 40, 1);

		scene.add( plane );
		bullet.model = plane;

		bullet.update2 = function(dTime) {

			options.positionRandomness = 0;
			options.velocityRandomness = 0;
			options.velocity.x = 0;
			options.velocity.z = 0;
			options.colorRandomness = 0.1;
			options.lifetime = 300;
			options.turbulence = 0;

			options.position.x = this.pos.x;
			options.position.y = this.pos.y;
			options.position.z = this.pos.z;

			options.color = new THREE.Color(0.01, 0.04, 0.1);
			options.size = 20 + 20 * Math.random();
			cloudParticleSystem.spawnParticle( options );
		}
	}
	else if (this.gun == this.powerGuns[0])
	{
		bullet.lifeTime = 2000;

		// rings
		v.setLength(80);

		var material =  new THREE.MeshBasicMaterial( {
			color: 			new THREE.Color(0.4, 0.65, 1.4),
			wireframe: 		false,
		});

		material.transparent = true;
		material.blending = THREE.AdditiveBlending;
		material.depthWrite = false;

		bullet.size = 80;
		var geometry = new THREE.TorusGeometry( bullet.size / 2, 4, 3, 30 );
		var plane = new THREE.Mesh( geometry, material );

		plane.rotation.x += Math.PI / 2;

		scene.add( plane );
		bullet.model = plane;

		bullet.update2 = function(dTime) {

			/*
			this.size += dTime;
			if (this.size > 650)
				this.size = 650;
			*/

			this.model.scale.x = this.size / 150;
			this.model.scale.y = this.size / 150;
			this.model.scale.z = this.size / 150;

			options.positionRandomness = 0;
			options.velocityRandomness = 0;
			options.velocity.x = 0;
			options.velocity.z = 0;
			options.colorRandomness = 0.1;
			options.lifetime = 300;
			options.turbulence = 0;

			var rot = Math.random() * Math.PI * 2;

			var r = 0;
			// r = this.size / 2

			options.position.x = this.pos.x + Math.cos(rot) * r;
			options.position.y = this.pos.y;
			options.position.z = this.pos.z + Math.sin(rot) * r;

			options.color = new THREE.Color(0.04, 0.05, 0.07);
			options.size = 30 + 10 * Math.random();

			if (Math.random() > 0.5)
				cloudParticleSystem.spawnParticle( options );
		}
	}
	else if (this.gun == this.powerGuns[1])
	{
		v.setLength(70);
		bullet.lifeTime = 5 * 1000;

		// rockets
		bullet.size = 60;
		var tex = loader.load( "tex/part1.png" );
		tex.magFilter = THREE.NearestFilter;
		var material = new THREE.MeshBasicMaterial( {map: tex, side: THREE.DoubleSide, transparent: true, opacity: 1} );
		material.color = new THREE.Color(6, 2, 1);
		material.blending = THREE.AdditiveBlending;
		material.depthWrite = false;

		var geometry = new THREE.PlaneGeometry( 1, 1 );
		var plane = new THREE.Mesh( geometry, material );
		plane.rotation.x += Math.PI / 2;
		plane.scale.set(120, 120, 1);

		scene.add( plane );
		bullet.model = plane;

		bullet.update2 = function(dTime) {

			options.positionRandomness = 0.1;
			options.velocityRandomness = 0.001;
			options.velocity.x = 0;
			options.velocity.z = 0;
			options.colorRandomness = 0.1;
			options.lifetime = 600;
			options.turbulence = 0;

			options.position.x = this.pos.x;
			options.position.y = this.pos.y;
			options.position.z = this.pos.z;

			options.color = new THREE.Color(1, 0.6, 0.3);
			options.size = 30 + 10 * Math.random();
			cloudParticleSystem.spawnParticle( options );
		}
	}

	bullet.speed = v;
}


Player.prototype.isKeyPressed = function(keys, keySet) {

	if (difficulty == 0)
		return false;

	if (!keySet)
		keySet = currentlyPressedKeys;
	
	for (var i = 0; i < keys.length; i++)
	{
		if (keySet[keys[i]])
			return true;
	}
	return false;
}

Player.prototype.updateSpeed = function(dTime) {

	if (this.parent.viewMode == 0)
	{
		// this.pos.y += (-600 - this.pos.y) * 0.01;
	}
	else
		this.pos.z += (0 - this.pos.z) * 0.01;

	// drag speed down

	this.speedMult = 1.1;
	if (this.parent.viewMode == 1)
		this.speedMult *= 1.5;
	
	if (this.spinTime <= 0)
	{
		var drag = 0.002 * dTime * this.speedMult;

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

		var up = upDownInvert ? this.downKey : this.upKey;
		var down = !upDownInvert ? this.downKey : this.upKey;

		if (this.isKeyPressed(up))
		{
			if (this.parent.viewMode == 0)
				this.speedAdd.z = -1;
			else
				this.speedAdd.y = -1;
		}
		else if (this.isKeyPressed(down))
		{
			if (this.parent.viewMode == 0)
				this.speedAdd.z = 1;
			else
				this.speedAdd.y = 1;
		}

		if (this.isKeyPressed(this.leftKey))
		{
			if (this.parent.viewMode == 0)
				this.speedAdd.x = -1;
			else
				this.speedAdd.x = 1;
		}
		else if (this.isKeyPressed(this.rightKey))
		{
			if (this.parent.viewMode == 0)
				this.speedAdd.x = 1;
			else
				this.speedAdd.x = -1;
		}

		if (this.speedAdd.length() > 0)
		{
			var speed = 0.0075 * dTime * this.speedMult;
			this.speedAdd.setLength(speed);
			this.speed.add(this.speedAdd);
		}

		var maxSpeed = 1 * this.speedMult;

		if (this.speed.length() > maxSpeed)
			this.speed.setLength(maxSpeed);

		this.speedAdd.set(this.speed.x, this.speed.y, this.speed.z);
	}
	else
	{
		this.speedAdd.set(this.speed.x, this.speed.y, this.speed.z);
		this.speedAdd.setLength(2);
	}

	this.pos.add(this.speedAdd.multiplyScalar(dTime * 0.4));

	var border = this.moveBorder;
	if (this.pos.x < -border)
		this.pos.x = -border;
	if (this.pos.x > border)
		this.pos.x = border;

	if (this.pos.z < -border)
		this.pos.z = -border;
	if (this.pos.z > border)
		this.pos.z = border;

	if (this.parent.viewMode == 1)
	{
		if (this.pos.y < -border)
			this.pos.y = -border;
		if (this.pos.y > border)
			this.pos.y = border;	
	}
}

Player.prototype.updateGun = function(dTime)
{
	if (difficulty == 0)
		return;

	this.gun.update(dTime);

	if (!this.aimer)
		return;

	var screenPositionPixels = new THREE.Vector2();
	var positionScreen = new THREE.Vector3();
	var shootDepth = this.shootDist;
	positionScreen.set(this.pos.x, this.pos.y - shootDepth, this.pos.z);

	positionScreen.applyMatrix4( camera.matrixWorldInverse );
	positionScreen.applyMatrix4( camera.projectionMatrix );
	var viewport = new THREE.Vector4();
	viewport.copy( renderer.getCurrentViewport() );

	var halfViewportWidth = viewport.z / 2.0;
	var halfViewportHeight = viewport.w / 2.0;

	screenPositionPixels.x = viewport.x + ( positionScreen.x * halfViewportWidth ) + halfViewportWidth;
	screenPositionPixels.y = viewport.y - ( positionScreen.y * halfViewportHeight ) + halfViewportHeight;

	var dx = mouseX[0] - screenPositionPixels.x;
	var dy = mouseY[0] - screenPositionPixels.y;
	var dir = Math.atan2(dx, dy) - Math.PI / 2;

	this.shootY = Math.atan2(Math.sqrt(dx * dx + dy * dy), shootDepth);
	this.shootX = Math.atan2(dx, dy) - Math.PI / 2;

	if (mouseDown > 0 && this.spinTime <= 0)
		this.gun.fire();
}

var rgbToHex = function (rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};
var fullColorHex = function(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red+green+blue;
};

Player.prototype.updateUI = function() {

	var gain = 0;
	if (this.gainTime > 0)
		gain = 0.5 * this.gainTime / this.maxGainTime;

	var health = document.getElementById("health"); 
	if (health)
	{
		if (this.fuel <= 0)
			health.children[0].className = "healthInnerWarn";
		else
			health.children[0].className = "healthInner";

		health.children[0].style.width = 294.0 * this.life / this.maxLife;

		var red = 0;

		if (this.fuel <= 0)
			red = 1;
		if (this.damageTime > 0.0)
			red = this.damageTime / this.maxDamageTime;
		else
			red = 0;

		health.children[0].style.opacity = red + 0.3;
		if (red > 0)
			health.children[0].style.backgroundColor = "red";
		else
			health.children[0].style.backgroundColor = "white";
	}

	var fuel = document.getElementById("fuel"); 
	if (fuel)
	{
		fuel.children[0].style.width = 294.0 * this.fuel / this.maxFuel;

		if (this.gun == this.baseGun)
		{
			fuel.children[0].className = "healthInner";
			// fuel.children[0].style.opacity = 0.3 + gain;
		}
		else
			fuel.children[0].className = this.gun == this.powerGuns[0] ? "greenInner" : "orangeInner";

	}

	var livesHtml = document.getElementById("lives"); 
	if (livesHtml)
	{
		livesHtml.innerHTML = lives;
	}

	var scoreHtml = document.getElementById("score"); 
	if (scoreHtml)
	{
		scoreHtml.innerHTML = score;
	}
}

Player.prototype.update = function(dTime) {

	this.gainTime -= dTime;
	// this.speeding = this.isKeyPressed(this.speedKey);

	if (this.speeding)
	{
		this.fuel += 0.00001 * dTime;
		if (this.fuel > this.maxFuel)
			this.fuel = this.maxFuel;
	}

	if (weaponHtmlTimer > 0)
	{
		weaponHtmlTimer -= dTime;
		if (weaponHtmlTimer <= 0)
		{
			var weaponHtml = document.getElementById("weapon"); 
			if (weaponHtml)
				weaponHtml.style.display = "none";
		}
	}

	if (this.inv <= 0 && difficulty > 0)
	{
		var lossRate = 0.000 + 0.003 * difficulty;
		if (this.gun != this.baseGun)
		{
			lossRate = this.lossRate;
			this.lossRate += 0.00000125 * dTime * difficulty;
		}

		var was = this.fuel > 0;

		if (!this.speeding)
			this.fuel -= dTime * lossRate;

		if (this.fuel <= 0)
		{
			if (this.gun != this.baseGun)
			{
				this.gun = this.baseGun;
				this.fuel = this.maxFuel;
				this.gainTime = this.maxGainTime;

				var weaponHtml = document.getElementById("weapon"); 
				if (weaponHtml)
				{
					weaponHtml.style.display = "block";
					weaponHtml.innerHTML = "Basic Weapon";
					weaponHtmlTimer = 5 * 1000;
				}
			}
			else
			{
				this.life -= dTime * lossRate * 0.4;
				if (was)
				{
					var weaponHtml = document.getElementById("weapon"); 
					if (weaponHtml)
					{
						weaponHtml.style.display = "block";
						weaponHtml.innerHTML = "Fuel Empty";
						weaponHtmlTimer = 5 * 1000;
					}
				}
			}
		}
	}

	if (this.life <= 0)
		this.parent.kill(this);

	this.updateUI();

	this.xBorders.position.z = this.pos.z;
	this.zBorders.position.y = 0;
	this.zBorders.position.x = this.pos.x;

	if (this.parent.viewMode == 1)
	{
		this.xBorders.rotation.x = Math.PI / 2;
		this.zBorders.rotation.x = Math.PI / 2;

		this.xBorders.position.y = this.pos.y;
		this.zBorders.position.x = this.pos.x;

		this.xBorders.position.z = 600;
		this.zBorders.position.z = 600;

		console.log(this.xBorders.position);
	}

	var borderBrightness = (Math.max(Math.abs(this.pos.z), Math.abs(this.pos.x)) - this.moveBorder + 150) / 150;

	if (this.parent.viewMode == 1)
	{
		borderBrightness = (Math.max(Math.abs(this.pos.y), Math.abs(this.pos.x)) - this.moveBorder + 150) / 150;
	}

	this.xBorders.material.color.r = borderBrightness * 0.2;
	this.xBorders.material.color.g = borderBrightness * 0.5;
	this.xBorders.material.color.b = borderBrightness;

	this.spinChargeTime += dTime;
	this.spinTime -= dTime;

	if (this.spinChargeTime > 0 && this.isKeyPressed(this.dashKey) && this.speed.length() > 0)
	{
		this.spinChargeTime = -this.maxSpinChargeTime;
		this.spinTime = this.maxSpinTime;
	}

	let myShip = this;
	if (this.model)
	{
		this.model.traverse( function ( child ) {
			if ( child.isMesh ) {
				if (myShip.inv > 0)
				{
					var inv = myShip.inv / 1000;
					if (inv > 0.5)
						inv = 0.5;
					inv *= 3;

					child.material.emissive.r = inv;
					child.material.emissive.g = inv;
					child.material.emissive.b = inv;
				}
				else
				{
					if (myShip.damageTime > 0.0)
						child.material.emissive.r = myShip.damageTime / myShip.maxDamageTime;
					else
						child.material.emissive.r = 0;

					if (myShip.spinTime > 0.0)
					{
						child.material.emissive.b = myShip.spinTime / myShip.maxSpinTime;
						child.material.emissive.g = 0.4 * myShip.spinTime / myShip.maxSpinTime;
					}
					else
					{
						child.material.emissive.b = 0;
						child.material.emissive.g = 0;
					}
				}
			}
		});
	}

	this.inv -= dTime;
	this.damageTime -= dTime;
	this.timeAlive += dTime;

	this.updateSpeed(dTime);
	this.updateGun(dTime);

	if (this.model)
	{
		this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
		this.aimer.position.set(this.pos.x, this.pos.y, this.pos.z);
		this.model.rotation.y = Math.PI / 2 - this.speed.x * 0.2 + Math.cos(this.timeAlive * 0.001) * 0.05;
		this.model.rotation.z = Math.PI / 2 - this.speed.z * 0.2 + Math.sin(this.timeAlive * 0.0008) * 0.05;

		if (this.damageTime > 0)
			this.model.rotation.y += this.damageTime / this.maxDamageTime * Math.cos(this.timeAlive) * 0.1;
		if (this.spinTime > 0)
		{
			var add = Math.PI * 2 * this.spinTime / this.maxSpinTime;
			if (this.speed.x < 0)
				add = -add;
			this.model.rotation.y += add;
		}

		this.aimer.rotation.y = this.shootX;
		this.aimer.rotation.z = this.shootY;
	}

	var mult = 0.8;


	var targetCamX = this.pos.x * mult;
	var targetCamY = 100;
	var targetCamZ = this.pos.z * mult - 40;

	if (this.parent.viewMode == 1) // top down
	{
		targetCamX = this.pos.x * mult * 0.1;
		targetCamY = this.pos.y * mult * 0.1;
		targetCamZ = this.pos.z + 2000;
	}

	var dx = camera.position.x - targetCamX;
	var dy = camera.position.y - targetCamY;
	var dz = camera.position.z - targetCamZ;

	var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

	if (dist < 10)
		this.cameraLocked = true;

	if (dist > 100 || !this.cameraLocked)
	{
		if (this.cameraLocked)
		{
			this.cameraLocked = false;
			this.cameraLockedAmout = 0.01;
		}
		else
		{
			this.cameraLockedAmout += 0.01;
			if (this.cameraLockedAmout > 1)
				this.cameraLockedAmout = 1;
		}

		camera.position.x += (targetCamX - camera.position.x) * this.cameraLockedAmout;
		camera.position.y += (targetCamY - camera.position.y) * this.cameraLockedAmout;
		camera.position.z += (targetCamZ - camera.position.z) * this.cameraLockedAmout;
	}
	else
	{
		camera.position.x = targetCamX;
		camera.position.y = targetCamY;
		camera.position.z = targetCamZ;
	}

	if (this.parent.viewMode == 0) // front
		camera.lookAt( camera.position.x, -100, camera.position.z);
	else if (this.parent.viewMode == 1)
	{
		camera.lookAt( this.pos.x * 0.1, this.pos.y * 0.1, this.pos.z);
		camera.rotation.z = Math.PI;
	}

	options.positionRandomness = 0;
	options.velocityRandomness = 0;
	options.velocity.x = 0;
	options.velocity.z = 0;
	options.colorRandomness = 0.1;
	options.lifetime = 100;
	options.turbulence = 0;

	var speedMult = this.parent.speed / 6;
	if (speedMult < 0.2)
		speedMult = 0.2;

	for (var i = 0; i < 10; i++)
	{
		options.position.x = this.pos.x + this.speed.x * 8;
		options.position.y = this.pos.y + 80 + i * 10 * speedMult;
		options.position.z = this.pos.z - this.speed.z * 12;

		options.color = 0xf48642;
		options.velocity.y = 0.1 * speedMult;
		options.lifetime = (100 - i * 5);
		options.velocityRandomness = 0;
		options.size = 50 + 20 * Math.random();
		cloudParticleSystem.spawnParticle( options );

		options.color = 0x1a071c;
		options.velocity.y = 0.15 * speedMult;
		options.velocityRandomness = 0.001;
		options.lifetime = (1000 - i * 5) * speedMult;
		cloudParticleSystem.spawnParticle( options );
	}

	options.color = 0x0e0b30;
	options.position.z = this.pos.z - this.speed.z * 12 + 30 + this.speed.x * 10;
	options.position.x = this.pos.x + this.speed.x * 8 + 50;
	options.position.y = this.pos.y + 60;

	options.velocity.y = 0.1 * speedMult;
	options.lifetime = (1000 - i * 5) * speedMult;
	options.size = 10 + 20 * Math.random();
	cloudParticleSystem.spawnParticle( options );

	options.position.z = this.pos.z - this.speed.z * 12 + 30 - this.speed.x * 10;
	options.position.x = this.pos.x + this.speed.x * 8 - 50;
	cloudParticleSystem.spawnParticle( options );

	options.position.z = this.pos.z - this.speed.z * 12 - 30 + this.speed.x * 10;
	options.position.x = this.pos.x + this.speed.x * 8 + 50;
	cloudParticleSystem.spawnParticle( options );

	options.position.z = this.pos.z - this.speed.z * 12 - 30 - this.speed.x * 10;
	options.position.x = this.pos.x + this.speed.x * 8 - 50;
	cloudParticleSystem.spawnParticle( options );
}

Player.prototype.kill = function() {

	scene.remove(this.model);
	scene.remove(this.aimer);
	scene.remove(this.xBorders);
	scene.remove(this.zBorders);

	this.parent.player = null;

	this.kill2();
	lives--;

	this.fuel = 0;
	this.life = 0;

	this.updateUI();
}

Player.prototype.kill2 = function() {

	if (!enableParticleEffects)
		return;

	this.parent.addGameObj(new DeathWave(this.pos.x, this.pos.y, this.pos.z, 300, 0.00025, 0));
	this.parent.addGameObj(new DeathWave(this.pos.x, this.pos.y, this.pos.z, 300, 0.0005, 0));
	this.parent.addGameObj(new DeathWave(this.pos.x, this.pos.y, this.pos.z, 300, 0.001, 0));

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


	for (var i = 0; i < 10; i++)
	{
		var part = new DeathPart();
		part.color = new THREE.Color(1.6, 0.6, 0.1);
		part.pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);


		material =  new THREE.MeshPhongMaterial( {
			specular:  		0x111111,
			map: loader.load("tex/asteroid.jpg"),
			bumpScale: 20,
			emissive: 		0x000000,
			color: 			0x000000,
			wireframe: 		false,
		});
		var geometry = new THREE.SphereGeometry( this.size.x , 10, 10 );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.scale.x = 0;
		sphere.position.y = -10000;
		part.model = sphere;
		scene.add(sphere);


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
		part.lifeTime = 1000;

		part.size = sizeMult;
		this.parent.addGameObj(part);

		options.positionRandomness = 100;
		options.velocityRandomness = 0.2;
		options.velocity.x = 0;
		options.velocity.y = 0;
		options.velocity.z = 0;
		options.colorRandomness = 0.1;
		options.lifetime = 600;
		options.turbulence = 0;

		options.position.x = this.pos.x;
		options.position.y = this.pos.y;
		options.position.z = this.pos.z;

		options.color = new THREE.Color(1.6, 0.7, 0.2);
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


Player.prototype.hit = function(damage, force)
{
	if (this.inv <= 0)
	{
		this.damageTime = this.maxDamageTime;
		if (force)
			this.damageTime += this.maxDamageTime;

		this.life -= damage;

		if (this.life <= 0)
			this.parent.kill(this);
	}
}
