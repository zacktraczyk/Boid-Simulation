import * as THREE from 'three';

let camera, scene, renderer;
let mesh;

function Init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10);
    camera.position.set(2.5, 2, 2);
    camera.lookAt(scene.position);

    const geometry = new THREE.ConeGeometry(0.1, 0.3, 3);
    const material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);

    scene.add( mesh );

    const geo = new THREE.EdgesGeometry( new THREE.BoxGeometry(2, 2, 2) ); // or WireframeGeometry( geometry )
    const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    const wireframe = new THREE.LineSegments( geo, mat );

    scene.add( wireframe );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

window.addEventListener('DOMContentLoaded', () => {
    Init()
})
