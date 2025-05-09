import { Text } from '@react-three/drei'
import * as THREE from 'three'

function Longitudes({ radius = 1.01 }) {
  const lines = []

  for (let lon = -180; lon <= 180; lon += 20) {
    const points = []
    const theta = THREE.MathUtils.degToRad(lon)

    // Create longitude line from -90 to 90
    for (let lat = -90; lat <= 90; lat += 1) {
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const x = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.cos(theta)
      points.push(new THREE.Vector3(x, y, z))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: '#888' })

    lines.push(<line key={`lon-line-${lon}`} geometry={geometry} material={material} />)

    // Label at equator
    const x = radius * 1.1 * Math.sin(theta)
    const z = radius * 1.1 * Math.cos(theta)

    lines.push(
      <Text
        key={`lon-label-${lon}`}
        position={[x, 0, z]}
        fontSize={0.03}
        color="white"
        rotation={[0, theta, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {lon >= 0 ? `${lon}°E` : `${-lon}°W`}
      </Text>
    )
  }

  return <>{lines}</>
}

export default Longitudes