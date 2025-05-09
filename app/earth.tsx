import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'

interface Coordinates {
  lat: number
  lon: number
}

interface EarthProps {
  radius?: number
  onClickLatLon: (coords: Coordinates) => void
}

export function Earth({ radius = 1, onClickLatLon }: EarthProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const texture = useLoader(TextureLoader, '/earth.png')

  const [isDragging, setIsDragging] = useState(false)
  const [prevX, setPrevX] = useState<number | null>(null)
  const velocity = useRef(0)

  // Momentum rotation
  useFrame(() => {
    if (!isDragging && mesh.current) {
      mesh.current.rotation.y += velocity.current
      velocity.current *= 0.95
      if (Math.abs(velocity.current) < 0.0001) velocity.current = 0
    }
  })

  const handleClick = (e: any) => {
    if (!mesh.current) return;
  
    const worldPoint = e.point.clone()
    const inverseMatrix = mesh.current.matrixWorld.clone().invert()
    const localPoint = worldPoint.applyMatrix4(inverseMatrix)
  
    const { x, y, z } = localPoint
    const r = Math.sqrt(x * x + y * y + z * z)
  
    const lat = Math.asin(y / r) * (180 / Math.PI)
    let lon = Math.atan2(z, x) * (180 / Math.PI)
  
    lon = -(lon - 1.4) // invert and apply offset
  
    onClickLatLon({ lat, lon })
  }
  
  
  

  // Drag rotation logic
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && prevX !== null && mesh.current) {
        const deltaX = e.clientX - prevX
        mesh.current.rotation.y += deltaX * 0.002
        velocity.current = deltaX * 0.002
        setPrevX(e.clientX)
      }
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      setPrevX(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, prevX])

  return (
    <mesh
      ref={mesh}
      onPointerDown={(e) => {
        setIsDragging(true)
        setPrevX(e.clientX)
        velocity.current = 0
        handleClick(e)
      }}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
