import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

// 配置参数
const config = {
  rendererColor: '#e70078',
  text: 'Hello three.js!',
  fontUrl: 'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json',
  cameraPosition: new THREE.Vector3(0, 0, 3),
  rotationSpeed: 0.00008,
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(config.rendererColor)
document.body.appendChild(renderer.domElement)

// GUI 控制
const gui = new GUI()
gui
  .addColor(config, 'rendererColor')
  .name('Renderer Color')
  .onChange((newValue) => renderer.setClearColor(newValue))

// 加载字体并创建文本
function createMultipleObjects(count, creatorFunc, material, exclusionZone) {
  for (let i = 0; i < count; i++) {
    const object = creatorFunc(material)
    let position = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)

    // 检查位置是否在排除区域内，如果是，则重新生成位置
    while (isWithinExclusionZone(position, exclusionZone)) {
      position = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
    }

    object.position.copy(position)
    object.rotation.x = Math.random() * Math.PI
    object.rotation.y = Math.random() * Math.PI
    scene.add(object)
  }
}

// 检查位置是否在指定的排除区域内
function isWithinExclusionZone(position, zone) {
  return (
    position.x > zone.min.x &&
    position.x < zone.max.x &&
    position.y > zone.min.y &&
    position.y < zone.max.y &&
    position.z > zone.min.z &&
    position.z < zone.max.z
  )
}

// 在加载文本后，定义排除区域并创建随机对象
function loadFontAndCreateText() {
  const loader = new FontLoader()
  loader.load(config.fontUrl, (font) => {
    const geometry = new TextGeometry(config.text, {
      font: font,
      size: 0.5,
      height: 0.2,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
    })

    const material = new THREE.MeshNormalMaterial()
    const textMesh = new THREE.Mesh(geometry, material)
    textMesh.geometry.center()
    scene.add(textMesh)

    // 定义文本周围的排除区域
    const exclusionZone = {
      min: new THREE.Vector3(-1.5, -1.5, -1),
      max: new THREE.Vector3(1.5, 1.5, 1),
    }

    createRandomObjects(material, exclusionZone)
  })
}

function createRandomObjects(material, exclusionZone) {
  createMultipleObjects(100, createTorus, material, exclusionZone)
  createMultipleObjects(100, createBox, material, exclusionZone)
}
function createTorus(material) {
  const geometry = new THREE.TorusGeometry(0.2, 0.1, 18, 43)
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

function createBox(material) {
  const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
  const mesh = new THREE.Mesh(geometry, material)

  return mesh
}

// 动画循环
function animate() {
  requestAnimationFrame(animate)
  rotateCamera()
  renderer.render(scene, camera)
}

function rotateCamera() {
  const rotationMatrix = new THREE.Matrix4().makeRotationY(Date.now() * config.rotationSpeed)
  const cameraPosition = config.cameraPosition.clone().applyMatrix4(rotationMatrix)
  camera.position.copy(cameraPosition)
  camera.lookAt(scene.position)
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

loadFontAndCreateText()
animate()
