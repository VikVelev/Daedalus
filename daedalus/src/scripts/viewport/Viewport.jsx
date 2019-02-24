import React, { Component } from 'react'
import { observer } from 'mobx-react'

import * as THREE from 'three';
import '../../styles/Viewport.css'

@observer
class Viewport extends Component {


	componentDidMount() {

		this.width = this.mount.clientWidth
		this.height = this.mount.clientHeight
		
		// Initialize basic scene
		this.scene = new THREE.Scene()
		
		//Configure Camera
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
		this.camera.position.z = 4

		//Configure Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setClearColor('#000000')
		this.mount.appendChild(this.renderer.domElement)
		
		//Load model
		const geometry = new THREE.BoxGeometry(1, 1, 1)
		const material = new THREE.MeshBasicMaterial({ color: '#433F81' })

		this.cube = new THREE.Mesh(geometry, material)
		this.scene.add(this.cube)

		//Initilize base event listeners and start animation loop
		window.addEventListener( 'resize', this.onWindowResize, false );

		this.onWindowResize();
		this.start();
	}

	onWindowResize = () => {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight);
	}

	componentWillUnmount() {
		this.stop()
		this.mount.removeChild(this.renderer.domElement)
	}

	start = () => {
		if (!this.frameId) {
		this.frameId = requestAnimationFrame(this.animate)
		}
	}

	stop = () => {
		cancelAnimationFrame(this.frameId)
	}

	animate = () => {
		this.cube.rotation.x += 0.01
		this.cube.rotation.y += 0.01
		this.renderScene()
		this.frameId = window.requestAnimationFrame(this.animate)
	}

	renderScene = () => {
		this.renderer.render(this.scene, this.camera)
	}

	render(){
		return(
			<div id="viewport" ref={(mount) => { this.mount = mount }}/>
		)
	}
}

export default Viewport