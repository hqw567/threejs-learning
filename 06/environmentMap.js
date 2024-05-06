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
  controls.addEventListener('change', render)
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

  gltfLoader.load('/models/ferrari/ferrari.glb', function (gltf) {
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: config.carColor.body,
      metalness: 1.0,
      roughness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
    })

    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: config.carColor.details,
      metalness: 1.0,
      roughness: 0.5,
    })

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: config.carColor.glass,
      metalness: 0.25,
      roughness: 0,
      transmission: 1.0,
    })

    gui.addColor(config.carColor, 'body').onChange(() => {
      bodyMaterial.color.set(config.carColor.body)
    })
    gui.addColor(config.carColor, 'details').onChange(() => {
      detailsMaterial.color.set(config.carColor.details)
    })
    gui.addColor(config.carColor, 'glass').onChange(() => {
      glassMaterial.color.set(config.carColor.glass)
    })

    carModel = gltf.scene.children[0]
    carModel.scale.multiplyScalar(4)
    carModel.rotation.y = Math.PI

    carModel.getObjectByName('body').material = bodyMaterial

    carModel.getObjectByName('rim_fl').material = detailsMaterial
    carModel.getObjectByName('rim_fr').material = detailsMaterial
    carModel.getObjectByName('rim_rr').material = detailsMaterial
    carModel.getObjectByName('rim_rl').material = detailsMaterial
    carModel.getObjectByName('trim').material = detailsMaterial

    carModel.getObjectByName('glass').material = glassMaterial

    wheels.push(
      carModel.getObjectByName('wheel_fl'),
      carModel.getObjectByName('wheel_fr'),
      carModel.getObjectByName('wheel_rl'),
      carModel.getObjectByName('wheel_rr'),
    )

    // shadow
    const shadow = new THREE.TextureLoader().load('/models/ferrari/ferrari_ao.png')
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: shadow,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true,
      }),
    )
    mesh.rotation.x = -Math.PI / 2
    carModel.add(mesh)

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

  if (carModel && wheels.length > 0) {
    carModel.rotation.y = Math.PI + elapsed * 0.1

    for (let i = 0; i < wheels.length; i++) {
      wheels[i].rotation.x = elapsed * Math.PI * 2 * 0.1
    }
  }

  render()
}
function onWindowResize() {
  config.screenHeight = window.innerHeight
  config.screenWidth = window.innerWidth
  camera.aspect = config.screenWidth / config.screenHeight
  camera.updateProjectionMatrix()
  renderer.setSize(config.screenWidth, config.screenHeight)
  render()
}
function render() {
  renderer.render(scene, camera)
}
