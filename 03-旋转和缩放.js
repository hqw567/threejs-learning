import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(2, 2, 5)

controls.enableDamping = true
controls.dampingFactor = 0.05

const geometry = new THREE.BoxGeometry(1, 1, 1)

const fatherMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const fatherCube = new THREE.Mesh(geometry, fatherMaterial)
fatherCube.position.set(-3, 0, 0)
fatherCube.rotation.x = Math.PI / 4
scene.add(fatherCube)

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(3, 0, 0)
cube.rotation.x = Math.PI / 4

fatherCube.add(cube)

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

animate()
