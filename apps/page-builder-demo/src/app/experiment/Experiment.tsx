import * as THREE from 'three'
import React, {FunctionComponent, Suspense, useEffect, useRef, useState} from 'react'
import {Canvas, useFrame} from '@react-three/fiber'
import {Html, useCubeTexture, MeshWobbleMaterial, TorusKnot} from '@react-three/drei'

function MainObject({percentage, material}: {percentage: number; material: any}) {
  const main = useRef<THREE.Mesh>(null)
  const deg = 360 * percentage
  const rads = (deg * Math.PI) / 180
  return (
    <TorusKnot
      args={[1, 0.3, 128, 16]}
      ref={main}
      material={material}
      position={[0, 0, 0]}
      rotation={[0, 0, rads]}
    />
  )
}

function Object(props: {percentage: number}) {
  const {percentage} = props
  const main = useRef<THREE.Mesh>(null)

  const envMap = useCubeTexture(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], {
    path: '/cube/',
  })

  const [material, set] = useState<any>()
  const [torus, setTorus] = useState<THREE.Mesh | null>(null)

  useFrame(({clock, mouse}) => {
    if (torus) {
      torus.rotation.x = percentage * Math.PI * 2
    }
  })

  return (
    <>
      <MeshWobbleMaterial
        ref={set}
        envMap={envMap}
        roughness={0.1}
        metalness={1}
        bumpScale={0.005}
      />
      {material && <MainObject percentage={percentage} material={material} />}
    </>
  )
}

function calculateVerticalPercentage(
  bounds: ClientRect,
  threshold: number = 0,
  root: Window | Element | null | undefined = window,
) {
  if (!root) return 0
  const vh = (root instanceof Element ? root.clientHeight : root.innerHeight) || 0
  const offset = threshold * bounds.height
  const percentage = (bounds.bottom - offset) / (vh + bounds.height - offset * 2)

  return 1 - Math.max(0, Math.min(1, percentage))
}

export const Experiment: FunctionComponent = () => {
  const root = useRef<HTMLDivElement>(null)

  const [percentage, setPercentage] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!root.current) return
      const bounds = root.current.getBoundingClientRect()
      const percentage = calculateVerticalPercentage(bounds)
      setPercentage(percentage)
    }

    window.addEventListener('scroll', handleScroll, {passive: true})
    window.addEventListener('resize', handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  })

  return (
    <div style={{height: '300vh'}}>
      <div ref={root} style={{position: 'absolute', top: '100vh', height: '100vh'}} />
      <div style={{position: 'fixed', top: 0}}>
        <div style={{height: '100vh', width: '100vw'}}>
          <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Suspense fallback={<Html center>Loading.</Html>}>
              <Object percentage={percentage} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  )
}
