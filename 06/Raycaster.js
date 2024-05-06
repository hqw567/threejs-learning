import './style.css'
import * as THREE from 'three'
import { Timer } from 'three/addons/misc/Timer.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let scene,
  camera,
  renderer,
  gui,
  controls,
  raycaster,
  currentIntersect,
  intersectsTarget,
  model,
  ambientLight,
  modelRaycaster
const timer = new Timer()
const config = {
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  fov: 75,
  near: 0.1,
  far: 1000,
  mousemoveX: 0,
  mousemoveY: 0,
}
const objects = {}

init()

function init() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(config.fov, config.screenWidth / config.screenHeight, config.near, config.far)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(config.screenWidth, config.screenHeight)
  document.body.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  raycaster = new THREE.Raycaster()

  gui = new GUI()

  camera.position.z = 4

  ambientLight = new THREE.AmbientLight('#ffffff', 3) // 柔和的白光
  scene.add(ambientLight)

  objects.sphere1 = createSphere()
  objects.sphere1.position.x = -2
  scene.add(objects.sphere1)

  objects.sphere2 = createSphere()
  scene.add(objects.sphere2)

  objects.sphere3 = createSphere()
  objects.sphere3.position.x = 2
  scene.add(objects.sphere3)

  modelRaycaster = new THREE.Raycaster()
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
    model = gltf.scene
    scene.add(model)
    model.position.y = -1.2
  })

  animate()
}

function createSphere() {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16)
  const material = new THREE.MeshBasicMaterial({ color: 'red' })
  const sphere = new THREE.Mesh(geometry, material)
  return sphere
}

window.addEventListener('mousemove', (e) => {
  config.mousemoveX = (e.clientX / config.screenWidth) * 2 - 1
  config.mousemoveY = -((e.clientY / config.screenHeight) * 2 - 1)
})

window.addEventListener('click', () => {
  for (const o of intersectsTarget) {
    o.material.color.set('red')
  }
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case objects.sphere1:
        objects.sphere1.material.color.set('yellow')
        break
      case objects.sphere2:
        objects.sphere2.material.color.set('pink')
        break
      case objects.sphere3:
        objects.sphere3.material.color.set('white')
        break
      default:
        break
    }
  }
})

function animate() {
  requestAnimationFrame(animate)

  timer.update()
  const delta = timer.getDelta()
  const elapsed = timer.getElapsed()

  objects.sphere1.position.y = Math.sin(elapsed * 0.3) * 1.6
  objects.sphere2.position.y = Math.sin(elapsed * 0.6) * 1.6
  objects.sphere3.position.y = Math.sin(elapsed * 0.9) * 1.6

  // const rayOrigin = new THREE.Vector3(-3, 0, 0)
  // const rayDirection = new THREE.Vector3(1, 0, 0)
  // rayDirection.normalize()
  // raycaster.set(rayOrigin, rayDirection)

  raycaster.setFromCamera(new THREE.Vector2(config.mousemoveX, config.mousemoveY), camera)

  if (model) {
    const modelIntersect = raycaster.intersectObject(model)
    if (modelIntersect.length) {
      model.scale.set(1.2, 1.2, 1.2)
    } else {
      model.scale.set(1, 1, 1)
    }
  }

  intersectsTarget = [objects.sphere1, objects.sphere2, objects.sphere3]
  const intersects = raycaster.intersectObjects(intersectsTarget)

  // for (const o of intersectsTarget) {
  //   o.material.color.set('red')
  // }
  // for (const intersect of intersects) {
  //   intersect.object.material.color.set('blue')
  // }
  if (intersects.length > 0) {
    if (currentIntersect === null) {
      console.log('鼠标进入')
    }
    currentIntersect = intersects[0]
  } else {
    if (currentIntersect) {
      console.log('鼠标离开')
    }
    currentIntersect = null
  }

  controls.update()
  renderer.render(scene, camera)
}
