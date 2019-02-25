
import PLYLoader from './PLYLoader.jsx';
import { Mesh, SphereGeometry, CubeGeometry, Group, MeshLambertMaterial } from 'three';

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
    
    //TODO IMplement OBJ just vertices parser on top of a real obj parser

    vertices = []; // plain [[x,y,z],...] array
    geometry = {}; //three js object (probably buffered geometry)
    sphere_geometry = new Group();
    loader = new PLYLoader();

    constructor(filename){
        this.filename = filename;
        console.log(this.loader);
    }

    loadFromFile(scene) {

        this.loader.load(this.filename, ( geometry ) => {
            this.geometry = geometry;

            scene.add(this.convertToSphereCloud());
        })
    }

    convertToSphereCloud() {

        for (let i = 0; i < this.geometry.attributes.position.array.length; i += 3) {
            this.vertices.push([
                this.geometry.attributes.position.array[i + 0], 
                this.geometry.attributes.position.array[i + 1], 
                this.geometry.attributes.position.array[i + 2]
            ]);
        }

        
        this.vertices.forEach(point => {
            
            //TODO: Customization of point -> sphere/cube/prism w/e;
            let geometry = new SphereGeometry(1.2, 8, 8);
            let material = new MeshLambertMaterial({ color: 0x0055ff });

            let sphere = new Mesh(geometry, material);
            sphere.position.x = point[0] * 100;
            sphere.position.y = point[1] * 100;
            sphere.position.z = point[2] * 100;
            
            this.sphere_geometry.add(sphere);
        })

        this.model = this.sphere_geometry;
        this.sphere_geometry.rotation.x = -1.5;

        return this.sphere_geometry;
    }

}
