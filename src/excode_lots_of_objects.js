// List of all the materials used in the meshes you want to combine
var materials = [material1, material2, material3]; 

// List of the meshes you want to combine, for each one you have to store the index of the material within the materials array 
var meshes = [{mesh: mesh1, materialIndex:0}, {mesh: mesh2, materialIndex:1}, {mesh: mesh3, materialIndex:2}];

// Geometry of the combined mesh
var totalGeometry = new THREE.Geometry();
for(var i = 0; i < meshes.length; i++)
{
    meshes[i].mesh.updateMatrix();
    totalGeometry.merge(meshes[i].mesh.geometry, meshes[i].mesh.matrix, meshes[i].materialIndex);
}

// Create the combined mesh
var combinedMesh = new THREE.Mesh(totalGeometry, new THREE.MeshFaceMaterial(materials));
scene.add(combinedMesh);



// OR DO THIS: https://codepen.io/tksiiii/pen/jzBZdo
const generateBoid = () => {
    const creatures = [];
    scene.remove(creatureMeshGroup);
    creatureMeshGroup = new THREE.Group();
    for (let i = 0; i < creatureNum; i++) {
        const creature = new Creature();
        creatureMeshGroup.add(creature.mesh);
        creatures.push(creature);
    }
    boid = new Boid(creatures);
    scene.add(creatureMeshGroup);
}
generateBoid();
