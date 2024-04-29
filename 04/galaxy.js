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

const gui = new GUI()

const parameters = {
  count: 10000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#e74942',
  outsideColor: '#146877',
}
let geometry
let material
let points
const generateGalaxy = () => {
  if (points) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const colorInside = new THREE.Color(parameters.insideColor)
  const coloroutside = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    const radius = Math.random() * parameters.radius
    const spinAngle = radius * parameters.spin
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

    // Color

    const mixedColor = colorInside.clone()
    mixedColor.lerp(coloroutside, radius / parameters.radius)
    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }
  geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}
generateGalaxy()
gui.add(parameters, 'size', 0.001, 0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'count', 100, 100000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius', 0.01, 20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches', 2, 20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin', -5, 5).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness', 0, 2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower', 1, 10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onChange(generateGalaxy)

const timer = new Timer()
const animation = (timestamp) => {
  requestAnimationFrame(animation)

  timer.update(timestamp)
  const delta = timer.getDelta()
  const elapsed = timer.getElapsed()

  if (points) {
    points.rotation.y += 0.001
  }

  controls.update()
  renderer.render(scene, camera)
}
animation()
