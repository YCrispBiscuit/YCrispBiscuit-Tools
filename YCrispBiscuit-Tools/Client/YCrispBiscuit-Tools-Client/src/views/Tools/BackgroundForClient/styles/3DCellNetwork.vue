<template>
  <div ref="container" class="cell-network-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Node3D {
  x: number
  y: number
  z: number
  size: number
  color: string
}

interface Connection {
  from: Node3D
  to: Node3D
}

const container = ref<HTMLDivElement>()
let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let animationId: number
let nodes: Node3D[] = []
let connections: Connection[] = []
let rotationY = 0
let rotationX = 0

function initCanvas() {
  if (!container.value) return
  canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.border = 'none'
  canvas.style.outline = 'none'
  canvas.tabIndex = -1
  canvas.style.zIndex = '-1'
  container.value.appendChild(canvas)
  ctx = canvas.getContext('2d')!
}

function createStructure() {
  nodes = []
  connections = []
  
  // 创建大型3D细胞组织结构
  const gridSize = 20
  const spacing = 80
  const offset = (gridSize - 1) * spacing / 2
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const baseX = x * spacing - offset
        const baseY = y * spacing - offset
        const baseZ = z * spacing - offset
        
        // 随机化位置，模拟细胞组织的不规则性
        const randX = baseX + (Math.random() - 0.5) * spacing * 0.5
        const randY = baseY + (Math.random() - 0.5) * spacing * 0.5
        const randZ = baseZ + (Math.random() - 0.5) * spacing * 0.5
        
        const colors = ['#e0f7fa', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec', '#f1f8e9']
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        nodes.push({
          x: randX,
          y: randY,
          z: randZ,
          size: 4 + Math.random() * 2, // 随机大小
          color
        })
      }
    }
  }
  
  // 创建连接 - 连接邻近节点
  const maxDistance = spacing * 1.0
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dz = nodes[i].z - nodes[j].z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      if (distance < maxDistance) {
        connections.push({ from: nodes[i], to: nodes[j] })
      }
    }
  }
}

function rotatePoint(point: Node3D, angleY: number, angleX: number): { x: number, y: number, z: number } {
  // 绕Y轴旋转
  let x1 = point.x * Math.cos(angleY) - point.z * Math.sin(angleY)
  let z1 = point.x * Math.sin(angleY) + point.z * Math.cos(angleY)
  
  // 绕X轴旋转
  let y2 = point.y * Math.cos(angleX) - z1 * Math.sin(angleX)
  let z2 = point.y * Math.sin(angleX) + z1 * Math.cos(angleX)
  
  return { x: x1, y: y2, z: z2 }
}

function project3DTo2D(point: { x: number, y: number, z: number }): { x: number, y: number, scale: number } {
  const focalLength = 300
  const scale = focalLength / (focalLength + point.z)
  return {
    x: point.x * scale + canvas.width / 2,
    y: point.y * scale + canvas.height / 2,
    scale
  }
}

function drawNode(node: Node3D) {
  const rotated = rotatePoint(node, rotationY, rotationX)
  const projected = project3DTo2D(rotated)
  
  if (projected.scale > 0) {
    ctx.fillStyle = node.color
    ctx.fillRect(
      projected.x - node.size * projected.scale / 2,
      projected.y - node.size * projected.scale / 2,
      node.size * projected.scale,
      node.size * projected.scale
    )
  }
}

function drawConnection(conn: Connection) {
  const fromRotated = rotatePoint(conn.from, rotationY, rotationX)
  const toRotated = rotatePoint(conn.to, rotationY, rotationX)
  
  const fromProj = project3DTo2D(fromRotated)
  const toProj = project3DTo2D(toRotated)
  
  if (fromProj.scale > 0 && toProj.scale > 0) {
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(fromProj.x, fromProj.y)
    ctx.lineTo(toProj.x, toProj.y)
    ctx.stroke()
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制连接
  connections.forEach(conn => drawConnection(conn))
  
  // 绘制节点
  nodes.forEach(node => drawNode(node))
}

function animate() {
  rotationY += 0.005
  rotationX += 0.002
  draw()
  animationId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  // 重新创建结构
  createStructure()
}

onMounted(() => {
  initCanvas()
  createStructure()
  animate()
  
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.cell-network-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  border: none;
}
</style>
