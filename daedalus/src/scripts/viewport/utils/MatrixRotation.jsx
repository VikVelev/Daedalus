import * as THREE from 'three';


export function rotateAroundWorldAxis ( object, axis, radians ) {

    let rotationMatrix = new THREE.Matrix4();

    rotationMatrix.makeRotationAxis( axis.normalize(), radians );
    rotationMatrix.multiply( object.matrix ); 						// pre-multiply
    object.matrix = rotationMatrix;
    object.rotation.setFromRotationMatrix( object.matrix );

}

export function rotateAroundObjectAxis ( object, axis, radians) {
    let rotationMatrix = new THREE.Matrix4();

    rotationMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotationMatrix);
    object.rotation.setFromRotationMatrix( object.matrix );

}

export function degreesToRadians( degrees ) {
    return degrees * ( Math.PI / 180 );
}

export function radiansToDegrees( radians ) {
    return radians * ( 180 / Math.PI );
}

export function getCenterPoint(mesh) {
    let geometry = mesh.geometry;
    geometry.computeBoundingBox();   
    let center = geometry.boundingBox.getCenter();
    mesh.localToWorld( center );
    return center;
}