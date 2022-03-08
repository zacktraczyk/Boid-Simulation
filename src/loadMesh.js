import { GLTFLoader } from 'GLTFLoader';

//
// Extract mesh from glTF Loader
//
function setupModel(data) {
    const model = data.scene.children[0];
    return model;
}

//
// Load Mesh
//
export async function loadMesh(path) {
    const loader = new GLTFLoader();
    const fishData = await loader.loadAsync(path);
    const fishMesh = setupModel(fishData);
    return { fishMesh }
}
