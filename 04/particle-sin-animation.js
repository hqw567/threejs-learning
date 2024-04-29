import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { Timer } from 'three/addons/misc/Timer.js'

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 8)

const controls = new OrbitControls(camera, renderer.domElement)

const light = new THREE.AmbientLight(0x404040, 100)
scene.add(light)

const texture = new THREE.TextureLoader()
const circle_02 = texture.load('/textures/particles/circle_02.png')

const count = 5000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)
for (let i = 0; i < count; i++) {
  const i3 = i * 3
  positions[i3] = THREE.MathUtils.randFloatSpread(10)
  positions[i3 + 1] = THREE.MathUtils.randFloatSpread(10)
  positions[i3 + 2] = THREE.MathUtils.randFloatSpread(10)

  colors[i3] = Math.random()
  colors[i3 + 1] = Math.random()
  colors[i3 + 2] = Math.random()
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

const material = new THREE.PointsMaterial({ size: 0.1, alphaMap: circle_02, transparent: true })
// material.alphaTest = 0.001
// material.depthTest = false
material.depthWrite = false
// material.blending = THREE.AdditiveBlending
material.vertexColors = true
const points = new THREE.Points(geometry, material)

scene.add(points)

const timer = new Timer()
const animation = (timestamp) => {
  requestAnimationFrame(animation)

  timer.update(timestamp)
  const delta = timer.getDelta()
  const elapsed = timer.getElapsed()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = geometry.attributes.position.array[i3]
    const y = geometry.attributes.position.array[i3 + 1]
    const z = geometry.attributes.position.array[i3 + 2]
    geometry.attributes.position.array[i3 + 1] = Math.sin(elapsed + x)
  }
  geometry.attributes.position.needsUpdate = true

  // points.position.y = Math.sin(time)
  controls.update()
  renderer.render(scene, camera)
}
animation()
