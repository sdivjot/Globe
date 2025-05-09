import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Earth } from './earth'
import * as THREE from 'three'
import SpaceBG from './SpaceBG'
import { useThree } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'

function EarthRotation({ onClickLatLon }) {
  const groupRef = useRef()
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const velocity = useRef(0)

  useFrame(() => {
    if (!isDragging.current) {
      groupRef.current.rotation.y += velocity.current
      // Damping
      velocity.current *= 0.9
    }
  })

  const handlePointerDown = (e) => {
    isDragging.current = true
    lastX.current = e.clientX
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    const deltaX = e.clientX - lastX.current
    lastX.current = e.clientX
    const deltaRotation = deltaX * 0.000005
    groupRef.current.rotation.y += deltaRotation
    velocity.current = deltaRotation // store velocity for inertial rotation
  }

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <Earth onClickLatLon={onClickLatLon} />
    </group>
  )
}
function ZoomControls() {
  const { camera, gl } = useThree()
  const minZoom = 2
  const maxZoom = 10

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const direction = camera.getWorldDirection(new THREE.Vector3())
    const newPos = camera.position.clone().addScaledVector(direction, e.deltaY * -0.001)

    const distance = newPos.length()
    if (distance > minZoom && distance < maxZoom) {
      camera.position.copy(newPos)
    }
  }

  React.useEffect(() => {
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => gl.domElement.removeEventListener('wheel', handleWheel)
  }, [])

  return null
}
function App() {
  const [coords, setCoords] = useState(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
        <ZoomControls />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 2, 3]} // fixed "sun" position
          intensity={10}
        />
        {/* <SpaceBG /> */}
        {/* <OrbitControls enableZoom /> */}
        <EarthRotation onClickLatLon={setCoords} />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20, left: 20,
        background: 'rgba(255,255,255,0.8)',
        padding: '8px', borderRadius: '4px'
      }}>
        <div>Latitude: {coords && coords.lat ? coords.lat.toFixed(4) : 'N/A'}</div>
        <div>Longitude: {coords && coords.lon ? coords.lon.toFixed(4) : 'N/A'}</div>

      </div>
    </div>
  )
}

export default App
