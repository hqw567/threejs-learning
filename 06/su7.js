import './style.css'
import * as THREE from 'three'
import { Timer } from 'three/addons/misc/Timer.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

let scene, camera, renderer, gui, skybox, carModel
const timer = new Timer()
const config = {
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  fov: 40,
  near: 1,
  far: 1000,
  mousemoveX: 0,
  mousemoveY: 0,
  height: 15,
  radius: 100,
  enabled: true,
  carColor: {
    glass: '#ffffff',
    details: '#ffffff',
    body: '#000000',
  },
}
const objects = {}

const wheels = []
const rgbeLoader = new RGBELoader()
const gltfLoader = new GLTFLoader()
init().then(render)

async function init() {
  camera = new THREE.PerspectiveCamera(config.fov, config.screenWidth / config.screenHeight, config.near, config.far)
  camera.position.set(-20, 7, 20)
  camera.lookAt(0, 4, 0)

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(config.screenWidth, config.screenHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const controls = new OrbitControls(camera, renderer.domElement)

  controls.target.set(0, 2, 0)
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90)
  controls.maxDistance = 80
  controls.minDistance = 20
  controls.enablePan = false
  controls.update()

  document.body.appendChild(renderer.domElement)
  window.addEventListener('resize', onWindowResize)

  gui = new GUI()

  const envMap = await rgbeLoader.loadAsync('/textures/blouberg_sunrise_2_1k.hdr')
  envMap.mapping = THREE.EquirectangularReflectionMapping

  skybox = new GroundedSkybox(envMap, config.height, config.radius)
  skybox.position.y = config.height - 0.01
  scene.add(skybox)

  scene.environment = envMap
  // scene.background = scene.environment

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/libs/draco/gltf/')

  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load('/models/su7/scene.gltf', function (gltf) {
    carModel = gltf.scene
    carModel.scale.multiplyScalar(4)

    scene.add(carModel)

    render()
  })

  animate()
}

function animate() {
  requestAnimationFrame(animate)

  timer.update()
  const delta = timer.getDelta()
  const elapsed = timer.getElapsed()

  if (carModel) {
    carModel.rotation.y = Math.PI + elapsed * 0.1
  }

  render()
}
function onWindowResize() {
  config.screenHeight = window.innerHeight
  config.screenWidth = window.innerWidth
  camera.aspect = config.screenWidth / config.screenHeight
  camera.updateProjectionMatrix()
  renderer.setSize(config.screenWidth, config.screenHeight)
}
function render() {
  renderer.render(scene, camera)
}
