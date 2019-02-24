
import PLYLoader from './PLYLoader.jsx';
import { MeshStandardMaterial, Mesh, SphereGeometry, Group, MeshLambertMaterial } from 'three';

if (window.require !== undefined) {
    const rie = true; //Running In Electron (RIE/rie)
    const electron = window.require("electron");
    console.log("Running within Electron...");
} else {
    const rie = false;
    const electron = null;
    console.log("Running within web.");
}


export default class PointCloud {
    
    // Since at this moment the AI is currently able to generate just point clouds
    // we need to visualize them correctly with ThreeJS
    
    vertices = []; // plain [[x,y,z],...] array
    geometry = []; // Three js converted vertices
    sphere_geometry = new Group();
    loader = new PLYLoader();

    constructor(vertices, filename){
        console.log(this.loader);
    }

    loadFromFile(scene) {

        this.loader.load('models/test.ply', ( geometry ) => {
            console.log(geometry);
            this.vertices = geometry;
            geometry.computeVertexNormals();

            let material = new MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
            this.model = new Mesh( geometry, material );

            this.model.position.y = - 0.2;
            this.model.position.z = 0.3;
            this.model.rotation.x = - Math.PI / 2;
            this.model.scale.multiplyScalar( 0.001 );

            this.model.castShadow = true;
            this.model.receiveShadow = true;
            
            this.makeRenderable(scene);
            console.log(this.model);
        })
    }  

    convertToGeometry() {
        this.geometry = []; // threeMethod(this.vertices) \\ to convert it to three js buffer geometry
    }

    makeRenderable(scene) {
        let allVertices = [];

        for (let i = 0; i < this.vertices.attributes.position.array.length; i += 3) {
            allVertices.push([
                this.vertices.attributes.position.array[i], 
                this.vertices.attributes.position.array[i + 1], 
                this.vertices.attributes.position.array[i + 2]
            ]);
        }

        
        allVertices.forEach(point => {

            let geometry = new SphereGeometry(1.2, 16, 16);
            let material = new MeshLambertMaterial( { color: 0x0055ff} );

            let sphere = new Mesh(geometry, material);
            sphere.position.x = point[0] * 100;
            sphere.position.y = point[1] * 100;
            sphere.position.z = point[2] * 100;
            
            this.sphere_geometry.add(sphere);
        })

        this.sphere_geometry.rotation.x = -1.5;
        scene.add(this.sphere_geometry);
        
        console.log(this.sphere_geometry);
    }

}
