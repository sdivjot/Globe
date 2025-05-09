import { useThree, useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

function ZoomControls() {
  const { camera, gl } = useThree()
  const minFov = 15
  const maxFov = 75

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      camera.fov += e.deltaY * 0.05
      camera.fov = Math.max(minFov, Math.min(maxFov, camera.fov))
      camera.updateProjectionMatrix()
    }

    // Attach to canvas' DOM element
    gl.domElement.addEventListener('wheel', handleWheel)

    return () => {
      gl.domElement.removeEventListener('wheel', handleWheel)
    }
  }, [camera, gl])

  return null
}

export default ZoomControls
