import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

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

	generatingControls = {
		targetRotation: {
			x: 0,
			y: 0
		},
		mouse: {
			x: 0,
			y: 0
		},
		onMouseDown: {
			targetRotationX: 0,
			targetRotationY: 0,
			mouseX: 0,
			mouseY: 0,
		},
		windowHalfX: window.innerWidth / 2,
		windowHalfY: window.innerHeight / 2,
		slowingFactor: 0.25,
	}

	componentDidMount() {
		//TODO: REFACTOOOOOR

		this.width = this.mount.clientWidth
		this.height = this.mount.clientHeight

		// Initialize basic scenw
		
		this.scene = new THREE.Scene();
		this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
		this.scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.3 ) );
		this.addShadowedLight( 100, 100, 100, 0xffffff, 1.35 );
		this.addSkybox();

		this.chooser = new DiskChooser(this.props.store);
		
		for (let i = 0; i < 12; i++) {
			this.chooser.generateDisc(i); //see?
		}

		this.scene.add(this.chooser.elements);

		//Configure Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor('#000000');
		this.mount.appendChild(this.renderer.domElement);
		
		//Everytime the state changes, change the camera and controls
		autorun(() => {
			this.camera = this.camerasTable[this.props.store.state]().camera;
			this.controls = this.camerasTable[this.props.store.state]().controls;
			//this.toggleUnnecessaryThings();
		});

		//Everytime the chosen model changes, change the selected shit
		autorun(() => {
			for (let i = 0; i < this.props.store.loadedModels.length; i++) {

				let chosen = this.props.store.currentlyChosenModel;

				this.chooser.disks[i].material = new THREE.MeshLambertMaterial({ 
					color: 0x165a8c,
					transparent: true,
					opacity: 0.7,
					side: THREE.DoubleSide
				});

				this.chooser.lights[i].intensity = 0;
				this.chooser.lights[i].distance = 0;
				this.props.store.loadedPointClouds[i].opacity(0.2);

				if (chosen === i) {

					this.chooser.disks[chosen].material.color.setStyle("#28a4ff");

					this.props.store.loadedPointClouds[i].opacity(1);

					this.chooser.lights[chosen].intensity = 3;
					this.chooser.lights[chosen].distance = 100;

				}
			}
		});

		window.addEventListener( 'resize', this.onWindowResize, false );
		this.mount.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
		window.addEventListener( 'keypress', this.onKeypress, false);
		//Initilize base event listeners and start animation loop
		
		//Indices are really important for the coordinate calculation of the disk chooser //*see? reference up
		
		//this.props.store.loadModel(this.scene, "models/test.ply", 0);

		//this.props.store.loadModel(this.scene, "models/test1.ply", 1);

		//Configure Camera
		this.camera = this.camerasTable[this.props.store.state]().camera;
		this.controls = this.camerasTable[this.props.store.state]().controls;
		//TODO: Incorporate TransformControls in the future
		
		this.props.store.sceneRef = this.scene;
		this.onWindowResize();
		this.start();
	}

	toggleUnnecessaryThings() {
		this.props.store.loadedModels.forEach((el) => {
			if (el !== this.props.store.chosenModel) {
				el.visible = !el.visible;
			}
		})
	}

	previewCamera() {
		this.chooser.hideDisks();
		if (this.cameras["PREVIEW"] === null) {
			let camera 

			camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 4000 );

			camera.position.x = 300
			camera.position.y = 6
			camera.position.z = 2
	
			let controls = new OrbitControls( camera );
			controls.dampingFactor = 0.3; // friction
			controls.rotateSpeed = 0.2; // mouse sensitivity
			controls.maxDistance = 500;
			controls.enablePan = false;

			let object = { camera: camera, controls: controls } ;
			this.cameras["PREVIEW"] = object;

			return object
		}

		this.cameras["PREVIEW"].controls.enabled = true;
		this.onWindowResize();
		return this.cameras["PREVIEW"];

	}	
	
	onDocumentMouseDown = ( event ) => {

		event.preventDefault();

		let gc = this.generatingControls;

		this.mount.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
		this.mount.addEventListener( 'mouseup', this.onDocumentMouseUp, false );
		this.mount.addEventListener( 'mouseout', this.onDocumentMouseOut, false );

		gc.onMouseDown.mouseX = event.clientX - gc.windowHalfX;
		gc.onMouseDown.targetRotationX = gc.targetRotation.x;

		gc.onMouseDown.mouseY = event.clientY - gc.windowHalfY;
		gc.onMouseDown.targetRotationY = gc.targetRotation.y;
	}

	onDocumentMouseMove = ( event ) => {
		let gc = this.generatingControls;

		gc.mouse.x = event.clientX - gc.windowHalfX;

		gc.targetRotation.x = ( gc.mouse.x - gc.onMouseDown.mouseX ) * 0.00025;

		gc.mouse.y = event.clientY - gc.windowHalfY;

		gc.targetRotation.y = ( gc.mouse.y - gc.onMouseDown.mouseY ) * 0.00025;
	}

	onDocumentMouseUp = ( event ) => {

		this.mount.removeEventListener( 'mousemove', this.onDocumentMouseMove, false );
		this.mount.removeEventListener( 'mouseup', this.onDocumentMouseUp, false );
		this.mount.removeEventListener( 'mouseout', this.onDocumentMouseOut, false );
	}

	onDocumentMouseOut = ( event ) => {

		this.mount.removeEventListener( 'mousemove', this.onDocumentMouseMove, false );
		this.mount.removeEventListener( 'mouseup', this.onDocumentMouseUp, false );
		this.mount.removeEventListener( 'mouseout', this.onDocumentMouseOut, false );
	}

	generationCamera() {

		this.chooser.showDisks();
		
		if (this.cameras["GENERATION"] === null) {

			let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 4000 );
			camera.position.x = 320
			camera.position.y = 6
			camera.position.z = 2
			
			let controls;
			
			controls = new OrbitControls( camera );
			controls.enableZoom = false;
			controls.enablePan = false;	
			controls.enableRotate = false;	
			
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

	// MAIN LOOP
	animate = () => {
		if(this.props.store.loadedModels.length > 0) {

			let modelPC = this.props.store.chosenModelPointCloud;
			let modelMesh = this.props.store.chosenModel

			this.controls.target.set(
				modelMesh.position.x,
				modelMesh.position.y,
				modelMesh.position.z,
			)

			if(modelPC !== undefined) {
				modelPC.rotateAroundWorldAxis(new THREE.Vector3(0, 1, 0), 0.001);
			}
		}

		this.chooser.loading(this.camera);

		this.scene.traverse(( object ) => {
			if ( object instanceof THREE.LOD ) {
				object.update( this.camera );
			}
		});

		if(this.props.store.state === "GENERATION") {

			let gc = this.generatingControls;
			
			if(this.props.store.chosenModelPointCloud !== null ){
				this.props.store.chosenModelPointCloud.rotateAroundObjectAxis( new THREE.Vector3(0, 0, 1), gc.targetRotation.x);
			}
			//this.rotateAroundWorldAxis(this.props.store.chosenModel, new THREE.Vector3(1, 0, 0), gc.targetRotation.y);

			gc.targetRotation.y = gc.targetRotation.y * (1 - gc.slowingFactor);
			gc.targetRotation.x = gc.targetRotation.x * (1 - gc.slowingFactor);
			
			if(this.props.store.viewport.rotateNext) {
				this.chooser.rotateDiskNext();
			}

			if(this.props.store.viewport.rotatePrevious) {
				this.chooser.rotateDiskPrevious();
			}
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