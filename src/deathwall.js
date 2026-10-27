
function DeathWall(x, z, moveX) {
	this.pos = new THREE.Vector3(x, 0, z);

	var material = new THREE.MeshBasicMaterial( {color: new THREE.Color(1.2, 0.2, 0.1), side: THREE.DoubleSide, transparent: true, opacity: 1} );
	material.blending = THREE.AdditiveBlending;
	material.map = loader.load("tex/beam.jpg");
	material.depthWrite = false;

	var geometry = new THREE.PlaneGeometry( 2000, 600, 1, 1 );
	var plane = new THREE.Mesh( geometry, material );
	scene.add(plane);

	this.model = plane;

	if (moveX)
		this.model.rotation.y = Math.PI / 2;

	this.moveX = moveX;
	this.moveIn = true;
}


DeathWall.prototype.update = function(dTime) {

	var min = 60;
	var max = 1000;

	var moveAmt = -0.1 * dTime;
	if (this.moveX)
	{
		if (Math.abs(this.pos.x) < min)
			this.moveIn = false;
		else if (Math.abs(this.pos.x) > max)
			this.moveIn = true;

		if (this.moveIn ^ this.pos.x > 0)
			moveAmt = -moveAmt;

		this.pos.x += moveAmt;
	}
	else
	{
		if (Math.abs(this.pos.y) < min)
			this.moveIn = false;
		else if (Math.abs(this.pos.y) > max)
			this.moveIn = true;

		if (this.moveIn ^ this.pos.y > 0)
			moveAmt = -moveAmt;

		this.pos.y += moveAmt;
	}

	this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
}

DeathWall.prototype.kill = function() {
	scene.remove(this.model);

}