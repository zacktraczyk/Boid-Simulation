export default function Vert() {
    return `
        varying vec3 v_Normal; 

        void main() {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
            v_Normal = normal;
        }
    `
}
