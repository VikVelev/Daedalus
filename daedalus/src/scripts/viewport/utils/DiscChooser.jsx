
//TODO: Try this
/* 
    Use this function go generate 10 discs to act as placeholders
    

*/

import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as THREE from 'three';


export function calculateCoordinates(index) {

    let coords = { x: 0, y: 0 };
    let center = { x: 0, y: 0 };

    let r = 2;
    let h = (2/r);
    let t = Math.asin(1 - ((h^2)/2));

    coords.x = (center.x + r*Math.cos(t*index));
    coords.y = -(center.y + r*Math.sin(t*index));

    return coords;
}

@observer
class DiscChooser extends Component {
    
    disks = [];
    lights = [];

    constructor(props){
        super(props);
        //console.log(this.props);
        this.store = this.props
    }

    hideDisks() {
        for (let i = 0; i < this.disks.length; i++) {
            if(this.store.currentlyChosenModel !== i) {
                this.disks[i].visible = false;
            }
        }
    }

    showDisks() {
        this.disks.forEach(element => {
            element.visible = true;
        });
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

        material.side = THREE.DoubleSide;
        let circle = new THREE.Mesh( geometry, material)

        let coords = calculateCoordinates(index);

        circle.position.x = coords.x * 100;
        circle.position.z = coords.y * 100;
        circle.position.y -= 20;

        circle.rotation.x += -Math.PI/2;
        this.disks.push(circle);

        /* Light */
        let light = new THREE.PointLight( 0xffe300, 2, 100 );
        light.position.set( circle.position.x, circle.position.y + 80, circle.position.z );
        this.lights.push(light);

        group.add( light );
        group.add( circle );

        return group;
    }
}

export default DiscChooser



