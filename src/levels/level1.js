
getBlockerBeam = function(x, y, z, sizeX, sizeY, bullet) {

	var newPos = new THREE.Vector3(x, y, z);
	bullet.pos = newPos;

	bullet.speed = new THREE.Vector3(0, currentLevel.speed * 1.2, 0);;

	size *= 2;
	var size = sizeX;
	bullet.size = sizeX;
	bullet.sizeX = sizeX;
	bullet.sizeY = sizeY;
	bullet.lifeTime = 400000;

	var material = new THREE.MeshBasicMaterial( {map: loader.load("tex/beam.jpg"), side: THREE.DoubleSide, transparent: true, opacity: 1} );
	//material.blending = THREE.AdditiveBlending;
	// material.depthWrite = false;

	var geometry = new THREE.PlaneGeometry( sizeX , sizeY );
	var plane = new THREE.Mesh( geometry, material );
	plane.rotation.x = -Math.PI / 2;

	scene.add( plane );

	bullet.model = plane;

	bullet.updateCol = function(dTime) {

		if (!this.hitSomething)
		{
			var hit = this.parent.testCollisionBox(this.pos.x, this.pos.y, this.pos.z, this.sizeX, this.size * 0.2, this.sizeY, 2, this);
			if (hit)
			{
				hit.hit(3 * difficulty * (difficulty + 1));
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
			this.speed.y = this.parent.speed * 14;
		}

		this.model.scale.x = mult;
		this.model.scale.y = mult;
		this.model.scale.z = mult;

		var cMult = 4 - mult * 3;
		this.model.material.color.r = cMult * 2;
		this.model.material.color.g = cMult * 1;
		this.model.material.color.b = cMult * 0.2;

		if (this.pos.y > -3000)
			this.model.material.opacity -= dTime * 0.0005;

	}	
}

getBigRedBullet = function(x, y, z, size, bullet) {

	var newPos = new THREE.Vector3(x, y, z);
	bullet.pos = newPos;

	bullet.speed = new THREE.Vector3(0, currentLevel.speed * 0.4, 0);;

	size *= 2;
	bullet.size = size;
	bullet.lifeTime = 400000;

	var material = new THREE.MeshBasicMaterial( {map: loader.load("tex/beam.jpg"), side: THREE.DoubleSide, transparent: true, opacity: 1} );
	material.blending = THREE.AdditiveBlending;
	material.depthWrite = false;

	var geometry = new THREE.CubeGeometry( size , size * 0.2, size );
	var plane = new THREE.Mesh( geometry, material );

	scene.add( plane );

	bullet.model = plane;

	bullet.updateCol = function(dTime) {

		if (!this.hitSomething)
		{
			var hit = this.parent.testCollisionBox(this.pos.x, this.pos.y, this.pos.z, this.size, this.size * 0.2, this.size, 2, this);
			if (hit)
			{
				hit.hit(3 * difficulty * (difficulty + 1));
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
			this.speed.y = this.parent.speed * 7;
		}

		this.model.scale.x = mult;
		this.model.scale.y = mult;
		this.model.scale.z = mult;

		var cMult = 4 - mult * 3;
		this.model.material.color.r = cMult * 1.2;
		this.model.material.color.g = cMult * 0.5;
		this.model.material.color.b = cMult * 0.2;
	}	
}

function spawnBigPart(mult) {

	if (!mult)
		mult = 1;

	options.positionRandomness = 0;
	options.velocityRandomness = 0.0;
	options.velocity.x = 0;
	options.velocity.y = 0;
	options.velocity.z = 0;
	options.colorRandomness = 0.1;
	options.lifetime = 6000 * mult;
	options.turbulence = 0;

	options.position.x = 0;
	options.position.y = -10000;
	options.position.z = 0;

	options.color = new THREE.Color(0.6, 0.8, 1.2);
	options.size = 900;
	cloudParticleSystem.spawnParticle( options );

	options.size = 300;
	cloudParticleSystem.spawnParticle( options );

	options.size = 100;
	cloudParticleSystem.spawnParticle( options );

	options.size = 60;
	cloudParticleSystem.spawnParticle( options );

	currentLevel.addGameObj(new DeathWave(0, -12000, 0, 500, 0.0001 / mult, 300));
	currentLevel.addGameObj(new DeathWave(0, -12000, 0, 500, 0.00025 / mult, 300));
	currentLevel.addGameObj(new DeathWave(0, -12000, 0, 500, 0.0005 / mult, 300));
	currentLevel.addGameObj(new DeathWave(0, -12000, 0, 2500, 0.00005 / mult, 300));
}


function MakeLevel1() {

	var lvl = new Level();

						//temp
						//lvl.wantsToSpawnBigEnemy = true;


	lvl.begin = function() {

		this.starBrightness = 1;

		lvl.timer1 = 0;
		lvl.timer2 = 0;
		lvl.timer3 = 0;
		lvl.scoreTimer = 0;
		lvl.powerupTimer = 0;

		lvl.speed = 0;
		lvl.targetSpeed = 2;
		lvl.phase = 0;
		// temp

		this.makeClouds();
		this.addEvent(function() {  }, 5000);
		// this.addEvent(function() { lvl.targetSpeed = 3 }, 5001);

		this.addShipObj(this.player = new Player());
		this.player.inv = 0;
		this.addGameObj(new DeathWave(this.player.pos.x, this.player.pos.y, this.player.pos.z, 400, 0.00075));
		lives = 3;

		var weaponHtml = document.getElementById("weapon"); 
		if (weaponHtml)
		{
			weaponHtml.style.display = "block";
			weaponHtml.innerHTML = "Wave 1";
			weaponHtmlTimer = 5 * 1000;
		}
		spawnBigPart();
	}

	lvl.update2 = function(dTime) {

		if (difficulty == 0)
			return;

		if (this.phase == 3)
		{
			this.starBrightness -= dTime * 0.0005;
			if (this.starBrightness < 0)
				this.starBrightness = 0;
		}
		else
		{
			this.starBrightness += dTime * 0.0005;
			if (this.starBrightness > 1)
				this.starBrightness = 1;
		}

		if (this.starMat)
		{
			this.starMat.color = new THREE.Color(this.starBrightness, this.starBrightness, this.starBrightness);
			this.starMat2.color = new THREE.Color(this.starBrightness * 0.1, this.starBrightness * 0.3, this.starBrightness);
			this.starMat3.color = new THREE.Color(this.starBrightness * 0.1, this.starBrightness * 0.2, this.starBrightness * 0.3);
		}

		lvl.targetSpeed = Math.sqrt((lvl.timeAlive * 0.00005 + 2) * (difficulty + 2) + difficulty * 2) * (difficulty + 1) * 0.25;

		this.scoreTimer += dTime * this.speed;
		if (this.player && this.player.speeding)
			this.scoreTimer += dTime * this.speed * 2;

		if (this.scoreTimer > 2000)
		{
			score++;
			this.scoreTimer -= 1000;
		}
		this.timer1 += dTime * this.speed;
		
		this.timer3 += dTime;
		if (this.player && this.player.speeding)
			this.timer3 += dTime * 2;

		if (this.phase == 2)
		{
			this.timer2 += dTime * this.speed;
			if (this.timer2 > 0)
			{
				// if (!this.powerX)
				{
					this.powerX = -(this.player.moveBorder) * (Math.random() * 2 - 1);
					this.powerY = -(this.player.moveBorder) * (Math.random() * 2 - 1);
				}

				this.powerX += 800 * (Math.random() - 0.5);
				this.powerY += 800 * (Math.random() - 0.5);
				this.powerX *= 0.98;
				this.powerY *= 0.98;

				if (this.powerX > this.player.moveBorder)
					this.powerX = this.player.moveBorder;
				if (this.powerX < -this.player.moveBorder)
					this.powerX = -this.player.moveBorder;

				if (this.powerY > this.player.moveBorder)
					this.powerY = this.player.moveBorder;
				if (this.powerY < -this.player.moveBorder)
					this.powerY = -this.player.moveBorder;

				this.timer2 -= 15 * 1000;	
				var powerup = new Powerup(this.powerX, -8000, this.powerY, -1);
				powerup.speed = 0.8;
				this.addGameObj(powerup);
			}
		}
		else if (this.phase == 1)
		{
			this.timer2 += dTime;
			if (this.timer2 > 16 * 1000)
			{
				this.leaveAllEnemies();
				this.timer2 -= 16 * 1000;
				if (passed > 2)
					this.wantsToSpawnBigEnemy = Math.random() > Math.max(0.6, 0.9 - passed * 0.1);
			}
		}
		else if (this.phase == 0 && passed > 2)
		{
			this.timer2 += dTime * this.speed * (9 + passed) * 0.05;

			if (this.timer2 > 5000 && this.player)
			{
				this.timer2 -= 80 * 1000 / difficulty / Math.sqrt(passed);
				var choice = Math.random();
				if (difficulty < 1)
					choice = 1;

				if (choice < 0.25)
				{
					var x = 100 - Math.random() * 200;
					var z = 100 - Math.random() * 200;
					SpawnAsteroidRing(x, -8000, z, (120 - difficulty * 15) + Math.random() * 300);
				}
				else if (choice < 0.5)
				{
					var x = 1000 - Math.random() * 2000;
					var z = 1000 - Math.random() * 2000;
					var xSize = 1000;
					var zSize = xSize;

					if (Math.random() > 0.5)
						xSize /= 100;
					else
						zSize /= 100;

					SpawnBigWall(x, -16000, z, xSize, 12000, zSize);
				}
				else
				{
					var bullet = new Bullet(this.shellGun);

					var x = -(this.player.moveBorder) * (Math.random() * 2 - 1);
					var y = -(this.player.moveBorder) * (Math.random() * 2 - 1);
					getBigRedBullet(x, -8000, y, 600, bullet)

					this.addGameObj(bullet);
				}
			}
		}

		lvl.powerupTimer += dTime;
		if (lvl.powerupTimer > 25 * 1000)
		{
			lvl.powerupTimer -= (6 + difficulty * 16) * 1000;

			var x = -(this.player.moveBorder) * (Math.random() * 2 - 1);
			var y = -(this.player.moveBorder) * (Math.random() * 2 - 1);
			this.addGameObj(new Powerup(x, -8000, y, Math.random() > 0.5 ? 0 : 1));
		}

		if (this.timer3 > 80 * 1000)
		{
			this.leaveAllEnemies();
			this.timer3 -= 50 * 1000;
			this.phase++;

			if (this.phase > 2)
			{
				scene.background = textureCube;
				this.phase = 0;
			}
			else if (this.phase > 1)
			{
				this.phase = 3;
				if (this.phase == 3)
				{
					scene.background = null;
					var weaponHtml = document.getElementById("weapon"); 
					if (weaponHtml)
					{
						weaponHtml.style.display = "block";
						weaponHtml.innerHTML = "Blackout";
						weaponHtmlTimer = 5 * 1000;
					}
				}
			}

			if (this.phase == 3)
				spawnBigPart(0.5);

			passed++;

			var weaponHtml = document.getElementById("weapon"); 
			if (weaponHtml)
			{
				weaponHtml.style.display = "block";
				weaponHtml.innerHTML = "Wave " + (passed + 1);
				weaponHtmlTimer = 5 * 1000;
			}
		}

		if (this.timer1 > 0 && (!this.bigEnemy || this.bigEnemy.isDead))
		{
			if (this.phase == 2)
				this.timer1 -= 3 * (700 - 100 * difficulty);
			else if (this.phase == 0)
				this.timer1 -= 60 * 6;
			else if (this.phase == 3)
				this.timer1 -= 60 * 9;
			else
				this.timer1 -= 200;

			var x = 1000 - Math.random() * 2000;
			var z = 1000 - Math.random() * 2000;
			if (this.player)
			{
				if (this.phase == 2)
				{
					var bullet = new Bullet(this.shellGun);

					var x = -(this.player.moveBorder) * (Math.random() * 2 - 1);
					var z = -(this.player.moveBorder) * (Math.random() * 2 - 1);
					var sizeX = Math.random() * 200 + 200;
					var sizeY = sizeX;

					if (Math.random() > 0.5)
					{
						var mult = 0.5 + Math.random();
						if (Math.random() > 0.5)
							mult = -mult;

						x = this.player.moveBorder * mult;
						z = this.player.moveBorder * mult;
					}

					if (Math.random() > 0.5 && false)
					{
						sizeX = this.player.moveBorder * 6;
						x = 0;
					}
					else
					{
						sizeY = this.player.moveBorder * 6;
						z = 0;
					}

					getBlockerBeam(x, -8000, z, sizeX, sizeY, bullet);
					this.addGameObj(bullet);
				}
				else if (this.phase == 0 || this.phase == 3)
				{
					SpawnAsteroid(x, -8000, z, (90 + difficulty * 15) + Math.random() * 140, this.phase == 3);
				}
				else
				{	
					var size = 600;

					var x = -(this.player.moveBorder + size / 2) * (Math.random() * 2 - 1);
					var y = -(this.player.moveBorder + size / 2) * (Math.random() * 2 - 1);
					while (this.testCollisionY(x - size / 2, y - size / 2, x + size / 2, y + size / 2, this.player.team))
					{
						x += size;
						if (x > this.player.moveBorder + size / 2)
						{
							x = -this.player.moveBorder - size / 2;
							y += size;
						}
					}
					if (y < this.player.moveBorder + size)
					{

						if (this.wantsToSpawnBigEnemy)
						{
							this.wantsToSpawnBigEnemy = false;
							//if (Math.random() > 0.5)
								SpawnBigShooter2(0, -8000, 0);	
						}
						else
						{
							if (Math.random() > Math.max(0.7, 0.95 - passed * 0.025) && passed > 2)
								SpawnShooter2(x, -8000, y, (90 + difficulty * 15) + Math.random() * 140);
							else
								SpawnShooter(x, -8000, y, (90 + difficulty * 15) + Math.random() * 140);
						}

						// SpawnDiver(x, -8000, y, (90 + difficulty * 15) + Math.random() * 140);
					}
				}
			}
		}
	}

	return lvl;
}