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

const cubeTextureLoader = new THREE.CubeTextureLoader()

const Px = '/textures/environmentMaps/0/px.jpg'
const Nx = '/textures/environmentMaps/0/nx.jpg'
const Py = '/textures/environmentMaps/0/py.jpg'
const Ny = '/textures/environmentMaps/0/ny.jpg'
const Pz = '/textures/environmentMaps/0/pz.jpg'
const Nz = '/textures/environmentMaps/0/nz.jpg'

const environmentMapTexture = cubeTextureLoader.load([Px, Nx, Py, Ny, Pz, Nz])

/**
 * Physics
 */
// World
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world) // 碰撞检测
// world.allowSleep = true // 允许睡眠
world.gravity.set(0, -9.82, 0) // 设置重力

// Materials
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
// const contactMaterial = new CANNON.ContactMaterial(concreteMaterial, plasticMaterial, {
//   friction: 0.1,
//   restitution: 0.9,
// })
const defaultMaterial = new CANNON.Material('default')
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1, // 摩擦力
  restitution: 0.7, // 弹性
})

world.addContactMaterial(contactMaterial)
world.defaultContactMaterial = contactMaterial
// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
  mass: 0,
})
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

world.addBody(floorBody)

const hitSound = new Audio('/sounds/hit.mp3')
const playHitSound = (collision) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()
  if (impactStrength > 1.5) {
    hitSound.volume = Math.random()
    hitSound.currentTime = 0
    hitSound.play()
  }
}
// Sphere
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
// })
// world.addBody(sphereBody)
let objects = []
const createSphere = (radius, widthSegments, heightSegments, position) => {
  // THREE
  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

  const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
  })
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  mesh.position.copy(new THREE.Vector3(position.x, position.y, position.z))
  mesh.castShadow = true
  scene.add(mesh)

  // CANNON
  const body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(radius),
  })
  body.position.copy(position)
  body.addEventListener('collide', playHitSound)
  world.addBody(body)

  objects.push({
    body,
    mesh,
  })
}

const createCube = (width, height, depth, position) => {
  // THREE
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(new THREE.Vector3(position.x, position.y, position.z))
  mesh.castShadow = true
  scene.add(mesh)

  // CANNON
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
  const body = new CANNON.Body({
    mass: 1,
    shape,
  })
  body.position.copy(position)
  body.addEventListener('collide', playHitSound)
  world.addBody(body)

  objects.push({
    body: body,
    mesh: mesh,
  })
}

const gui = new GUI()
const parameters = {
  createSphere: () => {
    createSphere(THREE.MathUtils.randFloat(0.2, 0.5), 32, 32, {
      x: THREE.MathUtils.randFloatSpread(3),
      y: 6,
      z: THREE.MathUtils.randFloatSpread(3),
    })
  },
  createCube: () => {
    createCube(
      THREE.MathUtils.randFloat(0.1, 0.6),
      THREE.MathUtils.randFloat(0.1, 0.6),
      THREE.MathUtils.randFloat(0.1, 0.6),
      {
        x: THREE.MathUtils.randFloatSpread(3),
        y: 6,
        z: THREE.MathUtils.randFloatSpread(3),
      },
    )
  },
  rest: () => {
    for (let { body, mesh } of objects) {
      body.removeEventListener('collide', playHitSound)
      // THEE
      mesh.geometry.dispose()
      mesh.material.dispose()
      scene.remove(mesh)

      // CANNON
      world.removeBody(body)
    }
    objects.length = 0
  },
}
gui.add(parameters, 'createSphere')
gui.add(parameters, 'createCube')
gui.add(parameters, 'rest')

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
// const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20)

// const sphereMaterial = new THREE.MeshStandardMaterial({
//   metalness: 0.3,
//   roughness: 0.4,
//   envMap: environmentMapTexture,
// })
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
// sphere.position.y = 0.5
// sphere.castShadow = true
// scene.add(sphere)

const timer = new Timer()
const animation = (timestamp) => {
  requestAnimationFrame(animation)

  const elapsed = timer.getElapsed()

  world.step(1 / 60, elapsed, 3)

  // sphere.position.copy(sphereBody.position)

  for (let { mesh, body } of objects) {
    mesh.position.copy(body.position)
    mesh.quaternion.copy(body.quaternion)
  }

  timer.update(timestamp)

  controls.update()
  renderer.render(scene, camera)
}
animation()
