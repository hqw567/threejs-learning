import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { DragControls } from 'three/addons/controls/DragControls.js'
// 配置参数
const config = {
  rendererColor: '#aaaaaa',
  text: 'Hello three.js!',
  fontUrl: 'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json',
  cameraPosition: new THREE.Vector3(0, 0, 3),
  rotationSpeed: 0.00008,
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(2, 4.5, 5)
camera.lookAt(0, 0, 0)
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0xaaaaaa, 0.1)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(config.rendererColor)
renderer.shadowMap.enabled = true // 启用阴影映射
document.body.appendChild(renderer.domElement)

//Lights
// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

// 添加点光源
const pointLight = new THREE.PointLight('red', 0.4)
pointLight.position.set(0, 1.6, 0)
// scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
// scene.add(pointLightHelper)

// 添加方向光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(3, 3, 3)
// scene.add(directionalLight)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add(directionalLightHelper)

// 控制器
const controls = new OrbitControls(camera, renderer.domElement)

// 辅助坐标轴
const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// GUI 控制
const gui = new GUI()
gui
  .addColor(config, 'rendererColor')
  .name('Renderer Color')
  .onChange((newValue) => renderer.setClearColor(newValue))

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#aaaaaa',
    side: THREE.DoubleSide,
  }),
)
floor.rotation.x = -Math.PI / 2

floor.receiveShadow = true // 让地面能接收阴影
scene.add(floor)
const house = new THREE.Group()

scene.add(house)

// 围墙材料
const fenceMaterial = new THREE.MeshStandardMaterial({ color: '#000000' })

const fenceConfig = {
  height: 0.5,
  width: 4,
  depth: 0.03,
}

// 创建围墙的左侧部分
const fenceLeft = new THREE.Mesh(
  new THREE.BoxGeometry(fenceConfig.width, fenceConfig.height, fenceConfig.depth),
  fenceMaterial,
)
fenceLeft.position.x = -2
fenceLeft.rotation.y = -Math.PI / 2
fenceLeft.position.y = fenceConfig.height / 2
house.add(fenceLeft)
fenceLeft.castShadow = true
fenceLeft.receiveShadow = true

// 创建围墙的右侧部分
const fenceRight = new THREE.Mesh(
  new THREE.BoxGeometry(fenceConfig.width, fenceConfig.height, fenceConfig.depth),
  fenceMaterial,
)
fenceRight.position.x = 2
fenceRight.rotation.y = -Math.PI / 2
fenceRight.position.y = fenceConfig.height / 2
house.add(fenceRight)
fenceRight.castShadow = true
fenceRight.receiveShadow = true

// 创建围墙的后部分
const fenceBack = new THREE.Mesh(
  new THREE.BoxGeometry(fenceConfig.width, fenceConfig.height, fenceConfig.depth),
  fenceMaterial,
)
fenceBack.position.z = -2
fenceBack.position.y = fenceConfig.height / 2
house.add(fenceBack)
fenceBack.castShadow = true
fenceBack.receiveShadow = true

const fenceGap = 0.6
// 创建正围墙的左侧部分
const fenceLeftSide = new THREE.Mesh(
  new THREE.BoxGeometry(fenceConfig.width / 2 - fenceGap, fenceConfig.height, fenceConfig.depth),
  fenceMaterial,
)
fenceLeftSide.position.z = 2
fenceLeftSide.position.x = -fenceConfig.width / 4 - fenceGap / 2
fenceLeftSide.position.y = fenceConfig.height / 2
house.add(fenceLeftSide)
fenceLeftSide.castShadow = true
fenceLeftSide.receiveShadow = true

// 创建正围墙的右侧部分
const fenceRightSide = new THREE.Mesh(
  new THREE.BoxGeometry(fenceConfig.width / 2 - fenceGap, fenceConfig.height, fenceConfig.depth),
  fenceMaterial,
)
fenceRightSide.position.z = 2
fenceRightSide.position.x = fenceConfig.width / 4 + fenceGap / 2
fenceRightSide.position.y = fenceConfig.height / 2
house.add(fenceRightSide)
fenceRightSide.castShadow = true
fenceRightSide.receiveShadow = true

const wallsConfig = {
  width: 1,
  height: 1,
  depth: 1,
}

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(wallsConfig.width, wallsConfig.height, wallsConfig.depth),
  new THREE.MeshStandardMaterial({
    color: '#d8baba',
  }),
)
walls.position.y = wallsConfig.height / 2
house.add(walls)

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 0.8),
  new THREE.MeshStandardMaterial({
    color: '#000000',
  }),
)

door.position.y = -0.1
door.position.z = wallsConfig.width / 2 + 0.01
walls.add(door)
walls.castShadow = true
walls.receiveShadow = true

const bulbColumn = new THREE.Mesh(
  new THREE.CylinderGeometry(0.01, 0.01, 0.02, 5),
  new THREE.MeshBasicMaterial({
    color: '#000000',
  }),
)
door.add(bulbColumn)
bulbColumn.position.set(0, 0.5, 0)
bulbColumn.rotation.x = Math.PI / 2

const bulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.02, 64, 32),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }),
)
bulbColumn.add(bulb)
bulb.position.y = 0.02

const doorPointLight = new THREE.PointLight(0xffffff, 0.6, 2)
doorPointLight.position.set(0, 0.3, 0)
doorPointLight.castShadow = true
bulb.add(doorPointLight)
doorPointLight.shadow.mapSize.width = 512 // 阴影贴图宽度
doorPointLight.shadow.mapSize.height = 512 // 阴影贴图高度
doorPointLight.shadow.camera.near = 0.5
doorPointLight.shadow.camera.far = 50

const roofConfig = {
  radius: Math.sqrt(2) / 2 + 0.1, // 调整半径以覆盖1x1单位的房体
  height: 0.2,
  radialSegments: 4,
}
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(roofConfig.radius, roofConfig.height, roofConfig.radialSegments),
  new THREE.MeshStandardMaterial({
    color: 'red',
  }),
)

roof.position.y = roofConfig.height / 2 + 0.5
roof.rotation.y = Math.PI / 4
walls.add(roof)

const lamp1 = createStreetLamp() // 创建路灯
scene.add(lamp1) // 添加到场景
lamp1.position.set(1, 0, 2.5)

const lamp2 = createStreetLamp() // 创建路灯
scene.add(lamp2) // 添加到场景
lamp2.position.set(-1, 0, 2.5)

const dog1 = createDog()
dog1.position.set(1, 0.18, 1)
scene.add(dog1)
dog1.traverse(function (node) {
  if (node.isMesh) {
    node.castShadow = true
    node.receiveShadow = true
  }
})

const dog2 = createDog()
dog2.position.set(0, 0.18, 4)
dog2.rotation.y = -Math.PI / 2
scene.add(dog2)
dog2.traverse(function (node) {
  if (node.isMesh) {
    node.castShadow = true
    node.receiveShadow = true
  }
})

// 设置起始位置和目标位置
const startPosition = new THREE.Vector3(0, 0.18, 4)
const targetPosition = new THREE.Vector3(0, 0.18, 0.8)
dog2.position.copy(startPosition)

// 设置移动速度
const moveSpeed = 0.01

const radius = 1.5 // 半径为1.5
const angularSpeed = 0.005 // 角速度，控制转动的速度
let angle = 0 // 初始角度
const jumpHeight = 0.1 // 跳跃高度

let rotateDirection = 1 // 1 表示向右旋转, -1 表示向左旋转
const maxRotationY = 3 // 最大旋转角度

let clock = new THREE.Clock()
// 动画循环
function animate() {
  requestAnimationFrame(animate)

  const time = clock.getElapsedTime()

  // 计算跳跃
  dog1.position.y = Math.abs(Math.sin(time * 2)) * jumpHeight + 0.18

  // 更新角度
  angle -= angularSpeed
  dog1.position.x = Math.cos(angle) * radius
  dog1.position.z = Math.sin(angle) * radius

  // 狗始终面向圆心
  dog1.lookAt(new THREE.Vector3(0, dog1.position.y, 0))

  // 移动第二只狗
  dog2.position.y = Math.abs(Math.sin(time * 2)) * jumpHeight + 0.18
  if (dog2.position.distanceTo(targetPosition) > moveSpeed) {
    const moveDirection = targetPosition.clone().sub(dog2.position).normalize()
    dog2.position.add(moveDirection.multiplyScalar(moveSpeed))
  } else {
    dog2.position.copy(targetPosition) // 确保狗精确停在目标位置

    // 更新 dog2 的旋转
    if (rotateDirection === 1) {
      if (dog2.rotation.y < maxRotationY) {
        dog2.rotation.y += 0.05
      } else {
        rotateDirection = -1 // 达到最大旋转，改变方向
      }
    } else {
      if (dog2.rotation.y > -maxRotationY) {
        dog2.rotation.y -= 0.05
      } else {
        rotateDirection = 1 // 达到最小旋转，改变方向
      }
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

animate()

function createDog() {
  const material = new THREE.MeshBasicMaterial({ color: 0x8b4513 })
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }) // 黑色材质用于眼睛
  const earMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 }) // 暗一些的颜色用于耳朵

  // 创建狗的头部
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), material)
  head.position.set(-0.1, 0.05, 0)
  head.rotation.y = -Math.PI / 2

  // 创建眼睛
  const eyeGeometry = new THREE.SphereGeometry(0.008, 8, 8)
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-0.02, 0.01, 0.055)
  rightEye.position.set(0.02, 0.01, 0.055)
  head.add(leftEye)
  head.add(rightEye)

  // 创建耳朵
  const earGeometry = new THREE.BoxGeometry(0.02, 0.04, 0.01)
  const leftEar = new THREE.Mesh(earGeometry, earMaterial)
  const rightEar = new THREE.Mesh(earGeometry, earMaterial)
  leftEar.position.set(-0.04, 0.08, 0)
  rightEar.position.set(0.04, 0.08, 0)
  leftEar.rotation.z = 0.2 // 稍微旋转耳朵以增加自然感
  rightEar.rotation.z = -0.2
  head.add(leftEar)
  head.add(rightEar)

  // 创建狗的身体
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), material)
  body.position.set(0, -0.05, 0)

  // 创建狗的腿
  const legGeometry = new THREE.BoxGeometry(0.03, 0.05, 0.03)
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(legGeometry, material)
    leg.position.set(i < 2 ? -0.08 : 0.08, -0.1, i % 2 ? -0.03 : 0.03)
    body.add(leg)
  }

  // 创建狗的尾巴
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), material)
  tail.position.set(0.1, 0, 0)

  // 组装狗
  const dog = new THREE.Group()
  dog.add(head)
  dog.add(body)
  dog.add(tail)

  return dog
}

function createStreetLamp() {
  const streetLamp = new THREE.Group() // 创建一个组来包含所有路灯的部分

  // 创建路灯底座
  const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32)
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = 0.1
  streetLamp.add(base) // 添加到组中

  // 创建路灯柱
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32)
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })
  const pole = new THREE.Mesh(poleGeometry, poleMaterial)
  pole.position.y = 1 / 2 + 0.2 // 底部加上底座的高度
  streetLamp.add(pole) // 添加到组中

  // 创建灯头
  const lampGeometry = new THREE.SphereGeometry(0.1, 32, 32)
  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, emissive: 0xffff00 })
  const lamp = new THREE.Mesh(lampGeometry, lampMaterial)
  lamp.position.y = 1 + 0.2
  streetLamp.add(lamp) // 添加到组中

  // 添加点光源
  const light = new THREE.PointLight(0xffff00, 1, 10, 2)
  light.position.set(0, 1 + 0.2, 0) // 设置光源位置在灯头处
  streetLamp.add(light) // 添加到组中
  // 返回整个路灯对象
  return streetLamp
}
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min
}
