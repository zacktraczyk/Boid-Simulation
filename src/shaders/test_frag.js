function Frag() {
    return `
        uniform vec3 boxColor;
        varying vec3 v_Normal;

        void main() {
            gl_FragColor = vec4(boxColor, 1.0);
        }
    `
}

export default Frag;
