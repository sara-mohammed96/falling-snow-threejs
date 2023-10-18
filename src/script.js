import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Particles
const snowGeometry = new THREE.BufferGeometry()
const count = 5000;

const positions = new Float32Array(count * 3);
const velocities = new Float32Array(count * 3); // Store velocities for snowfall

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    velocities[i] = Math.random() / 5; // Randomize snowflake velocities
}

const textureLoader = new THREE.TextureLoader()
const snowTexture = textureLoader.load('/textures/particles/snow.png')

snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const snowMaterial = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: snowTexture,
    opacity: 0.6,
})

// Turn off depth testing to prevent snowflakes from disappearing behind each other
snowMaterial.depthTest = false

// Points
const snowParticles = new THREE.Points(snowGeometry, snowMaterial)
scene.add(snowParticles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update snowflake positions
    for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= velocities[i * 3 + 1] * 0.2;

        // If a snowflake falls out of view, reset its position to the top
        if (positions[i * 3 + 1] < -2) {
            positions[i * 3 + 1] = 5;
        }
    }

    snowGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
