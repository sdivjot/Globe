import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Earth } from './earth'
import * as THREE from 'three'
import SpaceBG from './SpaceBG'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

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
async function handleCall() {
  await fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: coords.lat,
      lon: coords.lon,
      question: "What's special about this location?"
    })
  })
    .then(res => res.json())
    .then(data => console.log(data.response));

}
function App() {
  const [coords, setCoords] = useState(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  async function handleCall() {
    if (!coords || !question) {
      alert("Please click a location and enter a question.")
      return
    }

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: coords.lat,
          lon: coords.lon,
          question: question
        })
      })

      const data = await res.json()
      setAnswer(data.response || data.error || "No response")
    } catch (err) {
      setAnswer("Error: " + err.message)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
        <ZoomControls />
        <ambientLight intensity={5} />
        <OrbitControls enableZoom />
        <EarthRotation onClickLatLon={setCoords} />
      </Canvas>

      <div style={{
        position: 'absolute',
        top: 20, left: 20,
        padding: '12px', borderRadius: '8px', width: 300
      }}>
        <div className='px-2'>Latitude: {coords?.lat?.toFixed(4) || 'N/A'}</div>
        <div className='px-2'>Longitude: {coords?.lon?.toFixed(4) || 'N/A'}</div>

        <textarea
          placeholder="Ask a question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          style={{ width: '100%', marginTop: 8 }}
          className='border-2 border-white rounded-2xl p-2'
        />
        <button className='bg-white p-2 rounded-2xl text-black' onClick={handleCall} style={{ marginTop: 8 }}>Ask</button>

        {answer && (
          <div style={{
            marginTop: 10,
            padding: '6px',
            borderRadius: 4,
            whiteSpace: 'pre-wrap'
          }}>
            {answer}
          </div>
        )}
      </div>
    </div>
  )
}

export default App