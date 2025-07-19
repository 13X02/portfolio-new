// src/components/HeroThreeScene.tsx
"use client"

import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo } from "react"

// A dummy object to reuse for matrix updates, avoiding object creation in the loop
const dummy = new THREE.Object3D()

// This component creates the starfield using a single InstancedMesh for performance
function Particles() {
  const count = 5000
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!)
  const { viewport, mouse } = useThree()

  // Generate particle data only once
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = (Math.random() - 0.5) * factor
      const y = (Math.random() - 0.5) * factor
      const z = (Math.random() - 0.5) * factor
      temp.push({ t, factor, speed, x, y, z })
    }
    return temp
  }, []) // Empty dependency array ensures this runs only once

  // Animate particles and react to mouse movement
  useFrame(() => {
    if (!instancedMeshRef.current) return;

    // Parallax effect for the entire group
    const targetX = mouse.x * viewport.width * 0.05
    const targetY = mouse.y * viewport.height * 0.05
    instancedMeshRef.current.rotation.y += 0.05 * (targetX - instancedMeshRef.current.rotation.y)
    instancedMeshRef.current.rotation.x += 0.05 * (targetY - instancedMeshRef.current.rotation.x)
    instancedMeshRef.current.position.z = THREE.MathUtils.lerp(instancedMeshRef.current.position.z, mouse.y * 2, 0.05)

    // Update individual particle positions for a dynamic floating effect
    particles.forEach((particle, i) => {
      let { t } = particle;
      const { speed, x, y, z } = particle; 
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      
      dummy.position.set(
        x + a,
        y + b,
        z
      );
      dummy.updateMatrix()
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    // This is crucial! It tells Three.js to update the instanced matrix.
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
    </instancedMesh>
  )
}

// The main scene component, now rendering only the particle background
export function HeroThreeScene() {
  // State and effects for dark mode have been removed as they are no longer needed.

  return (
    <Canvas
      // The camera is moved slightly forward as there is no central text object
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        // zIndex can be lowered as this is now a pure background element
        zIndex: 1, 
      }}
    >
      <ambientLight intensity={0.5} />
      {/* Lighting is simplified as it's only affecting the white particles */}
      <pointLight position={[0, 0, 5]} intensity={1.5} />
      
      {/* Render the particles */}
      <Particles />

      {/* The <NameText /> component has been removed */}
    </Canvas>
  )
}