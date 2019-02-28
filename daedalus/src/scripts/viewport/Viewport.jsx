import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

import PointCloud from './utils/PointCloud.jsx';
import DiskChooser from './utils/DiscChooser.jsx';

import * as THREE from 'three'

import '../../styles/Viewport.css'

import OrbitControls from 'threejs-orbit-controls';

@observer
class Viewport extends Component {

	//Here store the functions used to generate the cameras
	camerasTable = {
		"PREVIEW": this.previewCamera.bind(this),
		"GENERATION": this.generationCamera.bind(this),
	}

	//Here store actual references to the cameras so I don't create new ones every time.
	cameras = {
		"PREVIEW": null,
		"GENERATION": null,
	};

	componentDidMount() {

		this.width = this.mount.clientWidth
		this.height = this.mount.clientHeight

		// Initialize basic scen
		
		this.scene = new THREE.Scene();
		this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
		this.scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.3 ) );
		this.addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
		this.addSkybox();

		//Configure Camera
		this.camera = this.camerasTable[this.props.store.state]().camera;
		this.controls = this.camerasTable[this.props.store.state]().controls;
		//TODO: Incorporate TransformControls in the future

		//Configure Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor('#000000');
		this.mount.appendChild(this.renderer.domElement);
		
		autorun(() => {
			this.camera = this.camerasTable[this.props.store.state]().camera;
			this.controls = this.camerasTable[this.props.store.state]().controls;
		});

		window.addEventListener( 'resize', this.onWindowResize, false );
		//Initilize base event listeners and start animation loop

		//REFACTOOOOOR
		this.chooser = new DiskChooser();


		//Indices are really important for the coordinate calculation of the disk chooser
		this.load3DModel("models/test.ply", 0);
		this.load3DModel("models/test1.ply", 1);

		for (let i = 0; i < 12; i++) {
			this.scene.add(this.chooser.generateDisc(i)); //see?
		}
		console.log(this.chooser.disks);

		this.onWindowResize();
		this.start();
	}

	previewCamera() {

		if (this.cameras["PREVIEW"] === null) {
			let camera 

			camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
	
			camera.position.z = 70
			camera.position.x = 30
			camera.position.y = 50
	
			let controls = new OrbitControls( camera );
			controls.dampingFactor = 0.3; // friction
			controls.rotateSpeed = 0.2; // mouse sensitivity
			controls.maxDistance = 500;

			let object = { camera: camera, controls: controls } ;
			this.cameras["PREVIEW"] = object;

			return object
		}

		this.cameras["PREVIEW"].controls.enabled = true;
		return this.cameras["PREVIEW"];

	}	
	
	generationCamera() {

		
		if (this.cameras["GENERATION"] === null) {
			let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
			camera.position.z = 70
			camera.position.x = 30
			camera.position.y = 50
			
			let controls;
			
			controls = new OrbitControls( camera );			
			controls.enabled = false;
			
			let object = { camera: camera, controls: controls } ;
			this.cameras["GENERATION"] = object;
			
			return object;
		} 
		//I need to disable just the Preview one, cause the GENERATION one is disabled by default
		this.cameras["PREVIEW"].controls.enabled = false;
		return this.cameras["GENERATION"];
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
		
		let skyGeometry = new THREE.CubeGeometry( 2000, 2000, 2000 );
		let skyBox = new THREE.Mesh( skyGeometry, materialArray );

		this.scene.add( skyBox );
	}

	addShadowedLight( x, y, z, color, intensity ) {

		let directionalLight = new THREE.DirectionalLight( color, intensity );
		directionalLight.position.set( x, y, z );
		
		this.scene.add( directionalLight );

		directionalLight.castShadow = true;

		let d = 50;

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

	load3DModel(path, index) {
		let pc = new PointCloud(this.props.store, path, this.scene);

		this.props.store.addModel(pc);
		this.props.store.stackPush(path, index);

		pc.load();
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
		if(this.props.store.loadedModels[0].model !== undefined) {
			this.props.store.loadedModels[0].model.rotation.z += 0.001;
		}

		this.renderScene();
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