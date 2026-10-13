'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Placeholder hero: a low-poly scout character built entirely from primitives —
 * olive/khaki uniform shirt, neckerchief, campaign hat with badges, and blue
 * jeans. Intentionally stylised so it can be swapped for a glTF/GLB model later
 * by replacing the `<group>` contents with `<primitive object={gltf.scene} />`.
 *
 * Palette
 *  shirt  : #7C7A4E (olive)   -> sleeves / torso
 *  accent : #24583E (forest)  -> collar, neckerchief, hat band
 *  jeans  : #2F4A73 (blue)     -> legs
 *  skin   : #D9A87C
 */

const SHIRT = '#7C7A4E';
const SHIRT_DARK = '#5E5C39';
const ACCENT = '#24583E';
const JEANS = '#2F4A73';
const JEANS_DARK = '#243A5C';
const SKIN = '#D9A87C';
const HAT = '#6E6C45';

function ScoutModel({ animated }: { animated: boolean }) {
  const group = useRef<THREE.Group>(null);
  const armLeft = useRef<THREE.Group>(null);
  const armRight = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.position.y = Math.sin(t * 1.4) * 0.045;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.14;
    }
    if (armLeft.current) armLeft.current.rotation.x = Math.sin(t * 1.6) * 0.12;
    if (armRight.current) armRight.current.rotation.x = -Math.sin(t * 1.6) * 0.12;
  });

  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {/* Legs — blue jeans */}
      <mesh position={[-0.19, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.135, 0.115, 0.84, 18]} />
        <meshStandardMaterial color={JEANS} roughness={0.85} />
      </mesh>
      <mesh position={[0.19, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.135, 0.115, 0.84, 18]} />
        <meshStandardMaterial color={JEANS} roughness={0.85} />
      </mesh>

      {/* Boots */}
      <mesh position={[-0.19, 0.04, 0.03]} castShadow>
        <boxGeometry args={[0.23, 0.14, 0.36]} />
        <meshStandardMaterial color="#3A2E22" roughness={0.9} />
      </mesh>
      <mesh position={[0.19, 0.04, 0.03]} castShadow>
        <boxGeometry args={[0.23, 0.14, 0.36]} />
        <meshStandardMaterial color="#3A2E22" roughness={0.9} />
      </mesh>

      {/* Torso — uniform shirt */}
      <mesh position={[0, 1.13, 0]} castShadow>
        <capsuleGeometry args={[0.29, 0.5, 6, 20]} />
        <meshStandardMaterial color={SHIRT} roughness={0.78} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.83, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 22]} />
        <meshStandardMaterial color={SHIRT_DARK} roughness={0.7} />
      </mesh>

      {/* Arms */}
      <group ref={armLeft} position={[-0.33, 1.32, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.42, 4, 14]} />
          <meshStandardMaterial color={SHIRT} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.085, 14, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.9} />
        </mesh>
      </group>

      <group ref={armRight} position={[0.33, 1.32, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.42, 4, 14]} />
          <meshStandardMaterial color={SHIRT} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.085, 14, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.9} />
        </mesh>
      </group>

      {/* Neck + head */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.1, 14]} />
        <meshStandardMaterial color={SKIN} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.74, 0]} castShadow>
        <sphereGeometry args={[0.2, 22, 18]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.84, -0.02]} castShadow>
        <sphereGeometry args={[0.205, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#2E2119" roughness={1} />
      </mesh>

      {/* Campaign hat (wide brim + crown) */}
      <mesh position={[0, 1.93, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.035, 26]} />
        <meshStandardMaterial color={HAT} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.19, 0.14, 22]} />
        <meshStandardMaterial color={HAT} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <torusGeometry args={[0.178, 0.022, 8, 24]} />
        <meshStandardMaterial color={ACCENT} roughness={0.6} />
      </mesh>

      {/* Neckerchief */}
      <mesh position={[0, 1.47, 0.06]}>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color={ACCENT} roughness={0.65} />
      </mesh>

      {/* Scout badge on the sleeve */}
      <mesh position={[-0.42, 1.3, 0.06]}>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 16]} />
        <meshStandardMaterial color="#E3B554" roughness={0.4} metalness={0.35} />
      </mesh>
    </group>
  );
}

function Rig({ animated }: { animated: boolean }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.35} />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#74AE8C" />

      <ScoutModel animated={animated} />

      {/* Ground disc + accent ring to ground the character visually. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial color="#EFE6D1" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.555, 0]}>
        <ringGeometry args={[1.05, 1.5, 64]} />
        <meshBasicMaterial color="#458C66" transparent opacity={0.28} />
      </mesh>
    </>
  );
}

export interface ScoutCanvasProps {
  className?: string;
  /** Disable idle animation for reduced-motion users. */
  animated?: boolean;
  /** DPR cap — keeps the hero cheap on high-density mobile screens. */
  dpr?: [number, number];
}

export default function ScoutCanvas({ className, animated = true, dpr = [1, 1.75] }: ScoutCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={dpr}
      camera={{ position: [0, 1.55, 4.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      shadows={false}
      frameloop={animated ? 'always' : 'demand'}
      aria-label="نموذج ثلاثي الأبعاد لكشاف يرتدي زي الكشافة"
      role="img"
    >
      <Rig animated={animated} />
    </Canvas>
  );
}