import {animated, useSpring} from '@react-spring/three'
import {Html, PerspectiveCamera, Stage, useGLTF} from '@react-three/drei'
import {Canvas, type Euler} from '@react-three/fiber'
import React, {FunctionComponent, Suspense, useMemo, useRef} from 'react'
import * as THREE from 'three'

function Object({
  rotation,
  position,
  uri,
}: {
  uri: string
  position?: [number, number, number]
  rotation?: Euler
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
  rotations: {pitch: number; yaw: number}
}> = (props) => {
  const rotation = useMemo<Euler>(() => {
    return degreesToRadians([0, props.rotations.yaw, props.rotations.pitch])
  }, [props.rotations.yaw, props.rotations.pitch])

  const position = useMemo<[number, number, number]>(() => {
    return [0, -0.375, 0]
  }, [])
  const cameraPosition = useMemo<[number, number, number]>(() => {
    return [0, 1, 5.2]
  }, [])

  return (
    <Canvas shadows>
      <color attach="background" args={['#f1f1f1']} />
      <fog attach="fog" args={['#161616', 8, 30]} />
      <spotLight
        castShadow
        position={[10, 10, 10]}
        angle={0.25}
        penumbra={1}
        decay={0.1}
        intensity={10}
      />
      <spotLight
        castShadow
        position={[-10, 10, 10]}
        angle={0.25}
        penumbra={1}
        decay={0.1}
        intensity={10}
      />
      <pointLight castShadow position={[-10, -10, -10]} decay={0} intensity={10} />

      <Suspense fallback={<Html center>Loading...</Html>}>
        <Stage
          intensity={0.5}
          environment={'apartment'}
          shadows={{type: 'contact', bias: -0.001, intensity: Math.PI}}
          adjustCamera={false}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <Object uri={'/scene.gltf'} position={position} rotation={rotation} />
        </Stage>
      </Suspense>
    </Canvas>
  )
}
