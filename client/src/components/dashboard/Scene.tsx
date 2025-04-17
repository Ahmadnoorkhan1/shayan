
import { Suspense, useEffect, useState, useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, ContactShadows, Float, Sparkles } from "@react-three/drei"

// Interactive cursor component
function CursorIndicator() {
  const [hovered, setHovered] = useState(false)
  const { gl } = useThree()

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto"
    return () => {
      document.body.style.cursor = "auto"
    }
  }, [hovered])

  return (
    <mesh
      visible={false}
      position={[0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

interface SceneProps {
  modelPath?: string
}

// Enhanced Scene component with TypeScript fixes
function Scene({ modelPath = "/models/futuristic_flying_animated_robot_-_low_poly/scene.gltf" }: SceneProps) {
  // Track cursor position for interactive effects
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  // Handle mouse movement to track cursor position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    // Normalize coordinates between -1 and 1
    const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1
    const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
    setCursorPosition({ x, y })
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing" onMouseMove={handleMouseMove}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [2, 1.5, 3.5], fov: 100, near: 1, far: 80 }} // Closer camera position
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 2]}
      >
        {/* Improved lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.2} color="#5ca0ff" />
        <pointLight position={[0, 2, 0]} intensity={0.2} color="#00a8ff" />

        {/* Create professional environment */}
        <Environment preset="city" />

        <CursorIndicator />

        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          {/* Pass cursor position to the model */}
          <EnhancedModel modelPath={modelPath} cursorPosition={cursorPosition} />

          {/* Add subtle shadow */}
          <ContactShadows opacity={0.4} scale={10} blur={1} far={5} resolution={256} color="#000000" />
        </Suspense>

        {/* Updated controls with zoom enabled and auto-rotate disabled */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={false}
          autoRotate={false}
          minDistance={3} // Closer min distance
          maxDistance={4}
          zoomSpeed={0.7}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}

interface ModelProps {
  modelPath: string;
  cursorPosition: { x: number; y: number };
}

// Fixed EnhancedModel component with proper TypeScript types
function EnhancedModel({ modelPath, cursorPosition }: ModelProps) {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [activeAnimation, setActiveAnimation] = useState<number | null>(null)
  const modelRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Group>(null)
  
  // Type for GLTF result including animations
  interface GLTFResult extends THREE.Object3D {
    animations: THREE.AnimationClip[];
    scene: THREE.Group;
  }
  
  const { scene, animations = [] } = useGLTF(modelPath) as unknown as GLTFResult
  const [glowIntensity, setGlowIntensity] = useState(0.5)

  // Animation mixer for model animations
  const mixer = useRef<THREE.AnimationMixer | null>(null)
  const clock = useRef(new THREE.Clock())

  useEffect(() => {
    if (scene) {
      setModelLoaded(true)

      // Set up animation mixer if there are animations
      if (animations && animations.length > 0) {
        mixer.current = new THREE.AnimationMixer(scene)
        // Play the first animation by default
        const action = mixer.current.clipAction(animations[0])
        action.play()
        setActiveAnimation(0)
      }
    }

    return () => {
      // Clean up animation mixer
      if (mixer.current) {
        mixer.current.stopAllAction()
      }
    }
  }, [scene, animations])

  // Handle click on the model
  const handleModelClick = () => {
    setClicked(!clicked)

    // If we have animations, cycle through them on click
    if (animations && animations.length > 0 && mixer.current) {
      // Stop current animation
      mixer.current.stopAllAction()

      // Cycle to next animation
      const nextAnimation = activeAnimation !== null ? (activeAnimation + 1) % animations.length : 0
      const action = mixer.current.clipAction(animations[nextAnimation])
      action.play()
      setActiveAnimation(nextAnimation)
    }
  }

  // Add interactive animations based on cursor position and state
  // useFrame((state) => {
  //   if (modelRef.current) {
  //     // Update animation mixer
  //     if (mixer.current) {
  //       const delta = clock.current.getDelta()
  //       mixer.current.update(delta)
  //     }

  //     // Base floating animation
  //     modelRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05

     

  //     // Pulse glow effect
  //     if (glowRef.current) {
  //       // Pulse effect based on time
  //       const pulseIntensity = hovered
  //         ? 0.7 + Math.sin(state.clock.elapsedTime * 3) * 0.3
  //         : 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1

  //       setGlowIntensity(pulseIntensity)

  //       // Scale glow with hover/click state
  //       const targetScale = hovered ? 3.2 : clicked ? 3.5 : 3
  //       glowRef.current.scale.x += (targetScale - glowRef.current.scale.x) * 0.1
  //       glowRef.current.scale.y += (targetScale - glowRef.current.scale.y) * 0.1
  //       glowRef.current.scale.z += (targetScale - glowRef.current.scale.z) * 0.1
  //     }
  //   }
  // })

  useFrame((state) => {
    if (modelRef.current) {
      const delta = clock.current.getDelta()
      if (mixer.current) mixer.current.update(delta)
  
      // Floating animation
      modelRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  
      // Rotate based on cursor position
      const targetRotationX = cursorPosition.y * 0.3 // max 0.3 radians up/down
      const targetRotationY = cursorPosition.x * 0.5 // max 0.5 radians left/right
  
      modelRef.current.rotation.x += (targetRotationX - modelRef.current.rotation.x) * 0.1
      modelRef.current.rotation.y += (targetRotationY - modelRef.current.rotation.y) * 0.1
  
      // Optional: Smooth follow movement
      const targetPosX = cursorPosition.x * 0.5
      const targetPosZ = cursorPosition.y * 0.5
      modelRef.current.position.x += (targetPosX - modelRef.current.position.x) * 0.05
      modelRef.current.position.z += (targetPosZ - modelRef.current.position.z) * 0.05
  
      // Glow logic
      if (glowRef.current) {
        const pulseIntensity = hovered
          ? 0.7 + Math.sin(state.clock.elapsedTime * 3) * 0.3
          : 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1
  
        setGlowIntensity(pulseIntensity)
  
        const targetScale = hovered ? 3.2 : clicked ? 3.5 : 3
        glowRef.current.scale.x += (targetScale - glowRef.current.scale.x) * 0.1
        glowRef.current.scale.y += (targetScale - glowRef.current.scale.y) * 0.1
        glowRef.current.scale.z += (targetScale - glowRef.current.scale.z) * 0.1
      }
    }
  })
  

  return modelLoaded ? (
    <Float speed={clicked ? 3 : 2} rotationIntensity={clicked ? 0.4 : 0.2} floatIntensity={clicked ? 0.4 : 0.2}>
      <group
        ref={modelRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleModelClick}
      >
        <primitive
          object={scene}
          scale={5} // Slightly larger scale
          position={[1, -2, 0]}
          // rotation={[0, Math.PI / 4, 0]}
        />

        {/* Dynamic glow effect */}
        <group ref={glowRef}>
          <Sparkles
            count={clicked ? 40 : hovered ? 30 : 15}
            scale={[3, 3, 3]}
            size={clicked ? 1.5 : hovered ? 1.2 : 0.8}
            speed={clicked ? 0.6 : hovered ? 0.4 : 0.2}
            color={clicked ? "#00ffff" : "#00a8ff"}
            opacity={glowIntensity}
          />
        </group>

        {/* Add interactive pulse effect when clicked */}
        {clicked && (
          <mesh visible={false}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
          </mesh>
        )}
      </group>
    </Float>
  ) : null
}

export default Scene