import { GLTFLoader } from 'GLTFLoader';

function setupModel(data) {
    const model = data.scene.children[0];
    return model;
}

async function loadFishMesh() {
    const loader = new GLTFLoader();
    const fishData = await loader.loadAsync('../models/logo.glb');
    const fishMesh = setupModel(fishData);
    return { fishMesh }
}

export { loadFishMesh };
