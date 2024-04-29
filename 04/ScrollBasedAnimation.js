import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { Timer } from 'three/addons/misc/Timer.js'

const textEl = document.createElement('h1')
const textEl2 = document.createElement('h1')
const textEl3 = document.createElement('h1')
textEl.setAttribute('class', 'relative z-10 flex items-center px-[15%] text-white text-[100px] h-screen font-bold')
textEl2.setAttribute(
  'class',
  'relative z-10 justify-end  px-[15%] flex items-center text-white text-[100px] h-screen font-bold',
)
textEl3.setAttribute('class', 'relative z-10  px-[15%] flex items-center text-white text-[100px] h-screen font-bold')
textEl.innerHTML = 'Hello!'
textEl2.innerHTML = '你好!'
textEl3.innerHTML = 'こんにちは!'

document.body.appendChild(textEl)
document.body.appendChild(textEl2)
document.body.appendChild(textEl3)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const scene = new THREE.Scene()

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 6
cameraGroup.add(camera)
// const controls = new OrbitControls(camera, renderer.domElement)

const textureLoader = new THREE.TextureLoader()

const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

const gui = new GUI()
const parameters = {
  meterialColor: '#ffeded',
}

const material = new THREE.MeshToonMaterial({
  color: parameters.meterialColor,
  gradientMap: gradientTexture,
})

const objectsDistance = 4
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material)
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material)
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material)

mesh1.position.y = -objectsDistance * 0
mesh2.position.y = -objectsDistance * 1
mesh3.position.y = -objectsDistance * 2

mesh1.position.x = 1
mesh2.position.x = -1
mesh3.position.x = 1

const sectionMeshes = [mesh1, mesh2, mesh3]
scene.add(mesh1, mesh2, mesh3)

const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3
  positions[i3] = THREE.MathUtils.randFloatSpread(10)
  positions[i3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
  positions[i3 + 2] = THREE.MathUtils.randFloatSpread(10)
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particlesMaterial = new THREE.PointsMaterial({ size: 0.03, color: parameters.meterialColor })
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
gui.addColor(parameters, 'meterialColor').onChange(() => {
  material.color.set(parameters.meterialColor)
  particlesMaterial.color.set(parameters.meterialColor)
})
let currentSection = 0
let scrollY = window.scrollY
addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / window.innerHeight)
  if (newSection != currentSection) {
    currentSection = newSection
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    })
  }
})

const cursor = {
  x: 0,
  y: 0,
}
window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / window.innerWidth - 0.5
  cursor.y = event.clientY / window.innerHeight - 0.5
})

const timer = new Timer()
const animation = (timestamp) => {
  requestAnimationFrame(animation)

  timer.update(timestamp)
  const delta = timer.getDelta()
  const elapsed = timer.getElapsed()
  camera.position.y = (-scrollY / window.innerHeight) * objectsDistance

  const parallaxX = cursor.x * 0.5
  const parallaxY = -cursor.y * 0.5
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * delta
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * delta

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += delta * 0.1
    mesh.rotation.y += delta * 0.12
  }

  // controls.update()
  renderer.render(scene, camera)
}
animation()
