
//TODO: Try this
/* 
    Use this function go generate 10 discs to act as placeholders
    

*/

import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as THREE from 'three';

@observer
class DiscChooser extends Component {
    
    disks = []

    calculateCoordinates(index) {

        let coords = { x: 0, y: 0 };
        let center = { x: 0, y: 0 };
    
        let r = 2;
        let h = (2/r);
        let t = Math.asin(1 - ((h^2)/2));
    
        coords.x = (center.x + r*Math.cos(t*index));
        coords.y = -(center.y + r*Math.sin(t*index));
    
        return coords;
    }
    // Should be used in a loop with all the positions
    generateDisc(index) {

        let geometry = new THREE.CircleGeometry(30, 32);
        let material = new THREE.MeshLambertMaterial({ color: 0x5555ff, transparent: true, opacity: 0.7 });
        material.side = THREE.DoubleSide;
        let circle = new THREE.Mesh( geometry, material)

        let coords = this.calculateCoordinates(index);

        circle.position.x = coords.x * 100;
        circle.position.z = coords.y * 100;
        circle.position.y -= 20;

        circle.rotation.x += -Math.PI/2;
        this.disks.push(circle);

        return circle;
    }

    render() {
        return (
            <div>
            
            </div>
        )
    }
}

export default DiscChooser



