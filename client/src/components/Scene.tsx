import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'

// This component will be used inside the Canvas
function Model() {
  const groupRef = useRef()
  const { nodes, materials } = useGLTF('/models/scene.gltf')
  
  return (
    <group ref={groupRef} dispose={null}>
      <mesh castShadow receiveShadow  material={materials['Material.001']} />
      <mesh castShadow receiveShadow  material={materials['Material.002']} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/scene.gltf')

// Main Scene component that includes the Canvas
export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ height: '100vh' }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}