
//TODO: Try this
/* 
    Use this function go generate 10 discs to act as placeholders
    

*/

import { Component } from 'react'
import { observer } from 'mobx-react'
import * as THREE from 'three';
import { rotateAroundWorldAxis } from './MatrixRotation.jsx'
//import { Loader } from 'semantic-ui-react';


export function calculateCoordinates(index) {

    let coords = { x: 0, y: 0, rad: 0 };
    let center = { x: 0, y: 0 };

    let r = 2;
    let h = (2/r);
    let t = Math.asin(1 - ((h^2)/2));

    coords.rad = t;
    coords.x = (center.x + r*Math.cos(t*index));
    coords.y = -(center.y + r*Math.sin(t*index));

    return coords;
}

@observer
class DiscChooser extends Component {
    
    disks = [];
    lights = [];
    loadingFrontend = [];
    loadingText = [];
    elements = new THREE.Object3D();
    pivot = new THREE.Group();
    rotating = false;
    steps = 25;
    target = { rad: 0, step: 0, rot: 0 };

    constructor(props){
        super(props);
        //console.log(this.props);
        this.store = this.props
    }

    hideDisks() {
        for (let i = 0; i < this.disks.length; i++) {
            this.disks[i].visible = false;
        }
    }

    showDisks() {
        this.disks.forEach(element => {
            element.visible = true;
        });
    }

    setModelToDiskPositionMappedByIndices(){
        for (let i = 0; i < this.store.loadedModels.length; i++) {

            let position = this.disks[i].getWorldPosition(new THREE.Vector3());

            this.store.loadedModels[i].position.set(
                position.x,
                position.y + 20,
                position.z,
            )
        }
    }

    rotateDiskPrevious = (modelsRef) => {
        //Rotate to the disks to index
        if(!this.rotating) {

            this.target = {
                rad: -calculateCoordinates(0).rad,
                step: -calculateCoordinates(0).rad / this.steps,
                rot: 0,
            }
            this.rotating = true;
        }

        if(this.rotating) {
            rotateAroundWorldAxis(this.elements, new THREE.Vector3(0, 1, 0), this.target.step)
            this.setModelToDiskPositionMappedByIndices();
            this.target.rot += this.target.step;
        }

        if(this.target.rad.toFixed(3) === this.target.rot.toFixed(3)){
            this.rotating = false;
            this.store.viewport.rotatePrevious = false;
        }
    }

    rotateDiskNext = (modelsRef) => {
        //Rotate to the disks to index
        if(!this.rotating) {

            this.target = {
                rad: calculateCoordinates(0).rad,
                step: calculateCoordinates(0).rad / this.steps,
                rot: 0,
            }
            this.rotating = true;
        }

        if(this.rotating) {
            rotateAroundWorldAxis(this.elements, new THREE.Vector3(0, 1, 0), this.target.step)
            this.setModelToDiskPositionMappedByIndices();
            this.target.rot += this.target.step;
        }

        if(this.target.rad.toFixed(3) === this.target.rot.toFixed(3)){
            this.rotating = false;
            this.store.viewport.rotateNext = false;
        }
    }

    // Should be used in a loop with all the positions
    generateDisc(index) {
        let group = new THREE.Group();
    
        let geometry = new THREE.CircleGeometry(30, 32);
        let material
        
        if (index === 0){
            material = new THREE.MeshLambertMaterial({ color: 0x28a4ff, transparent: true, opacity: 0.7 });
        } else {
            material = new THREE.MeshLambertMaterial({ color: 0x165a8c, transparent: true, opacity: 0.7 });
        }

        /* Disk */
        material.side = THREE.DoubleSide;
        let circle = new THREE.Mesh( geometry, material)

        let coords = calculateCoordinates(index);

        circle.position.x = coords.x * 100;
        circle.position.z = coords.y * 100;
        circle.position.y -= 20;

        circle.rotation.x += -Math.PI/2;
        this.disks.push(circle);

        /* Loading text TODO */
        // let fontLoader = new THREE.FontLoader();
        // let text = new THREE.Object3D();

        // fontLoader.load('https://threejs.org/docs/files/inconsolata.woff', (font) => {

        //     text = new THREE.TextGeometry("Loading", {
        //         font: font,
        //         size: 80,
        //         height: 5,
        //         curveSegments: 12,
        //         bevelEnabled: true,
        //         bevelThickness: 10,
        //         bevelSize: 8,
        //         bevelSegments: 5
        //     })

        //     text.position = circle.position;


        // })

        // this.loadingText.push(text);

        /* Loading Icohasedron */
        let icohasedron = new THREE.IcosahedronGeometry(10, 1);
        let icoMaterial = new THREE.MeshLambertMaterial({ color: 0x165a8c });

        icohasedron = new THREE.Mesh(icohasedron, icoMaterial);
        icohasedron.position.set(circle.position.x, circle.position.y + 20, circle.position.z);
        icohasedron.material.wireframe = true;
        this.loadingFrontend.push(icohasedron);

        /* Light */
        let light = new THREE.PointLight( 0xffe300, 2, 100 );
        light.position.set( circle.position.x, circle.position.y + 80, circle.position.z );
        this.lights.push(light);
        
        /* Group */
        group.add( light );
        group.add( circle );
        // group.add( text );
        group.add( icohasedron )

        this.elements.add(group);
        this.showDisks();
        
        /* This can either return one group of objects to add to the scene, 
           or use the this.elements to load all of them at once */
        return group;
    }

    loading(camera) {
        this.store.currentlyLoadingBool.forEach((item, i) => {
            this.loadingFrontend[i].visible = item;
        })

        this.loadingFrontend.forEach((item, i) => {
            
            if (this.store.currentlyLoadingBool[i]) {
                item.rotation.x += 0.05;
                item.rotation.y += 0.05;

                // this.loadingText[i].lookAt(camera.position);
            }
            //item.rotation.z += 0.01;
        })
        
    }
}

export default DiscChooser



