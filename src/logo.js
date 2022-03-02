import { GLTFLoader } from 'GLTFLoader';

function setupModel(data) {
    const model = data.scene.children[0];
    return model;
}

async function loadLogo() {
    const loader = new GLTFLoader();
    const logoData = await loader.loadAsync('../models/logo.glb');
    const logo = setupModel(logoData);
    return { logo }
}

export { loadLogo };
