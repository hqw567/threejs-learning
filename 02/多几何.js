import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// camera.position.set(-2.1, -2, 6)
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
// controls.dampingFactor = 0.5

const fontLoader = new FontLoader()
const font = fontLoader.load(
  'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json',
  (font) => {
    const geometry = new TextGeometry('Hello three.js!', {
      font: font,
      size: 0.5,
      height: 0.2,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    })
    const material = new THREE.MeshNormalMaterial({
      // color: 0x00ff00,
    })
    // material.wireframe = true
    geometry.center()
    const text = new THREE.Mesh(geometry, material)
    scene.add(text)

    for (let index = 0; index < 100; index++) {
      const torusGeometry = new THREE.TorusGeometry(0.2, 0.1, 18, 43)
      const torus = new THREE.Mesh(torusGeometry, material)
      torus.position.x = (Math.random() - 0.5) * 10
      torus.position.y = (Math.random() - 0.5) * 10
      torus.position.z = (Math.random() - 0.5) * 10
      torus.rotation.x = Math.random() * Math.PI
      torus.rotation.y = Math.random() * Math.PI
      const scale = Math.random()
      torus.scale.set(scale, scale, scale)
      scene.add(torus)
    }
    for (let index = 0; index < 100; index++) {
      const boxGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
      const box = new THREE.Mesh(boxGeometry, material)
      box.position.x = (Math.random() - 0.5) * 10
      box.position.y = (Math.random() - 0.5) * 10
      box.position.z = (Math.random() - 0.5) * 10
      box.rotation.x = Math.random() * Math.PI
      box.rotation.y = Math.random() * Math.PI
      const scale = Math.random()
      box.scale.set(scale, scale, scale)
      scene.add(box)
    }
  },
)

// const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)
// 定义旋转角度
const rotationSpeed = 0.00005
function animate() {
  requestAnimationFrame(animate)
  // 创建旋转矩阵
  const t = Date.now() * rotationSpeed // 获取时间作为旋转角度
  const rotationMatrix = new THREE.Matrix4().makeRotationY(t)

  // 计算相机新的位置向量
  const cameraRelativePosition = new THREE.Vector3(0, 0, 5) // 相机相对于原点的位置向量
  cameraRelativePosition.applyMatrix4(rotationMatrix) // 应用旋转变换

  // 设置相机位置
  camera.position.copy(cameraRelativePosition)

  // 设置相机朝向原点
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', onWindowResize)

function onWindowResize() {
  // 更新相机
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // 更新渲染器大小
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const gui = new GUI()

const eventObj = {
  toggleFullscreen: function () {
    const isFullscreen = document.fullscreenElement
    const action = isFullscreen ? document.exitFullscreen : document.documentElement.requestFullscreen

    action.call(isFullscreen ? document : document.documentElement).then(() => {
      fullscreenControl.name(isFullscreen ? '全屏' : '退出全屏')
    })
  },
}

const fullscreenControl = gui.add(eventObj, 'toggleFullscreen').name('全屏')

document.addEventListener('fullscreenchange', () => {
  fullscreenControl.name(document.fullscreenElement ? '退出全屏' : '全屏')
})
