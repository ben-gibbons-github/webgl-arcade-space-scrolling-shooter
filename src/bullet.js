
function Gun(parent) {
	this.rof = 0;
	this.maxRof = 60;
	this.clipSize = 0;
	this.maxClipSize = 4;
	this.clipTime = 0;
	this.maxClipTime = 400;
	this.parent = parent;
	this.damage = 10;
	this.multiHit = false;
}

Gun.prototype.update = function(dTime) {

	this.rof += dTime;
	this.clipTime += dTime;

	if (this.clipTime > this.maxClipTime)
		this.clipSize = this.maxClipSize;
}

Gun.prototype.fire = function() {

	if (this.rof >= this.maxRof && this.clipSize > 0)
	{
		this.rof = 0;
		this.clipTime = 0;

		var bullet = new Bullet(this);
		this.parent.parent.addGameObj(bullet);

		this.parent.getBullet(bullet, this.maxClipSize - this.clipSize);
		this.clipSize--;
	}
}


function Bullet(gunParent) {

	this.pos = null;
	this.speed = null;
	this.size = 0;

	this.timeAlive = 0;
	this.lifeTime = 4000;

	this.model = null;
	this.gunParent = gunParent;
	this.damageMult = 1;

	this.gunParent.parent.bulletsAlive++;
}

Bullet.prototype.kill = function() {
	this.gunParent.parent.bulletsAlive--;
	scene.remove(this.model);
}

Bullet.prototype.updateCol = function(dTime) {

	var hit = this.parent.testCollision(this.pos.x, this.pos.y, this.pos.z, this.gunParent.parent.team, this.size, this.gunParent.parent, this.hitTargets);

	if (hit)
	{
		{
			options.positionRandomness = 0;
			options.velocityRandomness = 0;
			options.velocity.x = 0;
			options.velocity.y = 0;
			options.velocity.z = 0;
			options.colorRandomness = 0.1;
			options.lifetime = 300;
			options.turbulence = 0;

			options.position.x = this.pos.x;
			options.position.y = this.pos.y;
			options.position.z = this.pos.z;

			options.color = new THREE.Color(1, 0.6, 0);
			options.size = 200;
			cloudParticleSystem.spawnParticle( options );

			options.velocityRandomness = 0.1;
			options.size = 9;
			options.lifetime = 3000;
			options.turbulence = 0.01;
			options.velocity.y = this.parent.speed * 0.02;
			for (var j = 0; j < 2; j++)
				cloudParticleSystem.spawnParticle( options );
		}

		hit.hit(this.gunParent.damage * this.damageMult);

		if (this.gunParent.multiHit)
		{
			if (!this.hitTargets)
				this.hitTargets = [];
			this.hitTargets.push(hit);
			this.damageMult /= 2;
		}
		else
		{
			this.parent.kill(this);
		}
	}
}


Bullet.prototype.update = function(dTime) {

	var maxBorder = 100;
	var minBorder = -8000;
	if (this.parent.viewMode == 1)
	{
		maxBorder = 2000;
		minBorder = -2000;
	}

	if (this.pos.y > maxBorder || this.pos.y < minBorder)
	{
		this.parent.kill(this);
		return;
	}

	var mult = 0.06;
	var aliveMult = 1;

	if (this.parent.viewMode == 1)
	{
		mult *= 0.1;
		aliveMult *= 0.1;
	}
	this.pos.x += this.speed.x * dTime * mult;
	this.pos.y += this.speed.y * dTime * mult;
	this.pos.z += this.speed.z * dTime * mult;


	this.timeAlive += dTime * aliveMult;
	if (this.timeAlive > this.lifeTime)
	{
		this.parent.kill(this);
		return;
	}

	if (this.model)
	{	
		if (this.update2)
			this.update2(dTime);

		//this.model.rotation.z = Math.atan2(Math.sqrt(this.speed.x * this.speed.x + this.speed.z * this.speed.z), this.speed.y);
		// this.model.rotation.y = Math.atan2(this.speed.x, this.speed.z) + Math.PI / 2;

		this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
	}
	this.updateCol(dTime);
}