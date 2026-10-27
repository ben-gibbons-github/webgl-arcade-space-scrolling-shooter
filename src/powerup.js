
function Powerup(x, y, z, type) {
	this.pos = new THREE.Vector3(x, y, z);
	this.type = type;

	this.color = type == 0 ? new THREE.Color(0.5, 1.2, 0.8) : new THREE.Color(1.2, 0.8, 0.5);

	this.size = 300;

	if (type >= 0)
	{
		// currency
	}
	else
	{
		this.color = new THREE.Color(0.2, 0.4, 1);
		this.size = 100;
	}

	var geometry = new THREE.TorusGeometry( this.size / 2, this.size / 40, 3, 30 );

	material =  new THREE.MeshBasicMaterial( {
		color: 			this.color,
		wireframe: 		false,
	});

	var sphere = new THREE.Mesh( geometry, material );
	sphere.rotation.x = Math.PI / 2;
	sphere.position.set(this.pos.x, this.pos.y, this.pos.z);
	this.model = sphere;
	scene.add(sphere);

	
	var tex = loader.load( "tex/part1.png" );	
	material = new THREE.MeshBasicMaterial( {map: tex, side: THREE.DoubleSide, transparent: true, opacity: 1} );
	material.color = this.color;
	material.blending = THREE.AdditiveBlending;
	material.depthWrite = false;

	var geometry = new THREE.PlaneGeometry( this.size * 3, this.size );
	var plane2 = new THREE.Mesh( geometry, material );
	plane2.rotation.x += Math.PI / 2;
	sphere.add(plane2);

	this.hitPlayer = null;
	this.hitAnim = 0;
	this.speed = 0.4;
}


Powerup.prototype.update = function(dTime) {

	this.model.rotation.z += 0.001 * dTime;
	if (this.hitPlayer)
	{
		this.pos.x = this.hitPlayer.pos.x;
		this.pos.y = this.hitPlayer.pos.y;
		this.pos.z = this.hitPlayer.pos.z;
		this.hitAnim += dTime;
		this.model.rotation.y += 0.01 * dTime;

		if (this.hitAnim > 500)
		{
			this.parent.kill(this);
		}
	}
	else
	{
		this.pos.y += currentLevel.speed * dTime * this.speed;
	}

	if (this.pos.y > 100)
	{
		this.parent.kill(this);
		return;
	}

	if (!this.hitPlayer)
	{
		if (this.parent.distance(this.pos.x, this.pos.y, this.pos.z, thePlayer.pos.x, thePlayer.pos.y, thePlayer.pos.z) < 200)
		{
			thePlayer.getPowerup(this.type);

			if (this.type >= 0)
			{
				this.hitPlayer = thePlayer;
			}
			else
				this.parent.kill(this);
		}
	}

	this.model.position.set(this.pos.x, this.pos.y, this.pos.z);

	options.positionRandomness = 0;
	options.velocityRandomness = 0;
	options.velocity.x = 0;
	options.velocity.z = 0;
	options.colorRandomness = 0.1;
	options.lifetime = 1500;
	if (this.type < 0)
		options.lifetime = 300;
	options.turbulence = 0;

	var rot = Math.random() * Math.PI * 2;

	options.position.x = this.pos.x + Math.cos(rot) * this.size / 2;
	options.position.y = this.pos.y;
	options.position.z = this.pos.z + Math.sin(rot) * this.size / 2;

	options.color = this.color;
	options.size = 10 + 10 * Math.random();
	cloudParticleSystem.spawnParticle( options );


	options.position.x = this.pos.x + Math.cos(rot) * this.size / 2;
	options.position.y = this.pos.y;
	options.position.z = this.pos.z + Math.sin(rot) * this.size / 2;

	options.size = 10;
	options.lifetime = 3500;
	cloudParticleSystem.spawnParticle( options );
}

Powerup.prototype.kill = function() {

	scene.remove(this.model);
}
