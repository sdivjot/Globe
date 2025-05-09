import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function SpaceBG() {
  const texture = useLoader(THREE.TextureLoader, '/space.jpg')

  return (
    <mesh scale={[-8, 8, 8]}> {/* Further away for depth */}
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        // color={new THREE.Color(0x111111)} // darken the texture
      />
    </mesh>
  )
}
