import React, { Component } from 'react';
import { observer } from 'mobx-react';

import PointCloud from './utils/PointCloud.jsx';


import * as THREE from 'three'

import '../../styles/Viewport.css'

import OrbitControls from 'threejs-orbit-controls';

@observer
class Viewport extends Component {


	componentDidMount() {

		this.width = this.mount.clientWidth
		this.height = this.mount.clientHeight

		// Initialize basic scene
		this.scene = new THREE.Scene();
		this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
		this.scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.3 ) );
		this.addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
		this.addSkybox();

		//Configure Camera
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 70
		this.camera.position.x = 30
		this.camera.position.y = 50

		this.controls = new OrbitControls( this.camera, this.mount );
		this.controls.dampingFactor = 0.3; // friction
		this.controls.rotateSpeed = 0.3; // mouse sensitivity

		console.log(this.controls);

		//Configure Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor('#000000');
		this.mount.appendChild(this.renderer.domElement);

		//Initilize base event listeners and start animation loop
		window.addEventListener( 'resize', this.onWindowResize, false );

		this.load3DModel();
		this.onWindowResize();
		this.start();
	}

	addSkybox() {
		let imagePrefix = "images/nightsky_";
		let directions  = ["ft", "bk", "up", "dn", "rt", "lf"];
		let imageSuffix = ".png";
		  
		let materialArray = [];
		for (let i = 0; i < 6; i++) {
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
				side: THREE.BackSide
			}));
		}
		 
		let skyGeometry = new THREE.CubeGeometry( 500, 500, 500 );
		let skyMaterial = new THREE.MeshFaceMaterial( materialArray );
		let skyBox = new THREE.Mesh( skyGeometry, skyMaterial );

		this.scene.add( skyBox );
	}

	addShadowedLight( x, y, z, color, intensity ) {

		let directionalLight = new THREE.DirectionalLight( color, intensity );
		directionalLight.position.set( x, y, z );
		this.scene.add( directionalLight );

		directionalLight.castShadow = true;

		let d = 1;
		directionalLight.shadow.camera.left = - d;
		directionalLight.shadow.camera.right = d;
		directionalLight.shadow.camera.top = d;
		directionalLight.shadow.camera.bottom = - d;

		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 4;

		directionalLight.shadow.mapSize.width = 1024;
		directionalLight.shadow.mapSize.height = 1024;

		directionalLight.shadow.bias = - 0.001;

	}

	load3DModel(model) {
		//The cube is a test model
		let pc = new PointCloud("models/test.ply");
		pc.loadFromFile(this.scene);
	}

	onWindowResize = () => {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight);
	}

	componentWillUnmount() {
		this.stop();
		this.mount.removeChild(this.renderer.domElement);
	}

	start = () => {
		if (!this.frameId) {
			this.frameId = requestAnimationFrame(this.animate);
		}
	}

	stop = () => {
		cancelAnimationFrame(this.frameId);
	}

	animate = () => {
		if(this.model !== undefined) {
			this.model.rotation.x += 0.01;
			this.model.rotation.y += 0.01;
		}

		this.renderScene()
		this.frameId = window.requestAnimationFrame(this.animate);
	}

	renderScene = () => {
		this.renderer.render(this.scene, this.camera);
	}

	render(){
		return(
			<div id="viewport" ref={(mount) => { this.mount = mount }}/>
		);
	}
}

export default Viewport