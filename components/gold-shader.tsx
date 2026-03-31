"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Animated gold energy flow
    float wave1 = sin(uv.x * 8.0 + uTime * 0.5) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 6.0 - uTime * 0.3) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 4.0 + uTime * 0.7) * 0.5 + 0.5;
    
    float combined = wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3;
    
    // Gold color palette
    vec3 goldDark = vec3(0.6, 0.45, 0.15);
    vec3 goldBright = vec3(0.95, 0.8, 0.3);
    vec3 goldColor = mix(goldDark, goldBright, combined);
    
    // Subtle vignette
    float vignette = 1.0 - length((uv - 0.5) * 1.2);
    vignette = smoothstep(0.0, 1.0, vignette);
    
    // Final color with transparency
    float alpha = combined * 0.15 + 0.05;
    alpha *= vignette;
    
    gl_FragColor = vec4(goldColor, alpha);
  }
`

export function GoldShader() {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[10, 8]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
