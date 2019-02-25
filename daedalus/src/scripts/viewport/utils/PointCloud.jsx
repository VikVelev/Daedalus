
import PLYLoader from './PLYLoader.jsx';
import MTLLoader from './MTLLoader.jsx';
import { 
    MeshLambertMaterial,
    SphereGeometry, 
    //CubeGeometry, 
    Group, 
    Mesh, 
} from 'three';

let THREE = require('three');

let OBJLoader2 = require('./OBJLoader')
OBJLoader2(THREE, MTLLoader)
//This should come in use when I get to reading IO, Importing and exporting files;
// eslint-disable-next-line
let electron, rie;

if (window.require !== undefined) {
    rie = true; //Running In Electron (RIE/rie)
    electron = window.require("electron");
    console.log("Running within Electron...");
} else {
    rie = false;
    electron = null;
    console.log("Running within web.");
}

export default class PointCloud {
    
    // Since at this moment the AI is currently able to generate just point clouds
    // we need to visualize them correctly with ThreeJS

    vertices = []; // plain [[x,y,z],...] array
    geometry = {}; //three js object (probably buffered geometry)
    scene_objects = [];
    sphere_geometry = new Group();
    loader = {} // a loader selected dynamically depending on the file you wanna load
    type = "" //obj or ply

    constructor(filename, scene){

        this.filename = filename;
        this.scene = scene;

        this.type = this.filename.slice(-3);

        if(this.type === "obj") {

            this.loader = new THREE.OBJLoader2();
            this.loader.logging.enabled = false;

        } else if(this.type === "ply") {

            this.loader = new PLYLoader();

        }
    }

    callbackOnProgress = (data) => {
        console.log(data);
    }

    callbackOnError = (data) => {
        console.log(data);
    }


    callbackOnLoad = (data) => {
        if (this.type === "obj") {

            let object = data.detail.loaderRootNode;

            //If there is no geometry
            if(object.children.length < 1) {

                let pc = this.convertToSphereCloud(this.loader.vertexArray);
                this.scene.add(pc);
                this.scene_objects.push(pc);

            } else {
                this.scene.add(object);
                this.scene_objects.push(object);
            }
            
        } else if (this.type === "ply") {

            this.geometry = data;

            let pc = this.convertToSphereCloud(this.vertices);
            this.scene.add(pc);
            this.scene_objects.push(pc);
        }
    }

    load = () => {
        if(this.type === "ply") {

            this.loader.load(this.filename, this.callbackOnLoad);

        } else if (this.type === "obj") {

            this.loader.load(this.filename, 
                             this.callbackOnLoad, 
                             this.callbackOnProgress, 
                             this.callbackOnError, 
                             null, 
                             false)
            console.log(this.loader);
        }
    }

    plyGeometryToVertices(geometry) {

        let vertices = []

        for (let i = 0; i < geometry.attributes.position.array.length; i += 3) {
            vertices.push([
                geometry.attributes.position.array[i + 0], 
                geometry.attributes.position.array[i + 1], 
                geometry.attributes.position.array[i + 2]
            ]);
        }

        return vertices;
    }

    convertToSphereCloud(vertices) {

        if (this.type === "ply") {
            this.vertices = vertices = this.plyGeometryToVertices(this.geometry); //wow what
        }

        vertices.forEach(point => {
            
            //TODO: Customization of point visualization -> sphere/cube/prism w/e;
            let geometry = new SphereGeometry(1.2, 8, 8);
            let material = new MeshLambertMaterial({ color: 0x0055ff });

            let sphere = new Mesh(geometry, material);
            sphere.position.x = point[0] * 100;
            sphere.position.y = point[1] * 100;
            sphere.position.z = point[2] * 100;
            
            this.sphere_geometry.add(sphere);
        })

        this.model = this.sphere_geometry;
        this.sphere_geometry.rotation.x = - Math.PI / 2;

        return this.sphere_geometry;
    }

}
