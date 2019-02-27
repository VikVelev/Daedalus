export function calculateCoordinates(index) {
    let coords = { x: 0, y: 0 };
    
    let center = { x: 0, y: 0}

    let r = 2;
    let h = (2/r);
    let t = Math.asin(1 - ((h^2)/2));

    console.log(t);
    coords.x = (center.x + r*Math.cos(t*index));
    coords.y = (center.y + r*Math.sin(t*index));

    console.log(coords);
    return coords;
}