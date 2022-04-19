import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

//
// Extract mesh from glTF Loader
//
function setupModel(data: any): THREE.Mesh {
    const model = data.scene.children[0];
    return model;
}

//
// Load Mesh
//
export async function loadMesh(path: string) {
    const loader = new GLTFLoader();
    const fishData = await loader.loadAsync(path);
    const fishMesh = setupModel(fishData);
    return { fishMesh }
}
