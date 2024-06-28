import * as THREE from 'three'
import React, {FunctionComponent, Suspense, useMemo, useRef, useState} from 'react'
import {Canvas, type Euler} from '@react-three/fiber'

import {Html, PerspectiveCamera, Stage, useGLTF} from '@react-three/drei'
import {useSpring, animated} from '@react-spring/three'

interface Model {
  uri: string
  rotation?: {
    x?: number
    y?: number
    z?: number
  }
}

function Object({
  uri,
  rotation,
  position,
}: {
  uri: string
  position: [number, number, number]
  rotation: Euler
}) {
  const main = useRef<THREE.Mesh>(null)

  const {scene} = useGLTF(uri)

  scene.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })
  const {rotation: animatedRotation} = useSpring({rotation})

  return (
    // @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515
    <animated.primitive
      castShadow
      ref={main}
      object={scene}
      position={position}
      rotation={animatedRotation}
    />
  )
}

const degreeToRadians = (deg: number) => {
  return (deg * Math.PI) / 180
}
const degreesToRadians = (degs: [number, number, number]): [number, number, number] => {
  return degs.map(degreeToRadians) as [number, number, number]
}

export const ProductModel: FunctionComponent<{
  model: {
    uri: string
    rotation: [number, number, number]
    intensity: number
  }
}> = (props) => {
  const {model} = props

  const rotation = useMemo<Euler>(() => {
    return degreesToRadians(model.rotation)
  }, [model.rotation])

  const position = useMemo<[number, number, number]>(() => {
    return [0, -0.375, 0]
  }, [])
  const cameraPosition = useMemo<[number, number, number]>(() => {
    return [0, 0, 1.2]
  }, [])

  const {scale: intensity} = useSpring({scale: Math.PI * model.intensity})

  return (
    <Canvas shadows>
      <color attach="background" args={['#f1f1f1']} />
      <fog color="#161616" attach="fog" near={8} far={30} />
      {/* <ambientLight intensity={Math.PI * 0.25} /> */}
      <animated.spotLight
        castShadow
        // color={'#ddffdd'}
        position={[10, 10, 10]}
        angle={0.25}
        penumbra={1}
        decay={0.1}
        intensity={intensity}
      />
      <animated.spotLight
        castShadow
        // color={'#ffddddd'}
        position={[-10, 10, 10]}
        angle={0.25}
        penumbra={1}
        decay={0.1}
        intensity={intensity}
      />
      <animated.pointLight castShadow position={[-10, -10, -10]} decay={0} intensity={intensity} />

      <Suspense fallback={<Html center>Loading...</Html>}>
        <Stage
          intensity={0.5}
          environment={'apartment'}
          shadows={{type: 'contact', bias: -0.001, intensity: Math.PI}}
          adjustCamera={false}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <Object uri={model.uri} position={position} rotation={rotation} />
        </Stage>
      </Suspense>
    </Canvas>
  )
}
