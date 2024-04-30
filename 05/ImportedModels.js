import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(3, 4, 5)
scene.add(camera)

const controls = new OrbitControls(camera, renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const gui = new GUI()
const parameters = {
  loopOnce: false,
  clampWhenFinished: false,
}

const cubeTextureLoader = new THREE.CubeTextureLoader()
const Px = '/textures/environmentMaps/0/px.jpg'
const Nx = '/textures/environmentMaps/0/nx.jpg'
const Py = '/textures/environmentMaps/0/py.jpg'
const Ny = '/textures/environmentMaps/0/ny.jpg'
const Pz = '/textures/environmentMaps/0/pz.jpg'
const Nz = '/textures/environmentMaps/0/nz.jpg'
const environmentMapTexture = cubeTextureLoader.load([Px, Nx, Py, Ny, Pz, Nz])

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
    side: THREE.DoubleSide,
  }),
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI / 2
scene.add(floor)
let mixer
let animationsMap = {}
let currentAction
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  'models/Fox/glTF/Fox.gltf',
  function (gltf) {
    const scale = 0.01
    gltf.scene.scale.set(scale, scale, scale)
    scene.add(gltf.scene)

    // 创建一个AnimationMixer，将gltf.scene传给它
    mixer = new THREE.AnimationMixer(gltf.scene)

    if (gltf.animations.length > 0) {
      const folder = gui.addFolder('Animations')

      gltf.animations.forEach((clip, index) => {
        animationsMap[clip.name] = clip
        folder.add({ play: () => playAnimation(clip.name) }, 'play').name(`Animation ${index + 1}: ${clip.name}`)
      })
      folder.add({ pause: () => pauseAnimation() }, 'pause').name('Pause Animation')
      folder.add({ resume: () => resumeAnimation() }, 'resume').name('Resume Animation')
      folder.add(parameters, 'loopOnce').name('Loop Once')
      folder.add(parameters, 'clampWhenFinished').name('Clamp When Finished')
    }
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  function (error) {
    console.log('An error happened', error)
  },
)
function playAnimation(name) {
  if (mixer) {
    if (currentAction) {
      currentAction.stop()
    }
    const clip = animationsMap[name]
    currentAction = mixer.clipAction(clip)
    currentAction.reset()

    if (parameters.loopOnce) {
      currentAction.setLoop(THREE.LoopOnce)
      currentAction.clampWhenFinished = parameters.clampWhenFinished
    } else {
      currentAction.setLoop(THREE.LoopRepeat)
    }
    currentAction.play()
  }
}

function pauseAnimation() {
  if (currentAction) {
    currentAction.paused = true
  }
}

function resumeAnimation() {
  if (currentAction && currentAction.paused) {
    currentAction.paused = false
  }
}

const timer = new Timer()
const animation = (timestamp) => {
  requestAnimationFrame(animation)

  const elapsed = timer.getElapsed()
  const delta = timer.getDelta()
  mixer?.update(delta)
  timer.update(timestamp)

  controls.update()
  renderer.render(scene, camera)
}
animation()
