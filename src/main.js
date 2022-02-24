import * as THREE from 'three';

let camera, scene, renderer;
let cube;

function Init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10);
    camera.position.set(0, 3.5, 5);
    camera.lookAt(scene.position);

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial();

    cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

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

    cube.rotation.x += 0.005;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

window.addEventListener('DOMContentLoaded', () => {
    Init()
})
